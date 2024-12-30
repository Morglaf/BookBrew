import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { platform } from 'os';
import { Imposition } from '../../models/types';

const execAsync = promisify(exec);

export class SignatureImposer {
    private pluginPath: string;
    private latexPath: string;
    private pdftkPath: string;
    private tempDir: string;
    private isWindows: boolean;

    constructor(pluginPath: string, latexPath: string, pdftkPath: string) {
        this.pluginPath = pluginPath;
        this.latexPath = latexPath;
        this.pdftkPath = pdftkPath;
        this.isWindows = platform() === 'win32';
    }

    async imposeSignatures(
        inputPdf: string,
        imposition: Imposition,
        outputPath: string
    ): Promise<string> {
        try {
            // 1. Créer un dossier temporaire
            this.tempDir = await this.createTempDirectory(inputPdf);

            // 2. Obtenir le nombre de pages du PDF
            const pageCount = await this.getPageCount(inputPdf);

            // 3. Calculer le nombre de pages par signature
            const pagesPerSignature = this.getPagesPerSignature(imposition.name);

            // 4. Calculer le nombre de signatures nécessaires
            const numberOfSignatures = Math.ceil(pageCount / pagesPerSignature);
            const neededPages = numberOfSignatures * pagesPerSignature;

            // 5. Ajouter des pages blanches si nécessaire
            const paddedPdf = await this.padPages(inputPdf, neededPages);

            // 6. Créer un dossier pour chaque signature
            const imposedPdfs: string[] = [];
            for (let i = 0; i < numberOfSignatures; i++) {
                const signatureDir = join(this.tempDir, `signature_${i + 1}`);
                await fs.mkdir(signatureDir);

                // Extraire les pages pour cette signature
                const start = i * pagesPerSignature + 1;
                const end = Math.min((i + 1) * pagesPerSignature, neededPages);
                const signaturePdf = join(signatureDir, 'export.pdf');
                const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
                const pdftkCmd = this.isWindows ? `"${pdftk}"` : pdftk;
                await execAsync(
                    `${pdftkCmd} "${paddedPdf}" cat ${start}-${end} output "${signaturePdf}"`
                );

                // Créer le fichier d'imposition LaTeX
                const impositionTexPath = join(signatureDir, 'imposition.tex');
                await fs.writeFile(impositionTexPath, imposition.content || '');

                // Compiler avec XeLaTeX
                const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
                const xelatexCmd = this.isWindows ? `"${xelatex}"` : xelatex;

                try {
                    await execAsync(
                        `${xelatexCmd} -interaction=nonstopmode "${impositionTexPath}"`,
                        { 
                            cwd: signatureDir,
                            env: {
                                ...process.env,
                                TEXINPUTS: `.${this.isWindows ? ';' : ':'}${signatureDir}${this.isWindows ? ';' : ':'}${this.pluginPath}${this.isWindows ? ';' : ':'}${join(this.pluginPath, 'typeset')}`
                            }
                        }
                    );

                    const resultPdf = join(signatureDir, 'imposition.pdf');
                    if (await this.fileExists(resultPdf)) {
                        imposedPdfs.push(resultPdf);
                    }
                } catch (error) {
                    const logFile = join(signatureDir, 'imposition.log');
                    let errorMessage = error.message;
                    try {
                        const log = await fs.readFile(logFile, 'utf8');
                        errorMessage += `\nLaTeX log:\n${log}`;
                    } catch (logError) {
                        // Ignorer l'erreur si on ne peut pas lire le log
                    }
                    throw new Error(`LaTeX compilation failed: ${errorMessage}`);
                }
            }

            // 7. Fusionner tous les PDFs imposés
            await this.mergePdfs(imposedPdfs, outputPath);

            return outputPath;
        } finally {
            // Nettoyage
            if (this.tempDir) {
                await this.cleanupTempDirectory();
            }
        }
    }

    private getPagesPerSignature(impositionName: string): number {
        const match = impositionName.match(/(\d+)signature/);
        if (!match) {
            throw new Error('Invalid imposition name: must contain number followed by "signature"');
        }
        return parseInt(match[1]);
    }

