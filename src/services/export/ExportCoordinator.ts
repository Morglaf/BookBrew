import { Vault, TFile } from 'obsidian';
import { ExportOptions, ExportEvent, ExportEventCallback, ExportResult } from '../../types/interfaces';
import { spawn } from 'child_process';
import { join } from 'path';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { execAsync } from '../../utils/execAsync';
import { LatexService } from '../latex/LatexService';
import { SpreadImposer } from './SpreadImposer';
import { CoverGenerator } from './CoverGenerator';
import { getExportPath, getTempPath, getPluginResourcePath } from '../../utils/paths';
import { SignatureImposer } from './SignatureImposer';

export class ExportCoordinator {
    private currentProcess: any = null;
    private eventCallback: ExportEventCallback | null = null;
    private tempDir: string;
    private latex: LatexService;
    private coverGenerator: CoverGenerator;

    constructor(
        private vault: Vault,
        private pluginPath: string,
        private latexPath: string,
        private pandocPath: string,
        private pdftkPath: string
    ) {
        // Créer un dossier temporaire unique pour cette session
        this.tempDir = join(tmpdir(), `bookbrew_${Date.now()}`);
        this.latex = new LatexService(vault, pluginPath, latexPath, pandocPath, pdftkPath);
        this.coverGenerator = new CoverGenerator(pluginPath, latexPath);
    }

    async init(): Promise<void> {
        await this.latex.init();
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
            throw new Error(`Failed to cleanup temporary directory: ${error.message}`);
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

                const coverOutputPath = options.outputPath.replace('.pdf', '_cover.pdf');
                result.cover = await this.coverGenerator.generateCover(
                    options.cover,
                    options.coverFields || {},
                    options.coverThickness || 0,
                    coverOutputPath
                );
            }

