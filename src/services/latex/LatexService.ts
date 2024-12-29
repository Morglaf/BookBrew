import { Template, Imposition, Cover } from '../../models/types';
import { TemplateManager } from './TemplateManager';
import { ImpositionManager } from './ImpositionManager';
import { CoverManager } from './CoverManager';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { promises as fs } from 'fs';
import { TFile, Vault } from 'obsidian';
import { SpreadImposer } from '../export/SpreadImposer';

const execAsync = promisify(exec);

export class LatexService {
    private templateManager: TemplateManager;
    private impositionManager: ImpositionManager;
    private coverManager: CoverManager;
    private pluginPath: string;
    private latexPath: string;
    private pandocPath: string;
    private pdftkPath: string;

    constructor(
        private vault: Vault,
        pluginPath: string,
        latexPath: string = '',
        pandocPath: string = '',
        pdftkPath: string = ''
    ) {
        this.pluginPath = pluginPath;
        this.latexPath = latexPath;
        this.pandocPath = pandocPath;
        this.pdftkPath = pdftkPath;

        this.templateManager = new TemplateManager(pluginPath);
        this.impositionManager = new ImpositionManager(pluginPath);
        this.coverManager = new CoverManager(pluginPath);
    }

    async init(): Promise<void> {
        await Promise.all([
            this.templateManager.loadTemplates(),
            this.impositionManager.loadImpositions(),
            this.coverManager.loadCovers()
        ]);
    }

    // Méthodes d'accès aux gestionnaires
    get templates(): Template[] {
        return this.templateManager.getTemplates();
    }

    get impositions(): Imposition[] {
        return this.impositionManager.getImpositions();
    }

    get covers(): Cover[] {
        return this.coverManager.getCovers();
    }

    findTemplate(name: string): Template | undefined {
        return this.templateManager.findTemplate(name);
    }

    getImpositionsForFormat(format: string): Imposition[] {
        return this.impositionManager.getImpositionsForFormat(format);
    }

    getCoversForFormat(format: string): Cover[] {
        return this.coverManager.getCoversForFormat(format);
    }

    async updateTemplateContent(template: Template, content: string): Promise<void> {
        await this.templateManager.updateTemplateContent(template, content);
    }

    // Méthodes de compilation LaTeX
    private getLatexCommand(): string {
        return this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
    }

    private getPandocCommand(): string {
        return this.pandocPath ? join(this.pandocPath, 'pandoc') : 'pandoc';
    }

    private getPdftkCommand(): string {
        return this.pdftkPath ? join(this.pdftkPath, 'pdftk') : 'pdftk';
    }

    async compileLatex(inputFile: string, workingDir: string): Promise<void> {
        const latexCmd = this.getLatexCommand();
        try {
            await execAsync(`${latexCmd} -interaction=nonstopmode ${inputFile}`, { cwd: workingDir });
        } catch (error) {
            throw error;
        }
    }

    async convertMarkdownToLatex(markdownContent: string, outputFile: string): Promise<void> {
        const pandocCmd = this.getPandocCommand();
        try {
            // Écrire d'abord le contenu markdown dans un fichier temporaire
            const tempInputFile = join(this.pluginPath, 'temp', 'input.md');
            await fs.mkdir(join(this.pluginPath, 'temp'), { recursive: true });
            await fs.writeFile(tempInputFile, markdownContent, 'utf8');

            // Utiliser le fichier temporaire comme entrée
            await execAsync(
                `${pandocCmd} -f markdown -t latex "${tempInputFile}" -o "${outputFile}"`
            );

            // Nettoyer le fichier temporaire
            await fs.unlink(tempInputFile);
        } catch (error) {
            throw error;
        }
    }

    // Méthodes de manipulation PDF
    async mergePDFs(inputFiles: string[], outputFile: string): Promise<void> {
        const pdftk = this.getPdftkCommand();
        try {
            await execAsync(`${pdftk} ${inputFiles.join(' ')} cat output "${outputFile}"`);
        } catch (error) {
            throw error;
        }
    }

    private async getPageCount(pdfPath: string): Promise<number> {
        const pdftkCmd = this.getPdftkCommand();
        try {
            // Obtenir les données du PDF
            const { stdout } = await execAsync(`"${pdftkCmd}" "${pdfPath}" dump_data`);
            
            // Chercher la ligne contenant NumberOfPages
            const lines = stdout.split('\n');
            for (const line of lines) {
                if (line.includes('NumberOfPages')) {
                    return parseInt(line.split(':')[1].trim());
                }
            }
            throw new Error('Unable to determine page count');
        } catch (error) {
            throw new Error(`Failed to get page count: ${error.message}`);
        }
    }

