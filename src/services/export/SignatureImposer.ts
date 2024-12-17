import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Imposition } from '../../models/types';

const execAsync = promisify(exec);

export class SignatureImposer {
    private pluginPath: string;
    private latexPath: string;
    private pdftkPath: string;
    private tempDir: string;

    constructor(pluginPath: string, latexPath: string, pdftkPath: string) {
        this.pluginPath = pluginPath;
        this.latexPath = latexPath;
        this.pdftkPath = pdftkPath;
    }

    async imposeSignatures(
        inputPdf: string,
        imposition: Imposition,
        outputPath: string
    ): Promise<string> {
        try {
            // 1. Créer un dossier temporaire
            this.tempDir = await this.createTempDirectory();

            // 2. Obtenir le nombre de pages du PDF
            const pageCount = await this.getPageCount(inputPdf);

            // 3. Calculer le nombre de pages nécessaires pour les signatures complètes
            const pagesPerSignature = this.getPagesPerSignature(imposition.name);
            const neededPages = Math.ceil(pageCount / pagesPerSignature) * pagesPerSignature;

            // 4. Ajouter des pages blanches si nécessaire
            const paddedPdf = await this.padPages(inputPdf, neededPages);

            // 5. Diviser en segments
            const segments = await this.splitIntoSegments(paddedPdf, pagesPerSignature);

            // 6. Imposer chaque segment
            const imposedSegments = await Promise.all(
                segments.map(segment => this.imposeSegment(segment, imposition))
            );

            // 7. Fusionner les segments imposés
            await this.mergePdfs(imposedSegments, outputPath);

            return outputPath;
        } finally {
            // Nettoyage
            if (this.tempDir) {
                await this.cleanupTempDirectory();
            }
        }
    }

    private async createTempDirectory(): Promise<string> {
        const tempDir = join(this.pluginPath, 'temp', `impose_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });
        return tempDir;
    }

    private async cleanupTempDirectory(): Promise<void> {
        if (this.tempDir) {
            await fs.rm(this.tempDir, { recursive: true, force: true });
        }
    }

    private async getPageCount(pdfPath: string): Promise<number> {
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
        const { stdout } = await execAsync(`${pdftk} "${pdfPath}" dump_data | grep NumberOfPages`);
        return parseInt(stdout.split(':')[1].trim());
    }

    private getPagesPerSignature(impositionName: string): number {
        const match = impositionName.match(/\d+/);
        return match ? parseInt(match[0]) : 16; // Par défaut 16 pages par signature
    }

    private async padPages(pdfPath: string, targetPages: number): Promise<string> {
        const currentPages = await this.getPageCount(pdfPath);
        if (currentPages === targetPages) {
            return pdfPath;
        }

        const outputPath = join(this.tempDir, 'padded.pdf');
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';

        // Créer une page blanche
        const blankPath = await this.createBlankPage();

        // Construire la commande pour ajouter les pages blanches
        let command = `${pdftk} A="${pdfPath}" B="${blankPath}" cat A`;
        for (let i = currentPages + 1; i <= targetPages; i++) {
            command += ' B1';
        }
        command += ` output "${outputPath}"`;

        await execAsync(command);
        return outputPath;
    }

    private async createBlankPage(): Promise<string> {
        const blankTexPath = join(this.tempDir, 'blank.tex');
        const blankPdfPath = join(this.tempDir, 'blank.pdf');

        const blankContent = `
\\documentclass{article}
\\usepackage[margin=0pt,paperwidth=210mm,paperheight=297mm]{geometry}
\\begin{document}
\\thispagestyle{empty}
\\phantom{x}
\\end{document}
`;

        await fs.writeFile(blankTexPath, blankContent);
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        await execAsync(
            `${xelatex} -interaction=nonstopmode "${blankTexPath}"`,
            { cwd: this.tempDir }
        );

        return blankPdfPath;
    }

    private async splitIntoSegments(
        pdfPath: string,
        pagesPerSegment: number
    ): Promise<string[]> {
        const pageCount = await this.getPageCount(pdfPath);
        const segments: string[] = [];
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';

        for (let start = 1; start <= pageCount; start += pagesPerSegment) {
            const end = Math.min(start + pagesPerSegment - 1, pageCount);
            const outputPath = join(this.tempDir, `segment_${start}.pdf`);

            await execAsync(
                `${pdftk} "${pdfPath}" cat ${start}-${end} output "${outputPath}"`
            );
            segments.push(outputPath);
        }

        return segments;
    }

    private async imposeSegment(
        segmentPath: string,
        imposition: Imposition
    ): Promise<string> {
        const outputPath = join(this.tempDir, `imposed_${Date.now()}.pdf`);
        
        // Préparer le fichier LaTeX d'imposition
        const impositionTexPath = join(this.tempDir, 'imposition.tex');
        await fs.writeFile(impositionTexPath, imposition.content || '');

        // Compiler l'imposition
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        await execAsync(
            `${xelatex} -interaction=nonstopmode "${impositionTexPath}"`,
            { cwd: this.tempDir }
        );

        return outputPath;
    }

    private async mergePdfs(pdfPaths: string[], outputPath: string): Promise<void> {
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
        const inputList = pdfPaths.join(' ');
        await execAsync(`${pdftk} ${inputList} cat output "${outputPath}"`);
    }
} 