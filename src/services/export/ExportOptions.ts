import { TFile } from 'obsidian';
import { Template } from '../../models/latex/Template';
import { Imposition } from '../../models/latex/Imposition';
import { Cover } from '../../models/latex/Cover';

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