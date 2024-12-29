import { TFile } from 'obsidian';

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

export interface ExportResult {
    pdf: string;
    cover?: string;
}

export interface ExportOptions {
    file: TFile;
    template: Template;
    dynamicFields: Record<string, any>;
    toggles: Record<string, boolean>;
    outputPath: string;
    imposition?: Imposition;
    paperThickness?: number;
    cover?: Cover;
    coverFields?: Record<string, any>;
    coverThickness?: number;
}

export type ExportEventType = 'progress' | 'log' | 'error' | 'complete' | 'cancelled';

export interface ExportEvent {
    type: ExportEventType;
    message: string;
    progress?: number;
    error?: Error;
    result?: ExportResult;
}

export type ExportEventCallback = (event: ExportEvent) => void; 