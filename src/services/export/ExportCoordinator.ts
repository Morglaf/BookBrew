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

    private async splitPdfIntoChunks(pdfPath: string, pagesPerChunk: number): Promise<string[]> {
        const pdftk = join(this.pdftkPath, 'pdftk');
        const chunkFiles: string[] = [];

        try {
            // Obtenir le nombre total de pages
            const { stdout } = await execAsync(`"${pdftk}" "${pdfPath}" dump_data | findstr NumberOfPages`);
            const totalPages = parseInt(stdout.split(':')[1].trim());

            // Calculer le nombre de paquets nécessaires
            const numberOfChunks = Math.ceil(totalPages / pagesPerChunk);

            // Créer les paquets
            for (let i = 0; i < numberOfChunks; i++) {
                const startPage = i * pagesPerChunk + 1;
                let endPage = (i + 1) * pagesPerChunk;
                if (endPage > totalPages) endPage = totalPages;

                const chunkPath = join(this.tempDir, `chunk_${i + 1}.pdf`);
                await execAsync(`"${pdftk}" "${pdfPath}" cat ${startPage}-${endPage} output "${chunkPath}"`);
                chunkFiles.push(chunkPath);
            }

            return chunkFiles;
        } catch (error) {
            throw new Error(`Failed to split PDF: ${error.message}`);
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

    private async extractBaseCompensation(impositionPath: string): Promise<number> {
        try {
            const content = await fs.readFile(impositionPath, 'utf8');
            const match = content.match(/\\newcommand{\\compensation}{([-\d.]+)mm}/);
            if (match && match[1]) {
                return parseFloat(match[1]);
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    private calculateSpreadCompensation(
        cahierIndex: number,     // Index du cahier actuel (0 = extérieur)
        totalCahiers: number,    // Nombre total de cahiers
        paperThickness: number,  // Épaisseur du papier en mm
        baseCompensation: number // Compensation initiale du template
    ): number {
        // Pour l'imposition à cheval, le cahier extérieur (index 0) a la plus grande compensation
        // La compensation diminue à mesure qu'on va vers l'intérieur
        const cahiersInternes = totalCahiers - cahierIndex - 1;
        
        // Compensation = Compensation_initiale + (nombre_cahiers_internes × (2 × épaisseur_papier))
        const compensation = baseCompensation + (cahiersInternes * (2 * paperThickness));
        
        return compensation;
    }

    private async reorderPagesForSpread(pdfPath: string, pagesPerChunk: number, impositionPath: string, paperThickness: number = 0.1): Promise<string> {
        const pdftk = join(this.pdftkPath, 'pdftk');
        const outputPath = join(this.tempDir, `reordered_${Date.now()}.pdf`);
        
        try {
            // Obtenir le nombre total de pages
            const { stdout } = await execAsync(`"${pdftk}" "${pdfPath}" dump_data | findstr NumberOfPages`);
            const totalPages = parseInt(stdout.split(':')[1].trim());
            
            // Calculer le nombre de cahiers
            const numberOfChunks = totalPages / 4; // Chaque cahier fait 4 pages
            
            // Extraire la compensation de base du fichier d'imposition
            const baseCompensation = await this.extractBaseCompensation(impositionPath);
            
            // Construire la séquence de pages pour l'imposition à cheval
            let pageSequence = [];
            let compensationSequence = [];
            
            // Pour un document de 12 pages (3 cahiers) :
            // Cahier 1 (extérieur) : 11,12,2,1
            // Cahier 2            : 9,10,4,3
            // Cahier 3 (intérieur): 7,8,6,5
            
            for (let i = 0; i < numberOfChunks; i++) {
                const outerPage = totalPages - (i * 2);    // Pages extérieures (11,12 puis 9,10 puis 7,8)
                const innerPage = 2 + (i * 2);             // Pages intérieures (2,1 puis 4,3 puis 6,5)
                
                // Calculer la compensation pour ce cahier
                const compensation = this.calculateSpreadCompensation(i, numberOfChunks, paperThickness, baseCompensation);
                
                // Ajouter les pages dans l'ordre pour ce cahier
                pageSequence.push(outerPage - 1);  // 11 puis 9 puis 7
                pageSequence.push(outerPage);      // 12 puis 10 puis 8
                pageSequence.push(innerPage);      // 2 puis 4 puis 6
                pageSequence.push(innerPage - 1);  // 1 puis 3 puis 5
                
                // Ajouter la compensation pour chaque page du cahier
                compensationSequence.push(compensation);
                compensationSequence.push(compensation);
                compensationSequence.push(compensation);
                compensationSequence.push(compensation);
            }

            // Vérifier que tous les numéros de pages sont valides
            if (pageSequence.some(p => p <= 0 || p > totalPages)) {
                throw new Error(`Invalid page numbers generated. Total pages: ${totalPages}, Sequence: ${pageSequence.join(',')}`);
            }

            // Construire la commande pdftk
            const command = `"${pdftk}" "${pdfPath}" cat ${pageSequence.join(' ')} output "${outputPath}"`;
            await execAsync(command);
            
            return outputPath;
        } catch (error) {
            throw new Error(`Failed to reorder pages: ${error.message}`);
        }
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

            let pdfToSplit = paddedPdf;
            let compensationSequence: number[] = [];
            
            if (options.imposition.type === 'spread') {
                const impositionPath = join(this.pluginPath, options.imposition.path);
                const baseCompensation = await this.extractBaseCompensation(impositionPath);
                
                const pdftk = join(this.pdftkPath, 'pdftk');
                const { stdout } = await execAsync(`"${pdftk}" "${paddedPdf}" dump_data | findstr NumberOfPages`);
                const totalPages = parseInt(stdout.split(':')[1].trim());
                const numberOfChunks = totalPages / 4;
                
                for (let i = 0; i < numberOfChunks; i++) {
                    const compensation = this.calculateSpreadCompensation(
                        i,
                        numberOfChunks,
                        options.paperThickness || 0.1,
                        baseCompensation
                    );
                    compensationSequence.push(compensation);
                    compensationSequence.push(compensation);
                    compensationSequence.push(compensation);
                    compensationSequence.push(compensation);
                }
                
                pdfToSplit = await this.reorderPagesForSpread(
                    paddedPdf,
                    pagesPerChunk,
                    impositionPath,
                    options.paperThickness
                );
            }

            const chunks = await this.splitPdfIntoChunks(pdfToSplit, pagesPerChunk);
            const imposedChunks: string[] = [];

            for (let i = 0; i < chunks.length; i++) {
                const chunkDir = join(this.tempDir, `chunk_${i + 1}`);
                await fs.mkdir(chunkDir, { recursive: true });

                const chunkFile = join(chunkDir, 'export.pdf');
                await fs.copyFile(chunks[i], chunkFile);

                const impositionPath = join(this.pluginPath, options.imposition.path);
                let impositionContent = await fs.readFile(impositionPath, 'utf8');

                if (options.imposition.type === 'spread' && compensationSequence[i]) {
                    impositionContent = impositionContent.replace(
                        /\\newcommand{\\compensation}{.*?}/,
                        `\\newcommand{\\compensation}{${compensationSequence[i]}mm}`
                    );
                }

                const impositionFile = join(chunkDir, 'imposition.tex');
                await fs.writeFile(impositionFile, impositionContent);

                const latexCmd = join(this.latexPath, 'xelatex');
                await execAsync(`"${latexCmd}" -interaction=nonstopmode "${impositionFile}"`, { cwd: chunkDir });

                const resultFile = join(chunkDir, 'imposition.pdf');
                if (!await this.fileExists(resultFile)) {
                    throw new Error(`Imposition failed for chunk ${i + 1}`);
                }

                imposedChunks.push(resultFile);
            }

            const finalPdf = join(this.tempDir, 'final_imposed.pdf');
            if (imposedChunks.length > 0) {
                const pdftk = join(this.pdftkPath, 'pdftk');
                const quotedPaths = imposedChunks.map(f => `"${f}"`).join(' ');
                await execAsync(`"${pdftk}" ${quotedPaths} cat output "${finalPdf}"`);
            } else {
                throw new Error('No imposed chunks to merge');
            }

            const outputPath = options.outputPath.replace('.pdf', '_imposed.pdf');
            await fs.copyFile(finalPdf, outputPath);

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
} 