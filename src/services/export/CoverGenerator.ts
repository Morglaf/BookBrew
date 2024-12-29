import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Cover } from '../../models/types';
import * as os from 'os';

const execAsync = promisify(exec);

export class CoverGenerator {
    private tempDir: string;

    constructor(
        private readonly pluginPath: string,
        private readonly latexPath?: string
    ) {}

    async generateCover(
        cover: Cover,
        dynamicFields: { [key: string]: string },
        spineWidth: number,
        outputPath: string
    ): Promise<string> {
        try {
            this.tempDir = await this.createTempDirectory();
            const texFile = await this.prepareTemplate(cover, dynamicFields, spineWidth);
            await this.compileCover(texFile);

            const resultPdf = join(this.tempDir, 'typeset', 'cover', `${path.parse(texFile).name}.pdf`);
            
            if (!await this.fileExists(resultPdf)) {
                throw new Error(`Result PDF not found at ${resultPdf}`);
            }
            
            await fs.copyFile(resultPdf, outputPath);

            return outputPath;
        } catch (error) {
            throw error;
        }
    }

    private async createTempDirectory(): Promise<string> {
        const tempDir = join(os.tmpdir(), `bookbrew_${Date.now()}`);
        await fs.mkdir(tempDir, { recursive: true });
        return tempDir;
    }

    private async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    private async prepareTemplate(
        cover: Cover,
        dynamicFields: { [key: string]: string },
        spineWidth: number
    ): Promise<string> {
        let content = cover.content || '';

        const allFields = {
            ...dynamicFields,
            spineThickness: `${spineWidth}mm`
        };

        for (const [key, value] of Object.entries(allFields)) {
            content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        }

        await this.copyResources(content);

        const texFile = join(this.tempDir, 'typeset', 'cover', `${cover.name}.tex`);
        await fs.writeFile(texFile, content, 'utf8');

        return texFile;
    }

    private async copyResources(content: string): Promise<void> {
        const typesetPath = join(this.pluginPath, 'typeset');
        const tempTypesetPath = join(this.tempDir, 'typeset');
        await this.copyDirectory(typesetPath, tempTypesetPath);

        const imagePattern = /\\includegraphics(?:\[.*?\])?\{(.*?)\}/g;
        const matches = [...content.matchAll(imagePattern)];

        for (const match of matches) {
            const imagePath = match[1];
            if (imagePath) {
                try {
                    const sourcePath = join(this.pluginPath, imagePath);
                    const targetPath = join(this.tempDir, imagePath);
                    await fs.mkdir(join(targetPath, '..'), { recursive: true });
                    await fs.copyFile(sourcePath, targetPath);
                } catch (error) {
                    console.error(`Failed to copy image ${imagePath}:`, error);
                }
            }
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

    private async compileCover(texFile: string): Promise<void> {
        const xelatex = this.latexPath ? join(this.latexPath, 'xelatex') : 'xelatex';
        const command = `"${xelatex}" -interaction=nonstopmode -file-line-error "${texFile}"`;
        
        try {
            const { stdout, stderr } = await execAsync(command, { 
                cwd: join(this.tempDir, 'typeset', 'cover'),
                env: {
                    ...process.env,
                    TEXINPUTS: `.${path.delimiter}${join(this.tempDir, 'typeset')}${path.delimiter}${join(this.tempDir, 'typeset/cover')}${path.delimiter}${this.tempDir}${path.delimiter}`
                }
            });

            const pdfPath = join(this.tempDir, 'typeset', 'cover', `${path.parse(texFile).name}.pdf`);
            if (!await this.fileExists(pdfPath)) {
                const errorMatch = stdout.match(/!(.*?)(\n\n|\n!|\n$)/g);
                if (errorMatch) {
                    const errors = errorMatch.map(e => e.replace(/(\n\n|\n!|\n$)$/, ''));
                    throw new Error(`LaTeX errors found:\n${errors.join('\n')}`);
                } else {
                    throw new Error('No PDF generated and no error found in output');
                }
            }
        } catch (error) {
            try {
                const logPath = join(this.tempDir, 'typeset', 'cover', `${path.parse(texFile).name}.log`);
                if (await this.fileExists(logPath)) {
                    const logContent = await fs.readFile(logPath, 'utf8');
                    const errorLines = logContent.split('\n');
                    const errors = [];
                    let isError = false;
                    
                    for (const line of errorLines) {
                        if (line.startsWith('!')) {
                            isError = true;
                            errors.push(line);
                        } else if (isError && line.trim() !== '') {
                            errors.push(line);
                            if (line.includes('.')) {
                                isError = false;
                                errors.push('');
                            }
                        }
                    }
                    
                    if (errors.length > 0) {
                        throw new Error(`LaTeX errors found in log:\n${errors.join('\n')}`);
                    }
                }
            } catch (logError) {
                console.error('Failed to read log file:', logError);
            }
            throw error;
        }
    }
} 