            // Imposition si nécessaire
            if (options.imposition) {
                this.emitEvent({
                    type: 'progress',
                    message: 'Applying imposition...',
                    progress: 80
                });

                result.pdf = await this.applyImposition(result.pdf, options);
            } else {
                // No imposition needed, continue with the original PDF
                this.emitEvent({
                    type: 'progress',
                    message: 'Skipping imposition...',
                    progress: 80
                });
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

    private async copyMarkdownImages(content: string): Promise<string> {
        try {
            // Créer le dossier images dans le dossier temporaire
            const tempImagesDir = join(this.tempDir, 'images');
            await fs.mkdir(tempImagesDir, { recursive: true });

            // Créer une copie du contenu pour les modifications
            let updatedContent = content;

            // Extraire tous les chemins d'images du Markdown
            // Format standard Markdown : ![alt](path)
            const standardImageRegex = /!\[.*?\]\((.*?)\)/g;
            // Format Obsidian : ![[path]]
            const obsidianImageRegex = /!\[\[(.*?)\]\]/g;

            const matches = [
                ...content.matchAll(standardImageRegex),
                ...content.matchAll(obsidianImageRegex)
            ];

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

                            // Mettre à jour le chemin dans le contenu Markdown
                            updatedContent = updatedContent.replace(
                                match[0],
                                `![](images/${file.name})`
                            );
                        }
                    } catch (error) {
                        this.emitEvent({
                            type: 'log',
                            message: `Warning: Failed to copy image ${imagePath}: ${error.message}`
                        });
                    }
                }
            }

            return updatedContent;
        } catch (error) {
            throw new Error(`Failed to copy Markdown images: ${error.message}`);
        }
    }

    private async copyResources(): Promise<void> {
        try {
            // Copier tout le dossier typeset
            const typesetPath = join(this.pluginPath, 'typeset');
            const tempTypesetPath = join(this.tempDir, 'typeset');
            
            // Copier récursivement le dossier typeset
            await this.copyDirectory(typesetPath, tempTypesetPath);
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
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);

            if (entry.isDirectory()) {
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
            // Copier toutes les ressources nécessaires
            await this.copyResources();

            // Utiliser le template approprié
            const layoutFile = join(this.tempDir, 'typeset', 'layout', options.template.name + '.tex');
            let templateContent = await fs.readFile(layoutFile, 'utf8');

            // Remplacer les champs dynamiques
            for (const [key, value] of Object.entries(options.dynamicFields || {})) {
                templateContent = templateContent.replace(
                    new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                    value
                );
            }

            // Extraire le contenu principal (tout ce qui n'est pas des commandes de préambule)
            const beginDocIndex = content.indexOf('\\begin{document}');
            const endDocIndex = content.indexOf('\\end{document}');
            
            let mainContent = '';
            if (beginDocIndex !== -1 && endDocIndex !== -1) {
                mainContent = content.substring(
                    beginDocIndex + '\\begin{document}'.length,
                    endDocIndex
                ).trim();
            } else {
                mainContent = content.trim();
            }

            // Insérer le contenu dans le template
            templateContent = templateContent.replace('\\input{content.tex}', mainContent);

            // Écrire le fichier final
            await fs.writeFile(tempFile, templateContent, 'utf8');

            // Compiler avec XeLaTeX
            const xelatex = this.latexPath || 'xelatex';
            const { stdout, stderr } = await execAsync(
                `${xelatex} -interaction=nonstopmode "${tempFile}"`,
                { cwd: this.tempDir }
            );

            fullLog = stdout + '\n' + stderr;

            // Vérifier si le PDF a été généré
            const pdfFile = join(this.tempDir, 'main.pdf');
            if (!await this.fileExists(pdfFile)) {
                throw new Error('PDF file was not generated');
            }

            // S'assurer que le dossier de destination existe
            const outputDir = join(options.outputPath, '..');
            await fs.mkdir(outputDir, { recursive: true });

            // Copier le PDF vers le dossier de sortie
            try {
                await fs.copyFile(pdfFile, options.outputPath);
            } catch (error) {
                throw new Error(`Failed to copy PDF to output path: ${error.message}`);
            }

            return options.outputPath;
        } catch (error) {
            throw new Error(`LaTeX compilation failed: ${error.message}\n\nFull log:\n${fullLog}`);
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

    private async generateCover(options: ExportOptions): Promise<string> {
        if (!options.cover) {
            throw new Error('No cover template selected');
        }

        try {
            const outputPath = options.outputPath.replace('.pdf', '_cover.pdf');
            
            this.emitEvent({
                type: 'progress',
                message: 'Generating cover...',
                progress: 0
            });

            const result = await this.coverGenerator.generateCover(
                options.cover,
                options.coverFields || {},
                options.coverThickness || 0,
                outputPath
            );

            this.emitEvent({
                type: 'progress',
                message: 'Cover generation completed',
                progress: 100
            });

            return result;
        } catch (error) {
            throw new Error(`Cover generation failed: ${error.message}`);
        }
    }

    private async padPdfToMultiple(pdfPath: string, multiple: number): Promise<string> {
        const pdftk = join(this.pdftkPath, 'pdftk');

        // Obtenir le nombre de pages actuel
        const { stdout } = await execAsync(`"${pdftk}" "${pdfPath}" dump_data | findstr NumberOfPages`);
        const currentPages = parseInt(stdout.split(':')[1].trim());

        // Calculer combien de pages blanches sont nécessaires
        const targetPages = Math.ceil(currentPages / multiple) * multiple;
        if (currentPages === targetPages) {
            return pdfPath;
        }

        // Créer une page blanche avec les mêmes dimensions
        const blankPath = join(this.tempDir, 'blank_page.pdf');
        await this.createBlankPdf(blankPath, pdfPath);

        // Ajouter les pages blanches nécessaires
        const paddedPath = join(this.tempDir, 'padded.pdf');
        let command = `"${pdftk}" A="${pdfPath}" B="${blankPath}" cat A`;
        for (let i = currentPages + 1; i <= targetPages; i++) {
            command += ' B1';
        }
        command += ` output "${paddedPath}"`;
        
        await execAsync(command);
        return paddedPath;
    }

    private async applyImposition(pdfPath: string, options: ExportOptions): Promise<string> {
        if (!options.imposition) {
            return pdfPath;
        }

        try {
            const pagesPerChunkMatch = options.imposition.name.match(/(\d+)(signature|spread)/);
            if (!pagesPerChunkMatch) {
                throw new Error("Le nom de l'imposition doit contenir le nombre de pages par unité");
            }
            const pagesPerChunk = parseInt(pagesPerChunkMatch[1]);

            const paddedPdf = await this.padPdfToMultiple(pdfPath, pagesPerChunk);
            const outputPath = options.outputPath.replace('.pdf', '_imposed.pdf');

            if (options.imposition.type === 'spread') {
                // Utiliser SpreadImposer pour les spreads
                const spreadImposer = new SpreadImposer(
                    options.paperThickness || 0.1,
                    join(this.pluginPath, options.imposition.path),
                    this.latexPath
                );

                await spreadImposer.impose(
                    paddedPdf,
                    outputPath,
                    pagesPerChunk,
                    join(this.pluginPath, options.imposition.path)
                );
            } else {
                // Utiliser SignatureImposer pour les signatures
                const signatureImposer = new SignatureImposer(
                    this.pluginPath,
                    this.latexPath,
                    this.pdftkPath
                );

                await signatureImposer.imposeSignatures(
                    paddedPdf,
                    options.imposition,
                    outputPath
                );
            }

            this.emitEvent({
                type: 'log',
                message: `Imposition completed successfully: ${options.imposition.name}`
            });

            return outputPath;
        } catch (error) {
            throw new Error(`Failed to apply imposition: ${error.message}`);
        }
    }

    private async convertToLatex(content: string, options: ExportOptions): Promise<string> {
        const inputFile = join(this.tempDir, 'input.md');
        const outputFile = join(this.tempDir, 'output.tex');

        try {
            // Copier les images du Markdown et obtenir le contenu mis à jour
            const updatedContent = await this.copyMarkdownImages(content);

            // Écrire le contenu Markdown mis à jour dans un fichier temporaire
            await fs.writeFile(inputFile, updatedContent, 'utf8');

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
                            let output = await fs.readFile(outputFile, 'utf8');
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

    private async getPdfDimensions(pdfPath: string): Promise<{ width: number, height: number }> {
        const pdftk = join(this.pdftkPath, 'pdftk');
        const { stdout } = await execAsync(`"${pdftk}" "${pdfPath}" dump_data | findstr "PageMediaDimensions"`);
        
        // Format attendu: "PageMediaDimensions: width height"
        const dimensions = stdout.split(':')[1].trim().split(' ');
        return {
            width: parseFloat(dimensions[0]),
            height: parseFloat(dimensions[1])
        };
    }

    private async createBlankPdf(outputPath: string, sourcePdfPath: string): Promise<void> {
        // Obtenir les dimensions du PDF source
        const dimensions = await this.getPdfDimensions(sourcePdfPath);
        
        const blankTexContent = `
\\documentclass{article}
\\usepackage[paperwidth=${dimensions.width}pt,paperheight=${dimensions.height}pt,margin=0pt]{geometry}
\\begin{document}
\\thispagestyle{empty}
\\phantom{x}
\\end{document}`;

        const texPath = join(this.tempDir, 'blank.tex');
        await fs.writeFile(texPath, blankTexContent);

        const latexCmd = join(this.latexPath, 'xelatex');
        await execAsync(`"${latexCmd}" -interaction=nonstopmode "${texPath}"`, { cwd: this.tempDir });

        // Renommer le fichier blank.pdf en celui demandé
        await fs.rename(join(this.tempDir, 'blank.pdf'), outputPath);
    }
} 