import { Vault, TFile } from 'obsidian';
import { ExportOptions } from './ExportOptions';
import { ExportEvent, ExportEventCallback } from './ExportEvents';
import { spawn } from 'child_process';
import { join } from 'path';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';

interface ExportResult {
    pdf: string;
    cover?: string;
}

export class ExportCoordinator {
    private currentProcess: any = null;
    private eventCallback: ExportEventCallback | null = null;
    private tempDir: string;

    constructor(
        private vault: Vault,
        private pluginPath: string,
        private latexPath: string,
        private pandocPath: string,
        private pdftkPath: string
    ) {
        // Créer un dossier temporaire unique pour cette session
        this.tempDir = join(tmpdir(), `bookbrew_${Date.now()}`);
    }

    public setEventCallback(callback: ExportEventCallback) {
        this.eventCallback = callback;
    }

    public cancelExport() {
        if (this.currentProcess) {
            this.currentProcess.kill();
            this.emitEvent({
                type: 'cancelled',
                message: 'Export cancelled by user'
            });
            this.currentProcess = null;
        }
    }

    private emitEvent(event: ExportEvent) {
        if (this.eventCallback) {
            this.eventCallback(event);
        }
    }

    private async createTempDir(): Promise<void> {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            throw new Error(`Failed to create temporary directory: ${error.message}`);
        }
    }

    private async cleanupTempDir(): Promise<void> {
        try {
            await fs.rm(this.tempDir, { recursive: true, force: true });
        } catch (error) {
            console.error(`Failed to cleanup temporary directory: ${error.message}`);
        }
    }

    public async export(options: ExportOptions): Promise<ExportResult> {
        try {
            // Créer le dossier temporaire au début de l'export
            await this.createTempDir();

            this.emitEvent({
                type: 'progress',
                message: 'Starting export...',
                progress: 0
            });

            // Lecture du contenu du fichier Markdown
            const content = await this.vault.read(options.file);

            // Conversion Markdown vers LaTeX
            this.emitEvent({
                type: 'progress',
                message: 'Converting Markdown to LaTeX...',
                progress: 20
            });

            const latexContent = await this.convertToLatex(content, options);

            // Compilation LaTeX
            this.emitEvent({
                type: 'progress',
                message: 'Compiling LaTeX...',
                progress: 40
            });

            const pdfPath = await this.compileLatex(latexContent, options);

            const result: ExportResult = { pdf: pdfPath };

            // Génération de la couverture si nécessaire
            if (options.cover) {
                this.emitEvent({
                    type: 'progress',
                    message: 'Generating cover...',
                    progress: 60
                });

                const coverPath = await this.generateCover(options);
                result.cover = coverPath;
            }

            // Imposition si nécessaire
            if (options.imposition) {
                this.emitEvent({
                    type: 'progress',
                    message: 'Applying imposition...',
                    progress: 80
                });

                result.pdf = await this.applyImposition(result.pdf, options);
            }

            this.emitEvent({
                type: 'complete',
                message: 'Export completed successfully',
                progress: 100,
                result
            });

            return result;
        } catch (error) {
            // Ne pas nettoyer le dossier temporaire en cas d'erreur pour permettre l'inspection
            this.emitEvent({
                type: 'error',
                message: `Export failed: ${error.message}`,
                error
            });
            throw error;
        }
    }

    private async copyMarkdownImages(content: string): Promise<void> {
        try {
            // Créer le dossier images dans le dossier temporaire
            const tempImagesDir = join(this.tempDir, 'images');
            await fs.mkdir(tempImagesDir, { recursive: true });

            // Extraire tous les chemins d'images du Markdown
            const imageRegex = /!\[.*?\]\((.*?)\)/g;
            const matches = [...content.matchAll(imageRegex)];

            for (const match of matches) {
                const imagePath = match[1];
                if (imagePath) {
                    try {
                        // Obtenir le fichier depuis le vault d'Obsidian
                        const file = this.vault.getAbstractFileByPath(imagePath);
                        if (file instanceof TFile) {
                            // Lire le contenu binaire de l'image
                            const imageContent = await this.vault.readBinary(file);
                            // Écrire l'image dans le dossier temporaire
                            const tempImagePath = join(tempImagesDir, file.name);
                            await fs.writeFile(tempImagePath, Buffer.from(imageContent));
                        }
                    } catch (error) {
                        this.emitEvent({
                            type: 'log',
                            message: `Warning: Failed to copy image ${imagePath}: ${error.message}`
                        });
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to copy Markdown images: ${error.message}`);
        }
    }

    private async copyResources(): Promise<void> {
        try {
            // Copier les polices du layout
            const layoutFontsDir = join(this.pluginPath, 'typeset', 'layout', 'fonts');
            const tempLayoutFontsDir = join(this.tempDir, 'fonts');
            if (await this.directoryExists(layoutFontsDir)) {
                await fs.mkdir(tempLayoutFontsDir, { recursive: true });
                await this.copyDirectory(layoutFontsDir, tempLayoutFontsDir);
            }

            // Copier les polices de la couverture
            const coverFontsDir = join(this.pluginPath, 'typeset', 'cover', 'fonts');
            if (await this.directoryExists(coverFontsDir)) {
                await fs.mkdir(tempLayoutFontsDir, { recursive: true });
                await this.copyDirectory(coverFontsDir, tempLayoutFontsDir);
            }
        } catch (error) {
            throw new Error(`Failed to copy resources: ${error.message}`);
        }
    }

    private async directoryExists(path: string): Promise<boolean> {
        try {
            const stats = await fs.stat(path);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }

    private async copyDirectory(src: string, dest: string): Promise<void> {
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);

            if (entry.isDirectory()) {
                await fs.mkdir(destPath, { recursive: true });
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    private async compileLatex(content: string, options: ExportOptions): Promise<string> {
        const tempFile = join(this.tempDir, 'main.tex');
        let fullLog = '';

        try {
            // Ajouter les packages nécessaires pour le support Unicode
            const contentWithUnicode = `\\documentclass{article}
\\usepackage{xeCJK}
\\usepackage{fontspec}
\\usepackage[UTF8]{inputenc}
\\usepackage[T1]{fontenc}
\\XeTeXlinebreaklocale "ja"
\\XeTeXlinebreakskip = 0pt plus 1pt
\\setmainfont{Times New Roman}
\\setCJKmainfont{IPAMincho}
\\begin{document}
${content}
\\end{document}`;

            // Copier toutes les ressources nécessaires
            await this.copyResources();

            // Écrire le contenu LaTeX dans un fichier temporaire
            await fs.writeFile(tempFile, contentWithUnicode, 'utf8');

            return new Promise((resolve, reject) => {
                // Utiliser xelatex au lieu de pdflatex
                const xelatex = spawn(join(this.latexPath, 'xelatex'), [
                    '-interaction=nonstopmode',
                    '-output-directory=' + this.tempDir,
                    tempFile
                ]);

                let errorOutput = '';

                xelatex.stdout.on('data', (data) => {
                    const output = data.toString();
                    fullLog += output;
                    // Émettre les logs ligne par ligne pour une meilleure lisibilité
                    output.split('\n').forEach((line: string) => {
                        if (line.trim()) {
                            this.emitEvent({
                                type: 'log',
                                message: line
                            });
                        }
                    });
                });

                xelatex.stderr.on('data', (data) => {
                    const output = data.toString();
                    errorOutput += output;
                    fullLog += output;
                    // Émettre les erreurs ligne par ligne
                    output.split('\n').forEach((line: string) => {
                        if (line.trim()) {
                            this.emitEvent({
                                type: 'log',
                                message: `ERROR: ${line}`
                            });
                        }
                    });
                });

                xelatex.on('error', (error) => {
                    // Émettre d'abord les logs
                    this.emitEvent({
                        type: 'log',
                        message: '=== COMPILATION ERROR LOG START ==='
                    });
                    fullLog.split('\n').forEach((line: string) => {
                        if (line.trim()) {
                            this.emitEvent({
                                type: 'log',
                                message: line
                            });
                        }
                    });
                    this.emitEvent({
                        type: 'log',
                        message: '=== COMPILATION ERROR LOG END ==='
                    });
                    
                    // Puis émettre l'erreur
                    reject(new Error(`XeLaTeX process error: ${error.message}`));
                });

                xelatex.on('close', async (code) => {
                    if (code === 0) {
                        // Copier le fichier PDF généré vers le chemin de sortie
                        const tempPdf = join(this.tempDir, 'main.pdf');
                        await fs.copyFile(tempPdf, options.outputPath);
                        resolve(options.outputPath);
                    } else {
                        // Lire le fichier log de LaTeX s'il existe
                        try {
                            const logFile = join(this.tempDir, 'main.log');
                            const logContent = await fs.readFile(logFile, 'utf8');
                            
                            // Émettre le contenu du log de manière structurée
                            this.emitEvent({
                                type: 'log',
                                message: '=== LATEX LOG FILE START ==='
                            });
                            logContent.split('\n').forEach((line: string) => {
                                if (line.trim()) {
                                    this.emitEvent({
                                        type: 'log',
                                        message: line
                                    });
                                }
                            });
                            this.emitEvent({
                                type: 'log',
                                message: '=== LATEX LOG FILE END ==='
                            });

                            // Rechercher les erreurs spécifiques dans le log
                            const errorLines = logContent.split('\n')
                                .filter(line => line.includes('!') || line.includes('Error') || line.includes('Fatal'))
                                .join('\n');

                            reject(new Error(`XeLaTeX failed with code ${code}.\nKey errors found:\n${errorLines || 'No specific errors found in log.'}`));
                        } catch (e) {
                            reject(new Error(`XeLaTeX failed with code ${code}. Could not read log file: ${e.message}`));
                        }
                    }
                });

                this.currentProcess = xelatex;
            });
        } catch (error) {
            // Émettre les logs avant de lancer l'erreur
            this.emitEvent({
                type: 'log',
                message: '=== FINAL ERROR LOG START ==='
            });
            fullLog.split('\n').forEach((line: string) => {
                if (line.trim()) {
                    this.emitEvent({
                        type: 'log',
                        message: line
                    });
                }
            });
            this.emitEvent({
                type: 'log',
                message: '=== FINAL ERROR LOG END ==='
            });
            
            throw new Error(`LaTeX compilation failed: ${error.message}`);
        }
    }

    private async generateCover(options: ExportOptions): Promise<string> {
        // TODO: Implement cover generation
        return Promise.resolve('');
    }

    private async applyImposition(pdfPath: string, options: ExportOptions): Promise<string> {
        // TODO: Implement imposition
        return Promise.resolve(pdfPath);
    }

    private async convertToLatex(content: string, options: ExportOptions): Promise<string> {
        const inputFile = join(this.tempDir, 'input.md');
        const outputFile = join(this.tempDir, 'output.tex');

        try {
            // Copier les images du Markdown
            await this.copyMarkdownImages(content);

            // Écrire le contenu Markdown dans un fichier temporaire
            await fs.writeFile(inputFile, content, 'utf8');

            return new Promise((resolve, reject) => {
                const pandoc = spawn(join(this.pandocPath, 'pandoc'), [
                    '-f', 'markdown',
                    '-t', 'latex',
                    '--standalone',
                    '-o', outputFile,
                    inputFile
                ]);

                let errorOutput = '';

                pandoc.stdout.on('data', (data) => {
                    this.emitEvent({
                        type: 'log',
                        message: data.toString()
                    });
                });

                pandoc.stderr.on('data', (data) => {
                    errorOutput += data;
                    this.emitEvent({
                        type: 'log',
                        message: data.toString()
                    });
                });

                pandoc.on('error', (error) => {
                    reject(new Error(`Pandoc process error: ${error.message}`));
                });

                pandoc.on('close', async (code) => {
                    if (code === 0) {
                        try {
                            const output = await fs.readFile(outputFile, 'utf8');
                            resolve(output);
                        } catch (error) {
                            reject(new Error(`Failed to read pandoc output: ${error.message}`));
                        }
                    } else {
                        reject(new Error(`Pandoc failed with code ${code}: ${errorOutput}`));
                    }
                });

                this.currentProcess = pandoc;
            });
        } catch (error) {
            throw new Error(`Markdown conversion failed: ${error.message}`);
        }
    }
} 