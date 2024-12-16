import { __awaiter } from "tslib";
import { normalizePath } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { tmpdir } from 'os';
const execAsync = promisify(exec);
export class LaTeXManager {
    constructor(settings, vault) {
        this.isLatexAvailable = false;
        this.isPandocAvailable = false;
        this.isPdftkAvailable = false;
        this.settings = settings;
        this.vault = vault;
        this.templatesPath = normalizePath('typeset/layout');
        this.impositionsPath = normalizePath('typeset/impose');
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isLatexAvailable = yield this.checkLatexAvailability();
            this.isPandocAvailable = yield this.checkPandocAvailability();
            this.isPdftkAvailable = yield this.checkPdftkAvailability();
        });
    }
    checkLatexAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            const customPath = this.settings.latexPath;
            const xelatex = customPath
                ? join(customPath, 'xelatex')
                : 'xelatex';
            try {
                const { stdout } = yield execAsync(`${xelatex} --version`);
                return stdout.toLowerCase().includes('xetex');
            }
            catch (error) {
                console.error('XeLaTeX not found:', error);
                return false;
            }
        });
    }
    checkPandocAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            const customPath = this.settings.pandocPath;
            try {
                const cmd = customPath
                    ? join(customPath, 'pandoc')
                    : 'pandoc';
                const { stdout } = yield execAsync(`${cmd} --version`);
                return stdout.toLowerCase().includes('pandoc');
            }
            catch (error) {
                console.error('Pandoc not found:', error);
                return false;
            }
        });
    }
    checkPdftkAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            const customPath = this.settings.pdftkPath;
            const pdftk = customPath
                ? join(customPath, 'pdftk')
                : 'pdftk';
            try {
                const { stdout } = yield execAsync(`${pdftk} --version`);
                return stdout.toLowerCase().includes('pdftk');
            }
            catch (error) {
                console.error('PDFtk not found:', error);
                return false;
            }
        });
    }
    getLatexCommand() {
        return this.settings.latexPath
            ? join(this.settings.latexPath, 'xelatex')
            : 'xelatex';
    }
    getPandocCommand() {
        return this.settings.pandocPath
            ? join(this.settings.pandocPath, 'pandoc')
            : 'pandoc';
    }
    getPdftkCommand() {
        return this.settings.pdftkPath
            ? join(this.settings.pdftkPath, 'pdftk')
            : 'pdftk';
    }
    loadTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            const templates = [];
            const templateFiles = yield this.vault.adapter.list(this.templatesPath);
            for (const file of templateFiles.files) {
                if (!file.endsWith('.tex'))
                    continue;
                try {
                    const content = yield this.vault.adapter.read(file);
                    const dynamicFields = this.extractDynamicFields(content);
                    templates.push({
                        name: basename(file, '.tex'),
                        path: file,
                        dynamicFields
                    });
                }
                catch (error) {
                    console.error(`Error loading template ${file}:`, error);
                }
            }
            return templates;
        });
    }
    extractDynamicFields(content) {
        const fields = new Set();
        const regex = /\\def\\([a-zA-Z]+){}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            fields.add(match[1]);
        }
        return Array.from(fields);
    }
    loadImpositions() {
        return __awaiter(this, void 0, void 0, function* () {
            const impositions = [];
            const impositionFiles = yield this.vault.adapter.list(this.impositionsPath);
            for (const file of impositionFiles.files) {
                if (!file.endsWith('.tex'))
                    continue;
                try {
                    const content = yield this.vault.adapter.read(file);
                    const format = this.extractImpositionFormat(content);
                    impositions.push({
                        name: basename(file, '.tex'),
                        path: file,
                        format
                    });
                }
                catch (error) {
                    console.error(`Error loading imposition ${file}:`, error);
                }
            }
            return impositions;
        });
    }
    extractImpositionFormat(content) {
        const formatRegex = /%\s*Format:\s*(.+)$/m;
        const match = content.match(formatRegex);
        return match ? match[1].trim() : 'unknown';
    }
    convertMarkdownToLatex(markdownContent, tempDir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isPandocAvailable) {
                throw new Error('Pandoc is not available');
            }
            const inputFile = join(tempDir, 'input.md');
            const outputFile = join(tempDir, 'output.tex');
            yield fs.writeFile(inputFile, markdownContent, 'utf8');
            const pandocCmd = this.getPandocCommand();
            const args = [
                ...this.settings.pandocArgs,
                '-o', outputFile,
                inputFile
            ];
            try {
                yield this.runPandocCommand(pandocCmd, args, tempDir);
                const latex = yield fs.readFile(outputFile, 'utf8');
                return latex;
            }
            catch (error) {
                console.error('Error converting Markdown to LaTeX:', error);
                throw error;
            }
        });
    }
    parseYAMLFields(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.vault.cachedRead(file);
            const yamlRegex = /^---\n([\s\S]*?)\n---/;
            const match = content.match(yamlRegex);
            if (!match)
                return {};
            const yamlContent = match[1];
            const fields = {};
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
        });
    }
    generatePDF(template, fields, markdownContent, outputPath, imposition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLatexAvailable) {
                throw new Error('LaTeX is not available');
            }
            if (!this.isPandocAvailable) {
                throw new Error('Pandoc is not available');
            }
            const tempDir = yield this.createTempDirectory();
            try {
                // 1. Convert Markdown to LaTeX
                const contentLatex = yield this.convertMarkdownToLatex(markdownContent, tempDir);
                // 2. Copy template to temp directory
                const templateContent = yield this.vault.adapter.read(template.path);
                const templateFile = join(tempDir, 'template.tex');
                yield fs.writeFile(templateFile, templateContent, 'utf8');
                // 3. Replace fields in template
                let finalLatex = templateContent;
                for (const [key, value] of Object.entries(fields)) {
                    finalLatex = finalLatex.replace(new RegExp(`\\\\def\\\\${key}\\{\\}`, 'g'), `\\def\\${key}{${value}}`);
                }
                // 4. Insert converted content
                finalLatex = finalLatex.replace('\\begin{document}', '\\begin{document}\n' + contentLatex);
                // 5. Write final LaTeX file
                const mainFile = join(tempDir, 'main.tex');
                yield fs.writeFile(mainFile, finalLatex, 'utf8');
                // 6. Run LaTeX command
                const latexCmd = this.getLatexCommand();
                yield this.runLatexCommand(latexCmd, [...this.settings.latexArgs, mainFile], tempDir);
                // 7. If imposition is specified, run imposition
                if (imposition) {
                    // TODO: Implement imposition
                }
                // 8. Copy result to output path
                const resultPdf = join(tempDir, 'main.pdf');
                yield fs.copyFile(resultPdf, outputPath);
                return outputPath;
            }
            finally {
                if (!this.settings.keepTempFiles) {
                    yield this.cleanupTempDirectory(tempDir);
                }
            }
        });
    }
    generateCover(template, fields, spineWidth, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLatexAvailable) {
                throw new Error('LaTeX is not available');
            }
            const tempDir = yield this.createTempDirectory();
            try {
                // TODO: Implement cover generation
                return outputPath;
            }
            finally {
                if (!this.settings.keepTempFiles) {
                    yield this.cleanupTempDirectory(tempDir);
                }
            }
        });
    }
    calculateSpineWidth(pageCount, paperThickness) {
        return pageCount * paperThickness;
    }
    createTempDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            const tempBasePath = join(tmpdir(), 'bookbrew');
            const timestamp = Date.now();
            const uniquePath = join(tempBasePath, `temp_${timestamp}`);
            yield fs.mkdir(uniquePath, { recursive: true });
            return uniquePath;
        });
    }
    cleanupTempDirectory(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.rm(path, { recursive: true, force: true });
            }
            catch (error) {
                console.error('Error cleaning up temp directory:', error);
            }
        });
    }
    runLatexCommand(command, args, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLatexAvailable) {
                throw new Error('LaTeX is not available');
            }
            try {
                const { stdout, stderr } = yield execAsync(`${command} ${args.join(' ')}`, { cwd });
                if (stderr) {
                    console.error('LaTeX stderr:', stderr);
                }
            }
            catch (error) {
                console.error('LaTeX error:', error);
                throw error;
            }
        });
    }
    runPandocCommand(command, args, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isPandocAvailable) {
                throw new Error('Pandoc is not available');
            }
            try {
                const { stdout, stderr } = yield execAsync(`${command} ${args.join(' ')}`, { cwd });
                if (stderr) {
                    console.error('Pandoc stderr:', stderr);
                }
            }
            catch (error) {
                console.error('Pandoc error:', error);
                throw error;
            }
        });
    }
    mergePDFs(inputFiles, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isPdftkAvailable) {
                throw new Error('PDFtk is not available');
            }
            const pdftk = this.getPdftkCommand();
            const inputList = inputFiles.join(' ');
            try {
                yield execAsync(`${pdftk} ${inputList} cat output "${outputFile}"`);
            }
            catch (error) {
                console.error('Error merging PDFs:', error);
                throw error;
            }
        });
    }
    extractPages(inputFile, pages, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isPdftkAvailable) {
                throw new Error('PDFtk is not available');
            }
            const pdftk = this.getPdftkCommand();
            try {
                yield execAsync(`${pdftk} "${inputFile}" cat ${pages} output "${outputFile}"`);
            }
            catch (error) {
                console.error('Error extracting pages:', error);
                throw error;
            }
        });
    }
    insertBlankPages(inputFile, positions, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isPdftkAvailable) {
                throw new Error('PDFtk is not available');
            }
            // Créer une page blanche temporaire
            const tempDir = yield this.createTempDirectory();
            const blankPage = join(tempDir, 'blank.pdf');
            try {
                // Créer une page blanche avec XeLaTeX
                const blankLatex = `\\documentclass{article}\\begin{document}\\thispagestyle{empty}\\phantom{x}\\end{document}`;
                yield fs.writeFile(join(tempDir, 'blank.tex'), blankLatex);
                yield this.runLatexCommand(this.getLatexCommand(), [...this.settings.latexArgs, 'blank.tex'], tempDir);
                // Préparer la commande PDFtk
                const pdftk = this.getPdftkCommand();
                let pageRanges = [];
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
                yield execAsync(command);
            }
            catch (error) {
                console.error('Error inserting blank pages:', error);
                throw error;
            }
            finally {
                if (!this.settings.keepTempFiles) {
                    yield this.cleanupTempDirectory(tempDir);
                }
            }
        });
    }
    rearrangePagesForCheval(inputFile, outputFile, pagesPerSheet) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isPdftkAvailable) {
                throw new Error('PDFtk is not available');
            }
            const pdftk = this.getPdftkCommand();
            try {
                // Obtenir le nombre total de pages
                const { stdout } = yield execAsync(`${pdftk} "${inputFile}" dump_data | grep NumberOfPages`);
                const totalPages = parseInt(stdout.split(':')[1].trim());
                // Calculer le nombre de feuilles nécessaires
                const sheetsNeeded = Math.ceil(totalPages / pagesPerSheet);
                let pageSequence = [];
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
                let blankPagePath;
                if (pageSequence.some(item => item.isBlank)) {
                    const tempDir = yield this.createTempDirectory();
                    blankPagePath = join(tempDir, 'blank.pdf');
                    const blankLatex = `\\documentclass{article}\\begin{document}\\thispagestyle{empty}\\phantom{x}\\end{document}`;
                    yield fs.writeFile(join(tempDir, 'blank.tex'), blankLatex);
                    yield this.runLatexCommand(this.getLatexCommand(), [...this.settings.latexArgs, 'blank.tex'], tempDir);
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
                yield execAsync(command);
                // Nettoyage
                if (blankPagePath && !this.settings.keepTempFiles) {
                    yield fs.unlink(blankPagePath);
                }
            }
            catch (error) {
                console.error('Error rearranging pages for cheval:', error);
                throw error;
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF0ZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsYXRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFTLGFBQWEsRUFBUyxNQUFNLFVBQVUsQ0FBQztBQUV2RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDakMsT0FBTyxFQUFjLFFBQVEsSUFBSSxFQUFFLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDaEQsT0FBTyxFQUFFLElBQUksRUFBVyxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQztBQUU1QixNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFjbEMsTUFBTSxPQUFPLFlBQVk7SUFTckIsWUFBWSxRQUEwQixFQUFFLEtBQVk7UUFMNUMscUJBQWdCLEdBQVksS0FBSyxDQUFDO1FBQ2xDLHNCQUFpQixHQUFZLEtBQUssQ0FBQztRQUNuQyxxQkFBZ0IsR0FBWSxLQUFLLENBQUM7UUFJdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFSyxJQUFJOztZQUNOLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQzlELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxz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QyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVELE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO0tBQUE7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRGaWxlLCBub3JtYWxpemVQYXRoLCBWYXVsdCB9IGZyb20gJ29ic2lkaWFuJztcclxuaW1wb3J0IHsgQm9va0JyZXdTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCBwcm9taXNlcyBhcyBmcyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgam9pbiwgZGlybmFtZSwgYmFzZW5hbWUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tICdvcyc7XHJcbmltcG9ydCB7IHRtcGRpciB9IGZyb20gJ29zJztcclxuXHJcbmNvbnN0IGV4ZWNBc3luYyA9IHByb21pc2lmeShleGVjKTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGFUZVhUZW1wbGF0ZSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBwYXRoOiBzdHJpbmc7XHJcbiAgICBkeW5hbWljRmllbGRzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbXBvc2l0aW9uVGVtcGxhdGUge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgcGF0aDogc3RyaW5nO1xyXG4gICAgZm9ybWF0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMYVRlWE1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBzZXR0aW5nczogQm9va0JyZXdTZXR0aW5ncztcclxuICAgIHByaXZhdGUgdGVtcGxhdGVzUGF0aDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpbXBvc2l0aW9uc1BhdGg6IHN0cmluZztcclxuICAgIHByaXZhdGUgaXNMYXRleEF2YWlsYWJsZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBpc1BhbmRvY0F2YWlsYWJsZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBpc1BkZnRrQXZhaWxhYmxlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHZhdWx0OiBWYXVsdDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5nczogQm9va0JyZXdTZXR0aW5ncywgdmF1bHQ6IFZhdWx0KSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMudmF1bHQgPSB2YXVsdDtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlc1BhdGggPSBub3JtYWxpemVQYXRoKCd0eXBlc2V0L2xheW91dCcpO1xyXG4gICAgICAgIHRoaXMuaW1wb3NpdGlvbnNQYXRoID0gbm9ybWFsaXplUGF0aCgndHlwZXNldC9pbXBvc2UnKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRoaXMuaXNMYXRleEF2YWlsYWJsZSA9IGF3YWl0IHRoaXMuY2hlY2tMYXRleEF2YWlsYWJpbGl0eSgpO1xyXG4gICAgICAgIHRoaXMuaXNQYW5kb2NBdmFpbGFibGUgPSBhd2FpdCB0aGlzLmNoZWNrUGFuZG9jQXZhaWxhYmlsaXR5KCk7XHJcbiAgICAgICAgdGhpcy5pc1BkZnRrQXZhaWxhYmxlID0gYXdhaXQgdGhpcy5jaGVja1BkZnRrQXZhaWxhYmlsaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja0xhdGV4QXZhaWxhYmlsaXR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbVBhdGggPSB0aGlzLnNldHRpbmdzLmxhdGV4UGF0aDtcclxuICAgICAgICBjb25zdCB4ZWxhdGV4ID0gY3VzdG9tUGF0aCBcclxuICAgICAgICAgICAgPyBqb2luKGN1c3RvbVBhdGgsICd4ZWxhdGV4JylcclxuICAgICAgICAgICAgOiAneGVsYXRleCc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IGV4ZWNBc3luYyhgJHt4ZWxhdGV4fSAtLXZlcnNpb25gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0ZG91dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCd4ZXRleCcpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1hlTGFUZVggbm90IGZvdW5kOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGNoZWNrUGFuZG9jQXZhaWxhYmlsaXR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbVBhdGggPSB0aGlzLnNldHRpbmdzLnBhbmRvY1BhdGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY21kID0gY3VzdG9tUGF0aCBcclxuICAgICAgICAgICAgICAgID8gam9pbihjdXN0b21QYXRoLCAncGFuZG9jJylcclxuICAgICAgICAgICAgICAgIDogJ3BhbmRvYyc7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgZXhlY0FzeW5jKGAke2NtZH0gLS12ZXJzaW9uYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGRvdXQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncGFuZG9jJyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUGFuZG9jIG5vdCBmb3VuZDonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja1BkZnRrQXZhaWxhYmlsaXR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbVBhdGggPSB0aGlzLnNldHRpbmdzLnBkZnRrUGF0aDtcclxuICAgICAgICBjb25zdCBwZGZ0ayA9IGN1c3RvbVBhdGggXHJcbiAgICAgICAgICAgID8gam9pbihjdXN0b21QYXRoLCAncGRmdGsnKVxyXG4gICAgICAgICAgICA6ICdwZGZ0ayc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IGV4ZWNBc3luYyhgJHtwZGZ0a30gLS12ZXJzaW9uYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGRvdXQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncGRmdGsnKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQREZ0ayBub3QgZm91bmQ6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TGF0ZXhDb21tYW5kKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MubGF0ZXhQYXRoXHJcbiAgICAgICAgICAgID8gam9pbih0aGlzLnNldHRpbmdzLmxhdGV4UGF0aCwgJ3hlbGF0ZXgnKVxyXG4gICAgICAgICAgICA6ICd4ZWxhdGV4JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFBhbmRvY0NvbW1hbmQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy5wYW5kb2NQYXRoXHJcbiAgICAgICAgICAgID8gam9pbih0aGlzLnNldHRpbmdzLnBhbmRvY1BhdGgsICdwYW5kb2MnKVxyXG4gICAgICAgICAgICA6ICdwYW5kb2MnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UGRmdGtDb21tYW5kKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MucGRmdGtQYXRoXHJcbiAgICAgICAgICAgID8gam9pbih0aGlzLnNldHRpbmdzLnBkZnRrUGF0aCwgJ3BkZnRrJylcclxuICAgICAgICAgICAgOiAncGRmdGsnO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxvYWRUZW1wbGF0ZXMoKTogUHJvbWlzZTxMYVRlWFRlbXBsYXRlW10+IHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZXM6IExhVGVYVGVtcGxhdGVbXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlRmlsZXMgPSBhd2FpdCB0aGlzLnZhdWx0LmFkYXB0ZXIubGlzdCh0aGlzLnRlbXBsYXRlc1BhdGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiB0ZW1wbGF0ZUZpbGVzLmZpbGVzKSB7XHJcbiAgICAgICAgICAgIGlmICghZmlsZS5lbmRzV2l0aCgnLnRleCcpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkeW5hbWljRmllbGRzID0gdGhpcy5leHRyYWN0RHluYW1pY0ZpZWxkcyhjb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBiYXNlbmFtZShmaWxlLCAnLnRleCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZHluYW1pY0ZpZWxkc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBsb2FkaW5nIHRlbXBsYXRlICR7ZmlsZX06YCwgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBleHRyYWN0RHluYW1pY0ZpZWxkcyhjb250ZW50OiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3QgZmllbGRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICAgICAgY29uc3QgcmVnZXggPSAvXFxcXGRlZlxcXFwoW2EtekEtWl0rKXt9L2c7XHJcbiAgICAgICAgbGV0IG1hdGNoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlICgobWF0Y2ggPSByZWdleC5leGVjKGNvbnRlbnQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBmaWVsZHMuYWRkKG1hdGNoWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZmllbGRzKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBsb2FkSW1wb3NpdGlvbnMoKTogUHJvbWlzZTxJbXBvc2l0aW9uVGVtcGxhdGVbXT4ge1xyXG4gICAgICAgIGNvbnN0IGltcG9zaXRpb25zOiBJbXBvc2l0aW9uVGVtcGxhdGVbXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGltcG9zaXRpb25GaWxlcyA9IGF3YWl0IHRoaXMudmF1bHQuYWRhcHRlci5saXN0KHRoaXMuaW1wb3NpdGlvbnNQYXRoKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgaW1wb3NpdGlvbkZpbGVzLmZpbGVzKSB7XHJcbiAgICAgICAgICAgIGlmICghZmlsZS5lbmRzV2l0aCgnLnRleCcpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXQgPSB0aGlzLmV4dHJhY3RJbXBvc2l0aW9uRm9ybWF0KGNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgaW1wb3NpdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYmFzZW5hbWUoZmlsZSwgJy50ZXgnKSxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBsb2FkaW5nIGltcG9zaXRpb24gJHtmaWxlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGltcG9zaXRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXh0cmFjdEltcG9zaXRpb25Gb3JtYXQoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBmb3JtYXRSZWdleCA9IC8lXFxzKkZvcm1hdDpcXHMqKC4rKSQvbTtcclxuICAgICAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goZm9ybWF0UmVnZXgpO1xyXG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRyaW0oKSA6ICd1bmtub3duJztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjb252ZXJ0TWFya2Rvd25Ub0xhdGV4KG1hcmtkb3duQ29udGVudDogc3RyaW5nLCB0ZW1wRGlyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1BhbmRvY0F2YWlsYWJsZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhbmRvYyBpcyBub3QgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpbnB1dEZpbGUgPSBqb2luKHRlbXBEaXIsICdpbnB1dC5tZCcpO1xyXG4gICAgICAgIGNvbnN0IG91dHB1dEZpbGUgPSBqb2luKHRlbXBEaXIsICdvdXRwdXQudGV4Jyk7XHJcblxyXG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShpbnB1dEZpbGUsIG1hcmtkb3duQ29udGVudCwgJ3V0ZjgnKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFuZG9jQ21kID0gdGhpcy5nZXRQYW5kb2NDb21tYW5kKCk7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IFtcclxuICAgICAgICAgICAgLi4udGhpcy5zZXR0aW5ncy5wYW5kb2NBcmdzLFxyXG4gICAgICAgICAgICAnLW8nLCBvdXRwdXRGaWxlLFxyXG4gICAgICAgICAgICBpbnB1dEZpbGVcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ1blBhbmRvY0NvbW1hbmQocGFuZG9jQ21kLCBhcmdzLCB0ZW1wRGlyKTtcclxuICAgICAgICAgICAgY29uc3QgbGF0ZXggPSBhd2FpdCBmcy5yZWFkRmlsZShvdXRwdXRGaWxlLCAndXRmOCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gbGF0ZXg7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29udmVydGluZyBNYXJrZG93biB0byBMYVRlWDonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwYXJzZVlBTUxGaWVsZHMoZmlsZTogVEZpbGUpOiBQcm9taXNlPHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0+IHtcclxuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xyXG4gICAgICAgIGNvbnN0IHlhbWxSZWdleCA9IC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tLztcclxuICAgICAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goeWFtbFJlZ2V4KTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIW1hdGNoKSByZXR1cm4ge307XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgeWFtbENvbnRlbnQgPSBtYXRjaFsxXTtcclxuICAgICAgICBjb25zdCBmaWVsZHM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHlhbWxDb250ZW50LnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgW2tleSwgLi4udmFsdWVQYXJ0c10gPSBsaW5lLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgICAgIGlmIChrZXkgJiYgdmFsdWVQYXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlUGFydHMuam9pbignOicpLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1trZXkudHJpbSgpXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBmaWVsZHM7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGVQREYoXHJcbiAgICAgICAgdGVtcGxhdGU6IExhVGVYVGVtcGxhdGUsXHJcbiAgICAgICAgZmllbGRzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LFxyXG4gICAgICAgIG1hcmtkb3duQ29udGVudDogc3RyaW5nLFxyXG4gICAgICAgIG91dHB1dFBhdGg6IHN0cmluZyxcclxuICAgICAgICBpbXBvc2l0aW9uPzogSW1wb3NpdGlvblRlbXBsYXRlXHJcbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0xhdGV4QXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGFUZVggaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuaXNQYW5kb2NBdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYW5kb2MgaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGVtcERpciA9IGF3YWl0IHRoaXMuY3JlYXRlVGVtcERpcmVjdG9yeSgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIDEuIENvbnZlcnQgTWFya2Rvd24gdG8gTGFUZVhcclxuICAgICAgICAgICAgY29uc3QgY29udGVudExhdGV4ID0gYXdhaXQgdGhpcy5jb252ZXJ0TWFya2Rvd25Ub0xhdGV4KG1hcmtkb3duQ29udGVudCwgdGVtcERpcik7XHJcblxyXG4gICAgICAgICAgICAvLyAyLiBDb3B5IHRlbXBsYXRlIHRvIHRlbXAgZGlyZWN0b3J5XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlQ29udGVudCA9IGF3YWl0IHRoaXMudmF1bHQuYWRhcHRlci5yZWFkKHRlbXBsYXRlLnBhdGgpO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZUZpbGUgPSBqb2luKHRlbXBEaXIsICd0ZW1wbGF0ZS50ZXgnKTtcclxuICAgICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHRlbXBsYXRlRmlsZSwgdGVtcGxhdGVDb250ZW50LCAndXRmOCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gMy4gUmVwbGFjZSBmaWVsZHMgaW4gdGVtcGxhdGVcclxuICAgICAgICAgICAgbGV0IGZpbmFsTGF0ZXggPSB0ZW1wbGF0ZUNvbnRlbnQ7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGZpZWxkcykpIHtcclxuICAgICAgICAgICAgICAgIGZpbmFsTGF0ZXggPSBmaW5hbExhdGV4LnJlcGxhY2UobmV3IFJlZ0V4cChgXFxcXFxcXFxkZWZcXFxcXFxcXCR7a2V5fVxcXFx7XFxcXH1gLCAnZycpLCBgXFxcXGRlZlxcXFwke2tleX17JHt2YWx1ZX19YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDQuIEluc2VydCBjb252ZXJ0ZWQgY29udGVudFxyXG4gICAgICAgICAgICBmaW5hbExhdGV4ID0gZmluYWxMYXRleC5yZXBsYWNlKCdcXFxcYmVnaW57ZG9jdW1lbnR9JywgJ1xcXFxiZWdpbntkb2N1bWVudH1cXG4nICsgY29udGVudExhdGV4KTtcclxuXHJcbiAgICAgICAgICAgIC8vIDUuIFdyaXRlIGZpbmFsIExhVGVYIGZpbGVcclxuICAgICAgICAgICAgY29uc3QgbWFpbkZpbGUgPSBqb2luKHRlbXBEaXIsICdtYWluLnRleCcpO1xyXG4gICAgICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUobWFpbkZpbGUsIGZpbmFsTGF0ZXgsICd1dGY4Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyA2LiBSdW4gTGFUZVggY29tbWFuZFxyXG4gICAgICAgICAgICBjb25zdCBsYXRleENtZCA9IHRoaXMuZ2V0TGF0ZXhDb21tYW5kKCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuTGF0ZXhDb21tYW5kKGxhdGV4Q21kLCBbLi4udGhpcy5zZXR0aW5ncy5sYXRleEFyZ3MsIG1haW5GaWxlXSwgdGVtcERpcik7XHJcblxyXG4gICAgICAgICAgICAvLyA3LiBJZiBpbXBvc2l0aW9uIGlzIHNwZWNpZmllZCwgcnVuIGltcG9zaXRpb25cclxuICAgICAgICAgICAgaWYgKGltcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCBpbXBvc2l0aW9uXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDguIENvcHkgcmVzdWx0IHRvIG91dHB1dCBwYXRoXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdFBkZiA9IGpvaW4odGVtcERpciwgJ21haW4ucGRmJyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGZzLmNvcHlGaWxlKHJlc3VsdFBkZiwgb3V0cHV0UGF0aCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0UGF0aDtcclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2V0dGluZ3Mua2VlcFRlbXBGaWxlcykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwVGVtcERpcmVjdG9yeSh0ZW1wRGlyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZW5lcmF0ZUNvdmVyKFxyXG4gICAgICAgIHRlbXBsYXRlOiBMYVRlWFRlbXBsYXRlLFxyXG4gICAgICAgIGZpZWxkczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcclxuICAgICAgICBzcGluZVdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgb3V0cHV0UGF0aDogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0xhdGV4QXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGFUZVggaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGVtcERpciA9IGF3YWl0IHRoaXMuY3JlYXRlVGVtcERpcmVjdG9yeSgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCBjb3ZlciBnZW5lcmF0aW9uXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXRQYXRoO1xyXG4gICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZXR0aW5ncy5rZWVwVGVtcEZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNsZWFudXBUZW1wRGlyZWN0b3J5KHRlbXBEaXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNhbGN1bGF0ZVNwaW5lV2lkdGgocGFnZUNvdW50OiBudW1iZXIsIHBhcGVyVGhpY2tuZXNzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBwYWdlQ291bnQgKiBwYXBlclRoaWNrbmVzcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVRlbXBEaXJlY3RvcnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBjb25zdCB0ZW1wQmFzZVBhdGggPSBqb2luKHRtcGRpcigpLCAnYm9va2JyZXcnKTtcclxuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IHVuaXF1ZVBhdGggPSBqb2luKHRlbXBCYXNlUGF0aCwgYHRlbXBfJHt0aW1lc3RhbXB9YCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXdhaXQgZnMubWtkaXIodW5pcXVlUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAgICAgcmV0dXJuIHVuaXF1ZVBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwVGVtcERpcmVjdG9yeShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBmcy5ybShwYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xlYW5pbmcgdXAgdGVtcCBkaXJlY3Rvcnk6JywgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHJ1bkxhdGV4Q29tbWFuZChcclxuICAgICAgICBjb21tYW5kOiBzdHJpbmcsXHJcbiAgICAgICAgYXJnczogc3RyaW5nW10sXHJcbiAgICAgICAgY3dkOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0xhdGV4QXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGFUZVggaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBzdGRvdXQsIHN0ZGVyciB9ID0gYXdhaXQgZXhlY0FzeW5jKFxyXG4gICAgICAgICAgICAgICAgYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gLFxyXG4gICAgICAgICAgICAgICAgeyBjd2QgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0ZGVycikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignTGFUZVggc3RkZXJyOicsIHN0ZGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMYVRlWCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHJ1blBhbmRvY0NvbW1hbmQoXHJcbiAgICAgICAgY29tbWFuZDogc3RyaW5nLFxyXG4gICAgICAgIGFyZ3M6IHN0cmluZ1tdLFxyXG4gICAgICAgIGN3ZDogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNQYW5kb2NBdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYW5kb2MgaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBzdGRvdXQsIHN0ZGVyciB9ID0gYXdhaXQgZXhlY0FzeW5jKFxyXG4gICAgICAgICAgICAgICAgYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gLFxyXG4gICAgICAgICAgICAgICAgeyBjd2QgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0ZGVycikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUGFuZG9jIHN0ZGVycjonLCBzdGRlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUGFuZG9jIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIG1lcmdlUERGcyhpbnB1dEZpbGVzOiBzdHJpbmdbXSwgb3V0cHV0RmlsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzUGRmdGtBdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQREZ0ayBpcyBub3QgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwZGZ0ayA9IHRoaXMuZ2V0UGRmdGtDb21tYW5kKCk7XHJcbiAgICAgICAgY29uc3QgaW5wdXRMaXN0ID0gaW5wdXRGaWxlcy5qb2luKCcgJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgZXhlY0FzeW5jKGAke3BkZnRrfSAke2lucHV0TGlzdH0gY2F0IG91dHB1dCBcIiR7b3V0cHV0RmlsZX1cImApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG1lcmdpbmcgUERGczonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBleHRyYWN0UGFnZXMoaW5wdXRGaWxlOiBzdHJpbmcsIHBhZ2VzOiBzdHJpbmcsIG91dHB1dEZpbGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1BkZnRrQXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUERGdGsgaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGRmdGsgPSB0aGlzLmdldFBkZnRrQ29tbWFuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGV4ZWNBc3luYyhgJHtwZGZ0a30gXCIke2lucHV0RmlsZX1cIiBjYXQgJHtwYWdlc30gb3V0cHV0IFwiJHtvdXRwdXRGaWxlfVwiYCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZXh0cmFjdGluZyBwYWdlczonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbnNlcnRCbGFua1BhZ2VzKGlucHV0RmlsZTogc3RyaW5nLCBwb3NpdGlvbnM6IG51bWJlcltdLCBvdXRwdXRGaWxlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNQZGZ0a0F2YWlsYWJsZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BERnRrIGlzIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyw6llciB1bmUgcGFnZSBibGFuY2hlIHRlbXBvcmFpcmVcclxuICAgICAgICBjb25zdCB0ZW1wRGlyID0gYXdhaXQgdGhpcy5jcmVhdGVUZW1wRGlyZWN0b3J5KCk7XHJcbiAgICAgICAgY29uc3QgYmxhbmtQYWdlID0gam9pbih0ZW1wRGlyLCAnYmxhbmsucGRmJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gQ3LDqWVyIHVuZSBwYWdlIGJsYW5jaGUgYXZlYyBYZUxhVGVYXHJcbiAgICAgICAgICAgIGNvbnN0IGJsYW5rTGF0ZXggPSBgXFxcXGRvY3VtZW50Y2xhc3N7YXJ0aWNsZX1cXFxcYmVnaW57ZG9jdW1lbnR9XFxcXHRoaXNwYWdlc3R5bGV7ZW1wdHl9XFxcXHBoYW50b217eH1cXFxcZW5ke2RvY3VtZW50fWA7XHJcbiAgICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShqb2luKHRlbXBEaXIsICdibGFuay50ZXgnKSwgYmxhbmtMYXRleCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuTGF0ZXhDb21tYW5kKHRoaXMuZ2V0TGF0ZXhDb21tYW5kKCksIFsuLi50aGlzLnNldHRpbmdzLmxhdGV4QXJncywgJ2JsYW5rLnRleCddLCB0ZW1wRGlyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByw6lwYXJlciBsYSBjb21tYW5kZSBQREZ0a1xyXG4gICAgICAgICAgICBjb25zdCBwZGZ0ayA9IHRoaXMuZ2V0UGRmdGtDb21tYW5kKCk7XHJcbiAgICAgICAgICAgIGxldCBwYWdlUmFuZ2VzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFBhZ2UgPSAxO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBwb3NpdGlvbiBvZiBwb3NpdGlvbnMuc29ydCgoYSwgYikgPT4gYSAtIGIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9zaXRpb24gPiBjdXJyZW50UGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VSYW5nZXMucHVzaChgQSR7Y3VycmVudFBhZ2V9LSR7cG9zaXRpb24gLSAxfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcGFnZVJhbmdlcy5wdXNoKCdCMScpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSBwb3NpdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYWdlUmFuZ2VzLnB1c2goYEEke2N1cnJlbnRQYWdlfS1lbmRgKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBgJHtwZGZ0a30gQT1cIiR7aW5wdXRGaWxlfVwiIEI9XCIke2JsYW5rUGFnZX1cIiBjYXQgJHtwYWdlUmFuZ2VzLmpvaW4oJyAnKX0gb3V0cHV0IFwiJHtvdXRwdXRGaWxlfVwiYDtcclxuICAgICAgICAgICAgYXdhaXQgZXhlY0FzeW5jKGNvbW1hbmQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluc2VydGluZyBibGFuayBwYWdlczonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZXR0aW5ncy5rZWVwVGVtcEZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNsZWFudXBUZW1wRGlyZWN0b3J5KHRlbXBEaXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYXJyYW5nZVBhZ2VzRm9yQ2hldmFsKGlucHV0RmlsZTogc3RyaW5nLCBvdXRwdXRGaWxlOiBzdHJpbmcsIHBhZ2VzUGVyU2hlZXQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1BkZnRrQXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUERGdGsgaXMgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGRmdGsgPSB0aGlzLmdldFBkZnRrQ29tbWFuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIE9idGVuaXIgbGUgbm9tYnJlIHRvdGFsIGRlIHBhZ2VzXHJcbiAgICAgICAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCBleGVjQXN5bmMoYCR7cGRmdGt9IFwiJHtpbnB1dEZpbGV9XCIgZHVtcF9kYXRhIHwgZ3JlcCBOdW1iZXJPZlBhZ2VzYCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsUGFnZXMgPSBwYXJzZUludChzdGRvdXQuc3BsaXQoJzonKVsxXS50cmltKCkpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2FsY3VsZXIgbGUgbm9tYnJlIGRlIGZldWlsbGVzIG7DqWNlc3NhaXJlc1xyXG4gICAgICAgICAgICBjb25zdCBzaGVldHNOZWVkZWQgPSBNYXRoLmNlaWwodG90YWxQYWdlcyAvIHBhZ2VzUGVyU2hlZXQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3LDqWVyIHVuZSBzw6lxdWVuY2UgZGUgcGFnZXMgcG91ciBsJ2ltcG9zaXRpb24gZW4gY2hldmFsXHJcbiAgICAgICAgICAgIGludGVyZmFjZSBQYWdlU2VxdWVuY2VJdGVtIHtcclxuICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXI6IG51bWJlciB8IG51bGw7IC8vIG51bGwgcmVwcsOpc2VudGUgdW5lIHBhZ2UgYmxhbmNoZVxyXG4gICAgICAgICAgICAgICAgaXNCbGFuazogYm9vbGVhbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHBhZ2VTZXF1ZW5jZTogUGFnZVNlcXVlbmNlSXRlbVtdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNoZWV0ID0gMDsgc2hlZXQgPCBzaGVldHNOZWVkZWQ7IHNoZWV0KyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VJbmRleCA9IHNoZWV0ICogcGFnZXNQZXJTaGVldDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFnZXNQZXJTaGVldCAvIDI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyb250UGFnZSA9IGJhc2VJbmRleCArIGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tQYWdlID0gYmFzZUluZGV4ICsgcGFnZXNQZXJTaGVldCAtIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZVNlcXVlbmNlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlTnVtYmVyOiBmcm9udFBhZ2UgPD0gdG90YWxQYWdlcyA/IGZyb250UGFnZSA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmxhbms6IGZyb250UGFnZSA+IHRvdGFsUGFnZXNcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBwYWdlU2VxdWVuY2UucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXI6IGJhY2tQYWdlIDw9IHRvdGFsUGFnZXMgPyBiYWNrUGFnZSA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmxhbms6IGJhY2tQYWdlID4gdG90YWxQYWdlc1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDcsOpZXIgdW5lIHBhZ2UgYmxhbmNoZSBzaSBuw6ljZXNzYWlyZVxyXG4gICAgICAgICAgICBsZXQgYmxhbmtQYWdlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAocGFnZVNlcXVlbmNlLnNvbWUoaXRlbSA9PiBpdGVtLmlzQmxhbmspKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wRGlyID0gYXdhaXQgdGhpcy5jcmVhdGVUZW1wRGlyZWN0b3J5KCk7XHJcbiAgICAgICAgICAgICAgICBibGFua1BhZ2VQYXRoID0gam9pbih0ZW1wRGlyLCAnYmxhbmsucGRmJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBibGFua0xhdGV4ID0gYFxcXFxkb2N1bWVudGNsYXNze2FydGljbGV9XFxcXGJlZ2lue2RvY3VtZW50fVxcXFx0aGlzcGFnZXN0eWxle2VtcHR5fVxcXFxwaGFudG9te3h9XFxcXGVuZHtkb2N1bWVudH1gO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGpvaW4odGVtcERpciwgJ2JsYW5rLnRleCcpLCBibGFua0xhdGV4KTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuTGF0ZXhDb21tYW5kKHRoaXMuZ2V0TGF0ZXhDb21tYW5kKCksIFsuLi50aGlzLnNldHRpbmdzLmxhdGV4QXJncywgJ2JsYW5rLnRleCddLCB0ZW1wRGlyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ29uc3RydWlyZSBsYSBjb21tYW5kZSBQREZ0a1xyXG4gICAgICAgICAgICBsZXQgY29tbWFuZCA9IGAke3BkZnRrfSBBPVwiJHtpbnB1dEZpbGV9XCJgO1xyXG4gICAgICAgICAgICBpZiAoYmxhbmtQYWdlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZCArPSBgIEI9XCIke2JsYW5rUGFnZVBhdGh9XCJgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb21tYW5kICs9ICcgY2F0JztcclxuICAgICAgICAgICAgcGFnZVNlcXVlbmNlLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kICs9IGl0ZW0uaXNCbGFuayA/ICcgQjEnIDogYCBBJHtpdGVtLnBhZ2VOdW1iZXJ9YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQgKz0gYCBvdXRwdXQgXCIke291dHB1dEZpbGV9XCJgO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgZXhlY0FzeW5jKGNvbW1hbmQpO1xyXG5cclxuICAgICAgICAgICAgLy8gTmV0dG95YWdlXHJcbiAgICAgICAgICAgIGlmIChibGFua1BhZ2VQYXRoICYmICF0aGlzLnNldHRpbmdzLmtlZXBUZW1wRmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGZzLnVubGluayhibGFua1BhZ2VQYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlYXJyYW5naW5nIHBhZ2VzIGZvciBjaGV2YWw6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIl19