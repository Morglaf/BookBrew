export interface Template {
    name: string;
    path: string;
    content?: string;
    format?: string;
}

export interface Imposition {
    name: string;
    path: string;
    content?: string;
    format?: string;
    outputFormat?: string;
    type?: 'signature' | 'spread';
}

export interface Cover {
    name: string;
    path: string;
    content?: string;
    format?: string;
} 