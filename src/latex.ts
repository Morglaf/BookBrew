import { TFile, normalizePath, Vault } from 'obsidian';
import { BookBrewSettings } from './settings';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { platform } from 'os';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

interface Template {
    name: string;
    path: string;
    content?: string;
}

interface Imposition {
    name: string;
    path: string;
    content?: string;
}

interface Cover {
    name: string;
    path: string;
    content?: string;
}

export class LaTeXManager {
    private settings: BookBrewSettings;
    private templatesPath: string;
    private impositionsPath: string;
    private coversPath: string;
    private isLatexAvailable: boolean = false;
    private isPandocAvailable: boolean = false;
    private isPdftkAvailable: boolean = false;
    private vault: Vault;
    public templates: Template[] = [];
    public impositions: Imposition[] = [];
    public covers: Template[] = [];

    constructor(settings: BookBrewSettings, vault: Vault) {
        this.settings = settings;
        this.vault = vault;
        this.templatesPath = 'typeset/layout';
        this.impositionsPath = 'typeset/impose';
        this.coversPath = 'typeset/cover';
    }

    private getPluginPath(): string {
        const pluginDir = (this.vault.adapter as any).basePath;
        const pluginPath = join(pluginDir, '.obsidian', 'plugins', 'bookbrew');
        console.log('Plugin path:', pluginPath);
        return pluginPath;
    }

    async init(): Promise<void> {
        this.isLatexAvailable = await this.checkLatexAvailability();
        this.isPandocAvailable = await this.checkPandocAvailability();
        this.isPdftkAvailable = await this.checkPdftkAvailability();
        await this.initializeTypesetDirectories();
        await this.loadTemplates();
        await this.loadImpositions();
        await this.loadCovers();
    }

    private async initializeTypesetDirectories(): Promise<void> {
        try {
            console.log('Initializing typeset directories...');
            const baseDir = join(this.getPluginPath(), 'typeset');
            console.log('Creating base directory:', baseDir);
            
            if (!existsSync(baseDir)) {
                await fs.mkdir(baseDir, { recursive: true });
            }

            const dirs = [
                join(baseDir, 'layout'),
                join(baseDir, 'impose'),
                join(baseDir, 'cover')
            ];

            for (const dir of dirs) {
                console.log('Creating directory:', dir);
                if (!existsSync(dir)) {
                    await fs.mkdir(dir, { recursive: true });
                }
            }
        } catch (error) {
            console.error('Error initializing directories:', error);
        }
    }

    private async checkLatexAvailability(): Promise<boolean> {
        const customPath = this.settings.latexPath;
        const xelatex = customPath 
            ? join(customPath, 'xelatex')
            : 'xelatex';
        
        try {
            const { stdout } = await execAsync(`${xelatex} --version`);
            return stdout.toLowerCase().includes('xetex');
        } catch (error) {
            console.error('XeLaTeX not found:', error);
            return false;
        }
    }

    private async checkPandocAvailability(): Promise<boolean> {
        const customPath = this.settings.pandocPath;
        
        try {
            const cmd = customPath 
                ? join(customPath, 'pandoc')
                : 'pandoc';

            const { stdout } = await execAsync(`${cmd} --version`);
            return stdout.toLowerCase().includes('pandoc');
        } catch (error) {
            console.error('Pandoc not found:', error);
            return false;
        }
    }

    private async checkPdftkAvailability(): Promise<boolean> {
        const customPath = this.settings.pdftkPath;
        const pdftk = customPath 
            ? join(customPath, 'pdftk')
            : 'pdftk';
        
        try {
            const { stdout } = await execAsync(`${pdftk} --version`);
            return stdout.toLowerCase().includes('pdftk');
        } catch (error) {
            console.error('PDFtk not found:', error);
            return false;
        }
    }

    private getLatexCommand(): string {
        return this.settings.latexPath
            ? join(this.settings.latexPath, 'xelatex')
            : 'xelatex';
    }

