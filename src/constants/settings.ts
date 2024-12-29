export const VIEW_TYPE_BOOKBREW = 'bookbrew-view';

export const DEFAULT_SETTINGS = {
    language: 'auto',
    latexPath: '',
    pandocPath: '',
    pdftkPath: '',
    keepTempFiles: false,
    lastExportPath: '',
    paperThickness: 0.1,
    coverThickness: 2.0,
    toggles: {
        coverPage: true,
        halfTitlePage: true,
        titlePage: true,
        tableOfContents: false,
        tableOfContentsEnd: false
    }
} as const; 