    private escapeLatexPath(path: string): string {
        // Échapper les caractères spéciaux LaTeX dans les chemins
        return path.replace(/([~#$%&{}_\[\]])/g, '\\$1');
    }

    async applyImposition(inputFile: string, imposition: Imposition, outputFile: string, paperThickness?: number): Promise<void> {
        try {
            // Créer un dossier temporaire pour l'imposition
            const tempDir = join(this.pluginPath, 'temp', `imposition_${Date.now()}`);
            await fs.mkdir(tempDir, { recursive: true });

            // Extraire le nombre de pages par cahier du nom de l'imposition
            const pagesPerUnitMatch = imposition.name.match(/(\d+)(signature|spread)/);
            if (!pagesPerUnitMatch) {
                throw new Error("Le nom de l'imposition doit contenir le nombre de pages par unité");
            }
            const pagesPerUnit = parseInt(pagesPerUnitMatch[1]);

            // Obtenir le nombre de pages du PDF d'entrée
            const currentPages = await this.getPageCount(inputFile);
            console.log('Current page count:', currentPages);

            // Calculer le nombre de pages nécessaires pour avoir des cahiers complets
            const neededPages = Math.ceil(currentPages / pagesPerUnit) * pagesPerUnit;
            console.log('Pages needed for complete signatures:', neededPages);

            // Si nous avons besoin d'ajouter des pages blanches
            let pdfToImpose = inputFile;
            if (neededPages > currentPages) {
                console.log('Adding blank pages:', neededPages - currentPages);
                
                // Créer une page blanche
                const blankTexPath = join(tempDir, 'blank.tex');
                const blankPdfPath = join(tempDir, 'blank.pdf');
                const blankContent = `
\\documentclass[]{article}
\\usepackage[margin=0pt]{geometry}
\\begin{document}
\\thispagestyle{empty}
\\phantom{x}
\\end{document}
`;
                await fs.writeFile(blankTexPath, blankContent);
                const latexCmd = this.getLatexCommand();
                await execAsync(`"${latexCmd}" -interaction=nonstopmode "${blankTexPath}"`, { cwd: tempDir });

                // Ajouter les pages blanches nécessaires
                const paddedPdfPath = join(tempDir, 'padded.pdf');
                const pdftkCmd = this.getPdftkCommand();
                let command = `"${pdftkCmd}" A="${inputFile}" B="${blankPdfPath}" cat A`;
                for (let i = currentPages + 1; i <= neededPages; i++) {
                    command += ' B1';
                }
                command += ` output "${paddedPdfPath}"`;
                await execAsync(command);
                pdfToImpose = paddedPdfPath;
            }

            // Copier le fichier d'entrée (potentiellement complété) dans le dossier temporaire
            const tempInputFile = join(tempDir, 'input.pdf');
            await fs.copyFile(pdfToImpose, tempInputFile);

            // Lire le contenu du fichier d'imposition
            const impositionPath = join(this.pluginPath, imposition.path);
            let impositionContent = await fs.readFile(impositionPath, 'utf8');

            // Remplacer les variables dans le fichier d'imposition
            const escapedInputPath = this.escapeLatexPath('input.pdf');
            impositionContent = impositionContent
                .replace(/\\def\\inputfile\{\}/g, `\\def\\inputfile{${escapedInputPath}}`)
                .replace(/\\def\\compensation\{\}/g, `\\def\\compensation{${paperThickness || 0}mm}`);

            // Écrire le fichier d'imposition modifié
            const impositionFile = join(tempDir, 'imposition.tex');
            await fs.writeFile(impositionFile, impositionContent);

            // Compiler le fichier d'imposition
            const latexCmd = this.getLatexCommand();
            await execAsync(`"${latexCmd}" -interaction=nonstopmode "${impositionFile}"`, { cwd: tempDir });

            // Copier le fichier résultant vers la destination
            const resultFile = join(tempDir, 'imposition.pdf');
            await fs.copyFile(resultFile, outputFile);

            // Nettoyage
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            throw new Error(`Failed to apply imposition: ${error.message}`);
        }
    }

    // Méthodes utilitaires
    calculateSpineWidth(pageCount: number, paperThickness: number): number {
        return pageCount * paperThickness;
    }

    async parseYAMLFields(file: TFile): Promise<Record<string, any>> {
        const content = await this.vault.read(file);
        const yamlRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(yamlRegex);
        const fields: Record<string, any> = {};
        
        if (match) {
            const yamlContent = match[1];
            const lines = yamlContent.split('\n');
            for (const line of lines) {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join(':').trim();
                    if (value) {
                        fields[key.trim()] = value;
                    }
                }
            }
        }
        
        return fields;
    }

    // Nouvelles méthodes publiques pour les toggles
    getTemplateToggles(template: Template): string[] {
        return this.templateManager.getTemplateToggles(template);
    }

    async updateTemplateToggle(template: Template, toggleName: string, value: boolean): Promise<void> {
        await this.templateManager.updateTemplateToggle(template, toggleName, value);
    }
} 