    private getPandocCommand(): string {
        return this.settings.pandocPath
            ? join(this.settings.pandocPath, 'pandoc')
            : 'pandoc';
    }

    private getPdftkCommand(): string {
        return this.settings.pdftkPath
            ? join(this.settings.pdftkPath, 'pdftk')
            : 'pdftk';
    }

    async loadTemplates(): Promise<Template[]> {
        const templates: Template[] = [];
        try {
            const fullTemplatesPath = join(this.getPluginPath(), this.templatesPath);
            console.log('Checking templates path:', fullTemplatesPath);
            
            if (!existsSync(fullTemplatesPath)) {
                console.log('Templates directory not found:', fullTemplatesPath);
                return templates;
            }

            const files = await fs.readdir(fullTemplatesPath);
            console.log('Found template files:', files);
            
            for (const file of files) {
                if (!file.endsWith('.tex')) continue;
                
                try {
                    const filePath = join(fullTemplatesPath, file);
                    console.log('Loading template:', filePath);
                    const content = await fs.readFile(filePath, 'utf8');
                    templates.push({
                        name: basename(file, '.tex'),
                        path: filePath,
                        content
                    });
                } catch (error) {
                    console.error(`Error loading template ${file}:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
        
        this.templates = templates;
        return templates;
    }

    private extractDynamicFields(content: string): string[] {
        const fields = new Set<string>();
        const regex = /\\def\\([a-zA-Z]+){}/g;
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            fields.add(match[1]);
        }
        
        return Array.from(fields);
    }

    async loadImpositions(): Promise<Imposition[]> {
        const impositions: Imposition[] = [];
        try {
            const fullImpositionsPath = join(this.getPluginPath(), this.impositionsPath);
            console.log('Checking impositions path:', fullImpositionsPath);
            
            if (!existsSync(fullImpositionsPath)) {
                console.log('Impositions directory not found:', fullImpositionsPath);
                return impositions;
            }

            const files = await fs.readdir(fullImpositionsPath);
            console.log('Found imposition files:', files);
            
            for (const file of files) {
                if (!file.endsWith('.tex')) continue;
                
                try {
                    const filePath = join(fullImpositionsPath, file);
                    console.log('Loading imposition:', filePath);
                    const content = await fs.readFile(filePath, 'utf8');
                    const format = this.extractImpositionFormat(content);
                    impositions.push({
                        name: basename(file, '.tex'),
                        path: filePath,
                        content
                    });
                } catch (error) {
                    console.error(`Error loading imposition ${file}:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading impositions:', error);
        }
        
        this.impositions = impositions;
        return impositions;
    }

    private extractImpositionFormat(content: string): string {
        const formatRegex = /%\s*Format:\s*(.+)$/m;
        const match = content.match(formatRegex);
        return match ? match[1].trim() : 'unknown';
    }

    async convertMarkdownToLatex(markdownContent: string, tempDir: string): Promise<string> {
        if (!this.isPandocAvailable) {
            throw new Error('Pandoc is not available');
        }

        const inputFile = join(tempDir, 'input.md');
        const outputFile = join(tempDir, 'output.tex');

        await fs.writeFile(inputFile, markdownContent, 'utf8');

        const pandocCmd = this.getPandocCommand();
        const args = [
            ...this.settings.pandocArgs,
            '-o', outputFile,
            inputFile
        ];

        try {
            await this.runPandocCommand(pandocCmd, args, tempDir);
            const latex = await fs.readFile(outputFile, 'utf8');
            return latex;
        } catch (error) {
            console.error('Error converting Markdown to LaTeX:', error);
            throw error;
        }
    }

    async parseYAMLFields(file: TFile): Promise<{ [key: string]: string }> {
        const content = await this.vault.cachedRead(file);
        const yamlRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(yamlRegex);
        
        if (!match) return {};
        
        const yamlContent = match[1];
        const fields: { [key: string]: string } = {};
        
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
        
        return fields;
    }

    async generatePDF(
        template: Template,
        fields: { [key: string]: string },
        markdownContent: string,
        outputPath: string,
        imposition?: Imposition
    ): Promise<string> {
        if (!this.isLatexAvailable) {
            throw new Error('LaTeX is not available');
        }
        if (!this.isPandocAvailable) {
            throw new Error('Pandoc is not available');
        }

        const tempDir = await this.createTempDirectory();
        try {
            // 1. Convert Markdown to LaTeX
            const contentLatex = await this.convertMarkdownToLatex(markdownContent, tempDir);

            // 2. Copy template to temp directory
            const templateContent = await this.vault.adapter.read(template.path);
            const templateFile = join(tempDir, 'template.tex');
            await fs.writeFile(templateFile, templateContent, 'utf8');

            // 3. Replace fields in template
            let finalLatex = templateContent;
            for (const [key, value] of Object.entries(fields)) {
                finalLatex = finalLatex.replace(new RegExp(`\\\\def\\\\${key}\\{\\}`, 'g'), `\\def\\${key}{${value}}`);
            }

            // 4. Insert converted content
            finalLatex = finalLatex.replace('\\begin{document}', '\\begin{document}\n' + contentLatex);

            // 5. Write final LaTeX file
            const mainFile = join(tempDir, 'main.tex');
            await fs.writeFile(mainFile, finalLatex, 'utf8');

            // 6. Run LaTeX command
            const latexCmd = this.getLatexCommand();
            await this.runLatexCommand(latexCmd, [...this.settings.latexArgs, mainFile], tempDir);

            // 7. If imposition is specified, run imposition
            if (imposition) {
                // TODO: Implement imposition
            }

            // 8. Copy result to output path
            const resultPdf = join(tempDir, 'main.pdf');
            await fs.copyFile(resultPdf, outputPath);

            return outputPath;
        } finally {
            if (!this.settings.keepTempFiles) {
                await this.cleanupTempDirectory(tempDir);
            }
        }
    }

    async generateCover(
        template: Template,
        fields: { [key: string]: string },
        spineWidth: number,
        outputPath: string
    ): Promise<string> {
        if (!this.isLatexAvailable) {
            throw new Error('LaTeX is not available');
        }

        const tempDir = await this.createTempDirectory();
        try {
            console.log('Generating cover with spine width:', spineWidth);

            // 1. Lire le template de couverture
            const templateContent = await fs.readFile(template.path, 'utf8');

            // 2. Remplacer les champs dynamiques
            let finalLatex = templateContent;
            for (const [key, value] of Object.entries(fields)) {
                finalLatex = finalLatex.replace(
                    new RegExp(`\\\\def\\\\${key}\\{\\}`, 'g'),
                    `\\def\\${key}{${value}}`
                );
            }

            // 3. Ajouter l'épaisseur de la tranche
            finalLatex = finalLatex.replace(
                /\\def\\spinewidth\{\}/g,
                `\\def\\spinewidth{${spineWidth}mm}`
            );

            // 4. Écrire le fichier LaTeX temporaire
            const mainFile = join(tempDir, 'cover.tex');
            await fs.writeFile(mainFile, finalLatex, 'utf8');

            // 5. Compiler avec XeLaTeX
            const latexCmd = this.getLatexCommand();
            await this.runLatexCommand(latexCmd, [...this.settings.latexArgs, mainFile], tempDir);

            // 6. Copier le PDF généré vers le chemin de sortie
            const resultPdf = join(tempDir, 'cover.pdf');
            await fs.copyFile(resultPdf, outputPath);

            console.log('Cover generated successfully:', outputPath);
            return outputPath;
        } catch (error) {
            console.error('Error generating cover:', error);
            throw error;
        } finally {
            if (!this.settings.keepTempFiles) {
                await this.cleanupTempDirectory(tempDir);
            }
        }
    }

    calculateSpineWidth(pageCount: number, paperThickness: number, additionalThickness: number = 0): number {
        // Calcul de l'épaisseur de la tranche en mm
        // pageCount : nombre total de pages
        // paperThickness : épaisseur du papier en mm
        // additionalThickness : épaisseur supplémentaire pour la reliure (colle, etc.)
        const spineWidth = (pageCount * paperThickness) + additionalThickness;
        
        // Arrondir à 0.1mm près
        return Math.round(spineWidth * 10) / 10;
    }

    private async createTempDirectory(): Promise<string> {
        const tempBasePath = join(tmpdir(), 'bookbrew');
        const timestamp = Date.now();
        const uniquePath = join(tempBasePath, `temp_${timestamp}`);
        
        await fs.mkdir(uniquePath, { recursive: true });
        return uniquePath;
    }

    private async cleanupTempDirectory(path: string): Promise<void> {
        try {
            await fs.rm(path, { recursive: true, force: true });
        } catch (error) {
            console.error('Error cleaning up temp directory:', error);
        }
    }

    private async runLatexCommand(
        command: string,
        args: string[],
        cwd: string
    ): Promise<void> {
        if (!this.isLatexAvailable) {
            throw new Error('LaTeX is not available');
        }

        try {
            const { stdout, stderr } = await execAsync(
                `${command} ${args.join(' ')}`,
                { cwd }
            );

            if (stderr) {
                console.error('LaTeX stderr:', stderr);
            }
        } catch (error) {
            console.error('LaTeX error:', error);
            throw error;
        }
    }

    private async runPandocCommand(
        command: string,
        args: string[],
        cwd: string
    ): Promise<void> {
        if (!this.isPandocAvailable) {
            throw new Error('Pandoc is not available');
        }

        try {
            const { stdout, stderr } = await execAsync(
                `${command} ${args.join(' ')}`,
                { cwd }
            );

            if (stderr) {
                console.error('Pandoc stderr:', stderr);
            }
        } catch (error) {
            console.error('Pandoc error:', error);
            throw error;
        }
    }

    async mergePDFs(inputFiles: string[], outputFile: string): Promise<void> {
        if (!this.isPdftkAvailable) {
            throw new Error('PDFtk is not available');
        }

        const pdftk = this.getPdftkCommand();
        const inputList = inputFiles.join(' ');
        
        try {
            await execAsync(`${pdftk} ${inputList} cat output "${outputFile}"`);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            throw error;
        }
    }

    async extractPages(inputFile: string, pages: string, outputFile: string): Promise<void> {
        if (!this.isPdftkAvailable) {
            throw new Error('PDFtk is not available');
        }

        const pdftk = this.getPdftkCommand();
        
        try {
            await execAsync(`${pdftk} "${inputFile}" cat ${pages} output "${outputFile}"`);
        } catch (error) {
            console.error('Error extracting pages:', error);
            throw error;
        }
    }

    async insertBlankPages(inputFile: string, positions: number[], outputFile: string): Promise<void> {
        if (!this.isPdftkAvailable) {
            throw new Error('PDFtk is not available');
        }

        // Créer une page blanche temporaire
        const tempDir = await this.createTempDirectory();
        const blankPage = join(tempDir, 'blank.pdf');
        
        try {
            // Créer une page blanche avec XeLaTeX
            const blankLatex = `\\documentclass{article}\\begin{document}\\thispagestyle{empty}\\phantom{x}\\end{document}`;
            await fs.writeFile(join(tempDir, 'blank.tex'), blankLatex);
            await this.runLatexCommand(this.getLatexCommand(), [...this.settings.latexArgs, 'blank.tex'], tempDir);

            // Préparer la commande PDFtk
            const pdftk = this.getPdftkCommand();
            let pageRanges: string[] = [];
            let currentPage = 1;

            for (const position of positions.sort((a, b) => a - b)) {
                if (position > currentPage) {
                    pageRanges.push(`A${currentPage}-${position - 1}`);
                }
                pageRanges.push('B1');
                currentPage = position;
            }
            pageRanges.push(`A${currentPage}-end`);

            const command = `${pdftk} A="${inputFile}" B="${blankPage}" cat ${pageRanges.join(' ')} output "${outputFile}"`;
            await execAsync(command);
        } catch (error) {
            console.error('Error inserting blank pages:', error);
            throw error;
        } finally {
            if (!this.settings.keepTempFiles) {
                await this.cleanupTempDirectory(tempDir);
            }
        }
    }

    async rearrangePagesForCheval(inputFile: string, outputFile: string, pagesPerSheet: number): Promise<void> {
        if (!this.isPdftkAvailable) {
            throw new Error('PDFtk is not available');
        }

        const pdftk = this.getPdftkCommand();
        
        try {
            // Obtenir le nombre total de pages
            const { stdout } = await execAsync(`${pdftk} "${inputFile}" dump_data | grep NumberOfPages`);
            const totalPages = parseInt(stdout.split(':')[1].trim());

            // Calculer le nombre de feuilles nécessaires
            const sheetsNeeded = Math.ceil(totalPages / pagesPerSheet);

            // Créer une séquence de pages pour l'imposition en cheval
            interface PageSequenceItem {
                pageNumber: number | null; // null représente une page blanche
                isBlank: boolean;
            }

            let pageSequence: PageSequenceItem[] = [];
            for (let sheet = 0; sheet < sheetsNeeded; sheet++) {
                const baseIndex = sheet * pagesPerSheet;
                for (let i = 0; i < pagesPerSheet / 2; i++) {
                    const frontPage = baseIndex + i + 1;
                    const backPage = baseIndex + pagesPerSheet - i;
                    pageSequence.push({
                        pageNumber: frontPage <= totalPages ? frontPage : null,
                        isBlank: frontPage > totalPages
                    });
                    pageSequence.push({
                        pageNumber: backPage <= totalPages ? backPage : null,
                        isBlank: backPage > totalPages
                    });
                }
            }

            // Créer une page blanche si nécessaire
            let blankPagePath: string | undefined;
            if (pageSequence.some(item => item.isBlank)) {
                const tempDir = await this.createTempDirectory();
                blankPagePath = join(tempDir, 'blank.pdf');
                const blankLatex = `\\documentclass{article}\\begin{document}\\thispagestyle{empty}\\phantom{x}\\end{document}`;
                await fs.writeFile(join(tempDir, 'blank.tex'), blankLatex);
                await this.runLatexCommand(this.getLatexCommand(), [...this.settings.latexArgs, 'blank.tex'], tempDir);
            }

            // Construire la commande PDFtk
            let command = `${pdftk} A="${inputFile}"`;
            if (blankPagePath) {
                command += ` B="${blankPagePath}"`;
            }
            
            command += ' cat';
            pageSequence.forEach(item => {
                command += item.isBlank ? ' B1' : ` A${item.pageNumber}`;
            });
            command += ` output "${outputFile}"`;

            await execAsync(command);

            // Nettoyage
            if (blankPagePath && !this.settings.keepTempFiles) {
                await fs.unlink(blankPagePath);
            }
        } catch (error) {
            console.error('Error rearranging pages for cheval:', error);
            throw error;
        }
    }

    async loadCovers(): Promise<Template[]> {
        const covers: Template[] = [];
        try {
            const fullCoversPath = join(this.getPluginPath(), this.coversPath);
            console.log('Checking covers path:', fullCoversPath);
            
            if (!existsSync(fullCoversPath)) {
                console.log('Covers directory not found:', fullCoversPath);
                return covers;
            }

            const files = await fs.readdir(fullCoversPath);
            console.log('Found cover files:', files);
            
            for (const file of files) {
                if (!file.endsWith('.tex')) continue;
                
                try {
                    const filePath = join(fullCoversPath, file);
                    console.log('Loading cover:', filePath);
                    const content = await fs.readFile(filePath, 'utf8');
                    const dynamicFields = this.extractDynamicFields(content);
                    covers.push({
                        name: basename(file, '.tex'),
                        path: filePath,
                        content
                    });
                } catch (error) {
                    console.error(`Error loading cover ${file}:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading covers:', error);
        }
        
        this.covers = covers;
        return covers;
    }
} 