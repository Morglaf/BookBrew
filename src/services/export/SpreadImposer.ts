import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { execAsync } from '../../utils/execAsync';

export class SpreadImposer {
    private baseCompensation: number = 0;

    constructor(
        private paperThickness: number = 0.1,
        private impositionTemplatePath?: string,
        private latexPath: string = 'xelatex'
    ) {
        if (impositionTemplatePath) {
            this.extractBaseCompensation(impositionTemplatePath);
        }
    }

    private async extractBaseCompensation(templatePath: string): Promise<void> {
        try {
            const content = await fs.readFile(templatePath, 'utf-8');
            const match = content.match(/\\newcommand{\\compensation}{([-\d.]+)mm}/);
            if (match && match[1]) {
                this.baseCompensation = parseFloat(match[1]);
            }
        } catch (error) {
            console.error('Error extracting base compensation:', error);
        }
    }

    private calculateSpreadCompensation(
        segmentIndex: number,
        totalSegments: number
    ): number {
        // Le dernier segment (en bas) n'a que la compensation de base
        // Le premier segment (en haut) a la compensation maximale
        const segmentsAbove = totalSegments - segmentIndex - 1;
        const compensationPerSheet = 2 * this.paperThickness;
        const additionalCompensation = segmentsAbove * 2 * compensationPerSheet;
        const totalCompensation = this.baseCompensation + additionalCompensation;
        
        return totalCompensation;
    }

    private async reorderPagesForSpread(doc: PDFDocument, totalPages: number): Promise<PDFDocument> {
        const newDoc = await PDFDocument.create();
        const pageIndices = [];

        // Créer l'ordre des pages pour le spread (1,n,2,n-1,3,n-2,...)
        for (let i = 0; i < totalPages / 2; i++) {
            pageIndices.push(i); // Page du début
            pageIndices.push(totalPages - 1 - i); // Page correspondante de la fin
        }

        // Copier les pages dans le nouvel ordre
        for (const idx of pageIndices) {
            const [page] = await newDoc.copyPages(doc, [idx]);
            newDoc.addPage(page);
        }

        return newDoc;
    }

    private async createImpositionFile(
        templatePath: string,
        outputPath: string,
        signatureIndex: number,
        totalSignatures: number
    ): Promise<void> {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const totalCompensation = this.calculateSpreadCompensation(signatureIndex, totalSignatures);
        
        const updatedContent = templateContent.replace(
            /\\newcommand{\\compensation}{.*?mm}/,
            `\\newcommand{\\compensation}{${totalCompensation.toFixed(2)}mm}`
        );
        
        await fs.writeFile(outputPath, updatedContent);
    }

    private async compileLatex(texFile: string, workingDir: string): Promise<void> {
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        const command = `"${xelatex}" -interaction=nonstopmode "${texFile}"`;
        try {
            await execAsync(command, { cwd: workingDir });
        } catch (error) {
            throw new Error(`LaTeX compilation failed: ${error.message}\nCommand: ${command}`);
        }
    }

    async impose(
        inputPath: string,
        outputPath: string,
        pagesPerUnit: number,
        impositionTemplatePath: string
    ): Promise<void> {
        if (!impositionTemplatePath) {
            throw new Error('Imposition template path is required for spread imposition');
        }

        // Charger le PDF pour obtenir le nombre de pages
        const pdfBytes = await fs.readFile(inputPath);
        const inputDoc = await PDFDocument.load(pdfBytes);
        const totalPages = inputDoc.getPageCount();

        // Calculer le nombre d'unités nécessaires
        const numberOfUnits = Math.ceil(totalPages / pagesPerUnit);
        const neededPages = numberOfUnits * pagesPerUnit;

        // Créer un dossier temporaire pour l'imposition
        const tempDir = join(dirname(inputPath), `imposition_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });

        // Ajouter des pages blanches si nécessaire
        let workingDoc = inputDoc;
        if (totalPages < neededPages) {
            const paddedDoc = await PDFDocument.create();
            const pages = await paddedDoc.copyPages(inputDoc, inputDoc.getPageIndices());
            pages.forEach(page => paddedDoc.addPage(page));

            // Ajouter des pages blanches
            for (let i = totalPages; i < neededPages; i++) {
                paddedDoc.addPage();
            }
            workingDoc = paddedDoc;
        }

        // Réorganiser toutes les pages selon l'ordre des spreads
        const reorderedDoc = await this.reorderPagesForSpread(workingDoc, neededPages);
        const reorderedPdf = join(tempDir, 'reordered.pdf');
        await fs.writeFile(reorderedPdf, await reorderedDoc.save());

        const imposedPdfs: string[] = [];

        // Pour chaque unité
        for (let i = 0; i < numberOfUnits; i++) {
            const chunkDir = join(tempDir, `chunk_${i + 1}`);
            await fs.mkdir(chunkDir);

            // Extraire les pages pour cette unité
            const start = i * pagesPerUnit;
            const end = start + pagesPerUnit;
            const doc = await PDFDocument.create();
            const sourceDoc = await PDFDocument.load(await fs.readFile(reorderedPdf));
            const pages = await doc.copyPages(sourceDoc, Array.from({ length: pagesPerUnit }, (_, j) => start + j));
            pages.forEach(page => doc.addPage(page));

            // Sauvegarder le PDF de l'unité
            const chunkPdf = join(chunkDir, 'export.pdf');
            await fs.writeFile(chunkPdf, await doc.save());

            // Créer le fichier d'imposition avec compensation
            const impositionFile = join(chunkDir, 'imposition.tex');
            await this.createImpositionFile(
                impositionTemplatePath,
                impositionFile,
                i,
                numberOfUnits
            );

            // Compiler avec XeLaTeX
            await this.compileLatex(impositionFile, chunkDir);

            // Ajouter le PDF résultant à la liste
            const resultPdf = join(chunkDir, 'imposition.pdf');
            if (await this.fileExists(resultPdf)) {
                imposedPdfs.push(resultPdf);
            }
        }

        // Assembler tous les PDFs
        if (imposedPdfs.length > 0) {
            const finalDoc = await PDFDocument.create();
            
            for (const pdfPath of imposedPdfs) {
                const pdfBytes = await fs.readFile(pdfPath);
                const pdf = await PDFDocument.load(pdfBytes);
                const pages = await finalDoc.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => finalDoc.addPage(page));
            }

            const finalPdfBytes = await finalDoc.save();
            await fs.writeFile(outputPath, finalPdfBytes);
        }

        // Nettoyer
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            console.error('Error cleaning up temporary files:', error);
        }
    }

    private async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }
} 