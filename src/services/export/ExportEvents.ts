export type ExportEventType = 'progress' | 'log' | 'error' | 'complete' | 'cancelled';

export interface ExportEvent {
    type: ExportEventType;
    message: string;
    progress?: number; // 0-100
    error?: Error;
    result?: {
        pdf?: string;
        cover?: string;
    };
}

export type ExportEventCallback = (event: ExportEvent) => void; 