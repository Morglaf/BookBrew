import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Cover } from '../../models/types';

const execAsync = promisify(exec);

export class CoverGenerator {
    private pluginPath: string;
    private latexPath: string;
    private tempDir: string;

    constructor(pluginPath: string, latexPath: string) {
        this.pluginPath = pluginPath;
        this.latexPath = latexPath;
    }

    async generateCover(
        cover: Cover,
        dynamicFields: { [key: string]: string },
        spineWidth: number,
        outputPath: string
    ): Promise<string> {
        try {
            // 1. Créer un dossier temporaire
            this.tempDir = await this.createTempDirectory();

            // 2. Préparer le template de couverture
            const texFile = await this.prepareTemplate(cover, dynamicFields, spineWidth);

            // 3. Compiler la couverture
            await this.compileCover(texFile);

            // 4. Copier le résultat vers le chemin de sortie
            const resultPdf = join(this.tempDir, 'cover.pdf');
            await fs.copyFile(resultPdf, outputPath);

            return outputPath;
        } finally {
            // Nettoyage
            if (this.tempDir) {
                await this.cleanupTempDirectory();
            }
        }
    }

    private async createTempDirectory(): Promise<string> {
        const tempDir = join(this.pluginPath, 'temp', `cover_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });
        return tempDir;
    }

    private async cleanupTempDirectory(): Promise<void> {
        if (this.tempDir) {
            await fs.rm(this.tempDir, { recursive: true, force: true });
        }
    }

    private async prepareTemplate(
        cover: Cover,
        dynamicFields: { [key: string]: string },
        spineWidth: number
    ): Promise<string> {
        let content = cover.content || '';

        // Remplacer les champs dynamiques
        for (const [key, value] of Object.entries(dynamicFields)) {
            content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        }

        // Ajouter l'épaisseur de la tranche
        content = content.replace(
            /\\def\\spinewidth\{\}/g,
            `\\def\\spinewidth{${spineWidth}mm}`
        );

        // Copier les ressources nécessaires (images, etc.)
        await this.copyResources(content);

        const texFile = join(this.tempDir, 'cover.tex');
        await fs.writeFile(texFile, content, 'utf8');
        return texFile;
    }

    private async copyResources(content: string): Promise<void> {
        // Extraire les chemins des images
        const imagePattern = /\\includegraphics(?:\[.*?\])?\{(.*?)\}/g;
        const matches = [...content.matchAll(imagePattern)];

        for (const match of matches) {
            const imagePath = match[1];
            if (imagePath) {
                try {
                    const sourcePath = join(this.pluginPath, imagePath);
                    const targetPath = join(this.tempDir, imagePath);
                    await fs.mkdir(join(this.tempDir, imagePath, '..'), { recursive: true });
                    await fs.copyFile(sourcePath, targetPath);
                } catch (error) {
                    // Ignorer les images non trouvées
                }
            }
        }
    }

    private async compileCover(texFile: string): Promise<void> {
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        await execAsync(
            `${xelatex} -interaction=nonstopmode "${texFile}"`,
            { cwd: this.tempDir }
        );
    }
} 