    private async getPageCount(pdfPath: string): Promise<number> {
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
        const pdftkCmd = this.isWindows ? `"${pdftk}"` : pdftk;
        const grepCmd = this.isWindows ? 'findstr' : 'grep';
        
        const { stdout } = await execAsync(`${pdftkCmd} "${pdfPath}" dump_data | ${grepCmd} NumberOfPages`);
        return parseInt(stdout.split(':')[1].trim());
    }

    private async padPages(pdfPath: string, targetPages: number): Promise<string> {
        const currentPages = await this.getPageCount(pdfPath);
        if (currentPages === targetPages) {
            return pdfPath;
        }

        const outputPath = join(this.tempDir, 'padded.pdf');
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
        const pdftkCmd = this.isWindows ? `"${pdftk}"` : pdftk;

        // Créer une page blanche
        const blankPath = await this.createBlankPage();

        // Construire la commande pour ajouter les pages blanches
        let command = `${pdftkCmd} A="${pdfPath}" B="${blankPath}" cat A`;
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
        const xelatexCmd = this.isWindows ? `"${xelatex}"` : xelatex;
        
        await execAsync(
            `${xelatexCmd} -interaction=nonstopmode "${blankTexPath}"`,
            { 
                cwd: this.tempDir,
                env: {
                    ...process.env,
                    TEXINPUTS: `.${this.isWindows ? ';' : ':'}${this.tempDir}`
                }
            }
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
        const pdftkCmd = this.isWindows ? `"${pdftk}"` : pdftk;

        for (let start = 1; start <= pageCount; start += pagesPerSegment) {
            const end = Math.min(start + pagesPerSegment - 1, pageCount);
            const outputPath = join(this.tempDir, `segment_${start}.pdf`);

            await execAsync(
                `${pdftkCmd} "${pdfPath}" cat ${start}-${end} output "${outputPath}"`
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
        
        // Copier le segment PDF
        await fs.copyFile(segmentPath, join(this.tempDir, 'export.pdf'));

        // Créer le fichier d'imposition LaTeX
        const impositionTexPath = join(this.tempDir, 'imposition.tex');
        await fs.writeFile(impositionTexPath, imposition.content || '');

        // Compiler avec XeLaTeX
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        const xelatexCmd = this.isWindows ? `"${xelatex}"` : xelatex;

        try {
            await execAsync(
                `${xelatexCmd} -interaction=nonstopmode "${impositionTexPath}"`,
                { 
                    cwd: this.tempDir,
                    env: {
                        ...process.env,
                        TEXINPUTS: `.${this.isWindows ? ';' : ':'}${this.tempDir}${this.isWindows ? ';' : ':'}${this.pluginPath}${this.isWindows ? ';' : ':'}${join(this.pluginPath, 'typeset')}`
                    }
                }
            );

            const resultPdf = join(this.tempDir, 'imposition.pdf');
            if (await this.fileExists(resultPdf)) {
                await fs.copyFile(resultPdf, outputPath);
                return outputPath;
            } else {
                throw new Error('Failed to generate imposed PDF');
            }
        } catch (error) {
            const logFile = join(this.tempDir, 'imposition.log');
            let errorMessage = error.message;
            try {
                const log = await fs.readFile(logFile, 'utf8');
                errorMessage += `\nLaTeX log:\n${log}`;
            } catch (logError) {
                // Ignorer l'erreur si on ne peut pas lire le log
            }
            throw new Error(`LaTeX compilation failed: ${errorMessage}`);
        }
    }

    private async mergePdfs(pdfPaths: string[], outputPath: string): Promise<void> {
        const pdftk = this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
        const pdftkCmd = this.isWindows ? `"${pdftk}"` : pdftk;
        const quotedPaths = pdfPaths.map(p => `"${p}"`).join(' ');
        await execAsync(`${pdftkCmd} ${quotedPaths} cat output "${outputPath}"`);
    }

    private async createTempDirectory(inputPath: string): Promise<string> {
        const tempDir = join(dirname(inputPath), `imposition_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });
        return tempDir;
    }

    private async cleanupTempDirectory(): Promise<void> {
        if (this.tempDir) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await fs.rm(this.tempDir, { recursive: true, force: true });
            } catch (error) {
                console.warn('Failed to cleanup temporary directory:', error);
            }
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