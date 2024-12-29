import { normalizePath } from 'obsidian';
import { join } from 'path';

export function getExportPath(exportDir: string, baseName: string, suffix: string = ''): string {
    const fileName = suffix ? `${baseName}${suffix}.pdf` : `${baseName}.pdf`;
    return normalizePath(join(exportDir, fileName));
}

export function getTempPath(tempDir: string, fileName: string): string {
    return normalizePath(join(tempDir, fileName));
}

export function getPluginResourcePath(pluginPath: string, resourceType: string, fileName: string): string {
    return normalizePath(join(pluginPath, 'typeset', resourceType, fileName));
} 