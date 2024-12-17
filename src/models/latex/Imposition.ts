export interface Imposition {
    name: string;
    path: string;
    content?: string;
    format?: string;
    outputFormat?: string;
    type?: 'signature' | 'spread';
} 