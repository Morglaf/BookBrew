export interface BookBrewSettings {
    language: string;
    defaultTemplate: string | null;
    paperThickness: number;
    outputPath: string;
    keepTempFiles: boolean;
    defaultImposition: string | null;
    defaultCover: string | null;
    latexPath: string;
    latexArgs: string[];
    pandocPath: string;
    pandocArgs: string[];
    pdftkPath: string;
}

export const DEFAULT_SETTINGS: BookBrewSettings = {
    language: 'fr',
    defaultTemplate: null,
    paperThickness: 0.0,
    outputPath: '',
    keepTempFiles: false,
    defaultImposition: null,
    defaultCover: null,
    latexPath: '',
    latexArgs: ['-xelatex', '-interaction=nonstopmode', '-halt-on-error'],
    pandocPath: '',
    pandocArgs: ['--from=markdown', '--to=latex', '--wrap=none', '--top-level-division=chapter'],
    pdftkPath: ''
}; 