import { Cover } from '../../models/types';
import { join, basename } from 'path';
import { existsSync, promises as fs } from 'fs';

export class CoverManager {
    private covers: Cover[] = [];
    private coversPath: string;
    private pluginPath: string;

    constructor(pluginPath: string) {
        this.pluginPath = pluginPath;
        this.coversPath = 'typeset/cover';
    }

    private extractFormatFromFileName(fileName: string): string {
        const parts = fileName.split('-');
        if (parts.length >= 2) {
            if (fileName.includes('-cover-')) {
                return parts[1];
            }
        }
        return 'unknown';
    }

    async loadCovers(): Promise<Cover[]> {
        const covers: Cover[] = [];
        try {
            const fullCoversPath = join(this.pluginPath, this.coversPath);
            
            if (!existsSync(fullCoversPath)) {
                return covers;
            }

            const files = await fs.readdir(fullCoversPath);
            
            for (const file of files) {
                if (!file.endsWith('.tex')) continue;
                
                try {
                    const filePath = join(this.coversPath, file);
                    const fullPath = join(this.pluginPath, filePath);
                    const content = await fs.readFile(fullPath, 'utf8');
                    covers.push({
                        name: basename(file, '.tex'),
                        path: filePath,
                        content,
                        format: this.extractFormatFromFileName(file)
                    });
                } catch (error) {
                    // Silently continue if a file can't be loaded
                }
            }
        } catch (error) {
            // Return empty array if directory can't be read
        }
        
        this.covers = covers;
        return covers;
    }

    getCovers(): Cover[] {
        return this.covers;
    }

    getCoversForFormat(format: string): Cover[] {
        return this.covers.filter(cover => cover.format === format);
    }

    async generateCover(cover: Cover, spineWidth: number, fields: { [key: string]: string }): Promise<string> {
        if (!cover.content) {
            throw new Error('Cover content not loaded');
        }

        let content = cover.content;

        // Remplacer les champs dynamiques
        for (const [key, value] of Object.entries(fields)) {
            content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        }

        // Ajouter l'épaisseur de la tranche
        content = content.replace(/\\def\\spinewidth\{\}/g, `\\def\\spinewidth{${spineWidth}mm}`);

        // Sauvegarder le fichier temporaire
        const tempPath = join(this.pluginPath, 'temp', 'cover.tex');
        await fs.mkdir(join(this.pluginPath, 'temp'), { recursive: true });
        await fs.writeFile(tempPath, content, 'utf8');

        return tempPath;
    }
} 