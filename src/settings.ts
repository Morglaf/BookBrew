export interface BookBrewSettings {
    language: string;
    latexPath: string;
    pandocPath: string;
    pdftkPath: string;
    keepTempFiles: boolean;
    paperThickness: number;
    coverThickness: number;
    latexArgs: string[];
    pandocArgs: string[];
}

export const DEFAULT_SETTINGS: BookBrewSettings = {
    language: 'en',
    latexPath: '',
    pandocPath: '',
    pdftkPath: '',
    keepTempFiles: false,
    paperThickness: 0.1,
    coverThickness: 0.3,
    latexArgs: ['-xelatex', '-interaction=nonstopmode', '-halt-on-error'],
    pandocArgs: ['--from=markdown', '--to=latex', '--wrap=none', '--top-level-division=chapter']
}; 