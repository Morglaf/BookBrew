import { Template, Imposition, Cover } from '../../models/types';
import { TemplateManager } from './TemplateManager';
import { ImpositionManager } from './ImpositionManager';
import { CoverManager } from './CoverManager';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { promises as fs } from 'fs';
import { TFile, Vault } from 'obsidian';

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
                `${pandocCmd} -f markdown -t latex --wrap=none --top-level-division=chapter "${tempInputFile}" -o "${outputFile}"`
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

    async applyImposition(inputFile: string, imposition: Imposition, outputFile: string): Promise<void> {
        // Implémenter la logique d'imposition ici
        // Cela dépendra du type d'imposition (signature ou spread)
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
} 