import { TFile, Vault } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Template } from '../../models/types';

const execAsync = promisify(exec);

export class PdfExporter {
    private vault: Vault;
    private pluginPath: string;
    private latexPath: string;
    private pandocPath: string;
    private tempDir: string;

    constructor(vault: Vault, pluginPath: string, latexPath: string, pandocPath: string) {
        this.vault = vault;
        this.pluginPath = pluginPath;
        this.latexPath = latexPath;
        this.pandocPath = pandocPath;
    }

    async exportToPdf(
        file: TFile,
        template: Template,
        dynamicFields: { [key: string]: string },
        toggles: { [key: string]: boolean },
        outputPath: string
    ): Promise<string> {
        try {
            // 1. Créer un dossier temporaire
            this.tempDir = await this.createTempDirectory();

            // 2. Convertir le Markdown en LaTeX
            const markdownContent = await this.vault.read(file);
            await this.convertMarkdownToLatex(markdownContent);

            // 3. Copier les images référencées
            await this.copyReferencedImages(markdownContent);

            // 4. Préparer le template
            const finalLatex = await this.prepareTemplate(template, dynamicFields, toggles);

            // 5. Compiler le PDF
            const outputFile = await this.compilePdf(finalLatex);

            // 6. Copier le résultat vers le chemin de sortie
            await fs.copyFile(outputFile, outputPath);

            return outputPath;
        } finally {
            // Nettoyage
            if (this.tempDir) {
                await this.cleanupTempDirectory();
            }
        }
    }

    private async createTempDirectory(): Promise<string> {
        const tempDir = join(this.pluginPath, 'temp', `export_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });
        return tempDir;
    }

    private async cleanupTempDirectory(): Promise<void> {
        if (this.tempDir) {
            await fs.rm(this.tempDir, { recursive: true, force: true });
        }
    }

    private async convertMarkdownToLatex(markdownContent: string): Promise<void> {
        const inputFile = join(this.tempDir, 'input.md');
        const outputFile = join(this.tempDir, 'content.tex');

        await fs.writeFile(inputFile, markdownContent, 'utf8');

        const pandocCmd = this.pandocPath ? join(this.pandocPath, 'pandoc') : 'pandoc';
        await execAsync(
            `${pandocCmd} -f markdown -t latex --wrap=none --top-level-division=chapter "${inputFile}" -o "${outputFile}"`
        );
    }

    private async copyReferencedImages(markdownContent: string): Promise<void> {
        const imagePattern = /!\[.*?\]\((.*?)\)/g;
        const matches = [...markdownContent.matchAll(imagePattern)];

        for (const match of matches) {
            const imagePath = match[1];
            if (imagePath) {
                try {
                    const sourceFile = this.vault.getAbstractFileByPath(imagePath);
                    if (sourceFile instanceof TFile) {
                        const imageContent = await this.vault.readBinary(sourceFile);
                        const targetPath = join(this.tempDir, sourceFile.name);
                        await fs.writeFile(targetPath, Buffer.from(imageContent));
                    }
                } catch (error) {
                    // Ignorer les images non trouvées
                }
            }
        }
    }

    private async prepareTemplate(
        template: Template,
        dynamicFields: { [key: string]: string },
        toggles: { [key: string]: boolean }
    ): Promise<string> {
        let content = template.content || '';

        // Remplacer les champs dynamiques
        for (const [key, value] of Object.entries(dynamicFields)) {
            content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        }

        // Configurer les toggles
        for (const [key, value] of Object.entries(toggles)) {
            const toggleValue = value ? 'true' : 'false';
            content = content.replace(
                new RegExp(`\\\\${key}${toggleValue === 'true' ? 'false' : 'true'}`, 'g'),
                `\\${key}${toggleValue}`
            );
        }

        const mainFile = join(this.tempDir, 'main.tex');
        await fs.writeFile(mainFile, content, 'utf8');
        return mainFile;
    }

    private async compilePdf(texFile: string): Promise<string> {
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        await execAsync(
            `${xelatex} -interaction=nonstopmode -halt-on-error "${texFile}"`,
            { cwd: this.tempDir }
        );
        return join(this.tempDir, 'main.pdf');
    }
} 