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
    lastExportPath: string;
    toggles: {
        [key: string]: boolean;
        coverPage: boolean;
        halfTitlePage: boolean;
        titlePage: boolean;
        tableOfContents: boolean;
        tableOfContentsEnd: boolean;
    };
}

export const DEFAULT_SETTINGS: BookBrewSettings = {
    language: 'auto',
    latexPath: '',
    pandocPath: '',
    pdftkPath: '',
    keepTempFiles: false,
    paperThickness: 0.1,
    coverThickness: 0.3,
    latexArgs: ['-xelatex', '-interaction=nonstopmode', '-halt-on-error'],
    pandocArgs: ['--from=markdown', '--to=latex', '--wrap=none', '--top-level-division=chapter'],
    lastExportPath: '',
    toggles: {
        coverPage: false,
        halfTitlePage: false,
        titlePage: true,
        tableOfContents: true,
        tableOfContentsEnd: false
    }
}; 