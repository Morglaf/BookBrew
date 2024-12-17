import { Imposition } from '../../models/types';
import { join, basename } from 'path';
import { existsSync, promises as fs } from 'fs';

export class ImpositionManager {
    private impositions: Imposition[] = [];
    private impositionsPath: string;
    private pluginPath: string;

    constructor(pluginPath: string) {
        this.pluginPath = pluginPath;
        this.impositionsPath = 'typeset/impose';
    }

    private extractFormatFromFileName(fileName: string): string {
        const parts = fileName.split('-');
        return parts[0] || 'unknown';
    }

    private extractOutputFormat(fileName: string): string {
        const parts = fileName.split('-');
        if (parts.length >= 2) {
            return parts[1];
        }
        return 'unknown';
    }

    private extractImpositionType(fileName: string): 'signature' | 'spread' | undefined {
        if (fileName.endsWith('signature.tex')) {
            return 'signature';
        } else if (fileName.endsWith('spread.tex')) {
            return 'spread';
        }
        return undefined;
    }

    async loadImpositions(): Promise<Imposition[]> {
        const impositions: Imposition[] = [];
        try {
            const fullImpositionsPath = join(this.pluginPath, this.impositionsPath);
            
            if (!existsSync(fullImpositionsPath)) {
                return impositions;
            }

            const files = await fs.readdir(fullImpositionsPath);
            
            for (const file of files) {
                if (!file.endsWith('.tex')) continue;
                
                try {
                    const filePath = join(this.impositionsPath, file);
                    const fullPath = join(this.pluginPath, filePath);
                    const content = await fs.readFile(fullPath, 'utf8');
                    impositions.push({
                        name: basename(file, '.tex'),
                        path: filePath,
                        content,
                        format: this.extractFormatFromFileName(file),
                        outputFormat: this.extractOutputFormat(file),
                        type: this.extractImpositionType(file)
                    });
                } catch (error) {
                    // Silently continue if a file can't be loaded
                }
            }
        } catch (error) {
            // Return empty array if directory can't be read
        }
        
        this.impositions = impositions;
        return impositions;
    }

    getImpositions(): Imposition[] {
        return this.impositions;
    }

    getImpositionsForFormat(format: string): Imposition[] {
        return this.impositions.filter(imp => imp.format === format);
    }
} 