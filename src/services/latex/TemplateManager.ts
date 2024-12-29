import { Template } from '../../models/types';
import { join, basename } from 'path';
import { existsSync, promises as fs } from 'fs';

export class TemplateManager {
    private templates: Template[] = [];
    private templatesPath: string;
    private pluginPath: string;

    constructor(pluginPath: string) {
        this.pluginPath = pluginPath;
        this.templatesPath = 'typeset/layout';
    }

    private extractFormatFromFileName(fileName: string): string {
        const parts = fileName.split('-');
        if (parts.length >= 2) {
            if (fileName.includes('-layout.tex')) {
                return parts[parts.length - 2];
            }
        }
        return 'unknown';
    }

    async loadTemplates(): Promise<Template[]> {
        const templates: Template[] = [];
        try {
            const fullTemplatesPath = join(this.pluginPath, this.templatesPath);
            
            if (!existsSync(fullTemplatesPath)) {
                return templates;
            }

            const files = await fs.readdir(fullTemplatesPath);
            
            for (const file of files) {
                if (!file.endsWith('.tex')) continue;
                
                try {
                    const filePath = join(this.templatesPath, file);
                    const fullPath = join(this.pluginPath, filePath);
                    const content = await fs.readFile(fullPath, 'utf8');
                    templates.push({
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
        
        this.templates = templates;
        return templates;
    }

    getTemplates(): Template[] {
        return this.templates;
    }

    findTemplate(name: string): Template | undefined {
        return this.templates.find(t => t.name === name);
    }

    async updateTemplateContent(template: Template, content: string): Promise<void> {
        try {
            if (!this.validateLatexContent(content)) {
                throw new Error("Contenu LaTeX invalide");
            }
            
            const fullPath = join(this.pluginPath, template.path);
            await fs.writeFile(fullPath, content, 'utf8');
            template.content = content;
        } catch (error) {
            throw error;
        }
    }

    private validateLatexContent(content: string): boolean {
        const requiredElements = [
            '\\documentclass',
            '\\begin{document}',
            '\\end{document}'
        ];
        
        return requiredElements.every(element => content.includes(element));
    }

    getTemplateToggles(template: Template): string[] {
        if (!template.content) return [];
        
        const togglePattern = /\\newif\\if(\w+)/g;
        const matches = [...template.content.matchAll(togglePattern)];
        return matches.map(match => match[1]);
    }

    async updateTemplateToggle(template: Template, toggleName: string, value: boolean): Promise<void> {
        if (!template.content) return;

        const toggleValue = value ? 'true' : 'false';
        let newContent = template.content;

        const togglePattern = new RegExp(`\\\\${toggleName}(true|false)`, 'g');
        const declarationPattern = new RegExp(`\\\\newif\\\\if${toggleName}`);

        if (!declarationPattern.test(newContent)) {
            throw new Error(`Toggle ${toggleName} non déclaré dans le template`);
        }

        if (newContent.match(togglePattern)) {
            newContent = newContent.replace(togglePattern, `\\${toggleName}${toggleValue}`);
        } else {
            newContent = newContent.replace(
                declarationPattern,
                `\\newif\\if${toggleName}\n\\${toggleName}${toggleValue}`
            );
        }

        await this.updateTemplateContent(template, newContent);
    }
} 