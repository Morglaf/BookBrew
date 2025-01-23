import { moment } from 'obsidian';

export interface Translations {
    ribbonTooltip: string;
    commands: {
        openView: string;
        exportPdf: string;
    };
    settings: {
        language: string;
        latexPath: string;
        latexSection: string;
        pandocPath: string;
        pandocSection: string;
        pdftkPath: string;
        pdftkSection: string;
        generalSection: string;
        keepTempFiles: string;
    };
    view: {
        title: string;
        template: string;
        dynamicFields: string;
        options: string;
        imposition: string;
        compensation: string;
        paperThickness: string;
        exportPath: string;
        keepTemp: string;
        export: string;
        coverGenerator: string;
        coverThickness: string;
        generateCover: string;
        latexNotFound: string;
        pandocNotFound: string;
        none: string;
        cancel: string;
        exportProgress: {
            starting: string;
            converting: string;
            compiling: string;
            generatingCover: string;
            applyingImposition: string;
            completed: string;
            failed: string;
            cancelled: string;
        };
        toggles: {
            coverPage: string;
            halfTitlePage: string;
            titlePage: string;
            tableOfContents: string;
            tableOfContentsEnd: string;
        };
        notices: {
            toggleUpdateError: string;
            noExportPath: string;
            noCoverTemplate: string;
            coverTemplateNotFound: string;
            noActiveFile: string;
            coverGenerated: string;
            coverGenerationFailed: string;
            noTemplateSelected: string;
            templateNotFound: string;
            exportFailed: string;
            exportCompleted: string;
            exportCancelled: string;
            noTemplatesAvailable: string;
        };
    };
}

const en: Translations = {
    ribbonTooltip: "Open BookBrew",
    commands: {
        openView: "Open BookBrew panel",
        exportPdf: "Export current note to PDF"
    },
    settings: {
        language: "Language",
        latexPath: "XeLaTeX installation path (leave empty to use system PATH)",
        latexSection: "XeLaTeX",
        pandocPath: "Pandoc installation path (leave empty to use system PATH)",
        pandocSection: "Pandoc",
        pdftkPath: "PDFtk installation path (leave empty to use system PATH)",
        pdftkSection: "PDFtk",
        generalSection: "General",
        keepTempFiles: "Keep temporary files"
    },
    view: {
        title: "LaTeX template",
        template: "Template",
        dynamicFields: "Detected dynamic fields",
        options: "Options",
        imposition: "Imposition",
        compensation: "Enable compensation for horse imposition",
        paperThickness: "Paper thickness (mm)",
        exportPath: "Export path",
        keepTemp: "Keep temporary directory",
        export: "Export",
        coverGenerator: "Cover generator",
        coverThickness: "Spine thickness (mm)",
        generateCover: "Generate cover",
        latexNotFound: "LaTeX not found. Please check your LaTeX installation or specify the path in settings.",
        pandocNotFound: "Pandoc not found. Please check your Pandoc installation or specify the path in settings.",
        none: "None",
        cancel: "Cancel",
        exportProgress: {
            starting: "Starting export...",
            converting: "Converting Markdown to LaTeX...",
            compiling: "Compiling LaTeX...",
            generatingCover: "Generating cover...",
            applyingImposition: "Applying imposition...",
            completed: "Export completed successfully",
            failed: "Export failed: {0}",
            cancelled: "Export cancelled"
        },
        toggles: {
            coverPage: "Cover page",
            halfTitlePage: "Half title page",
            titlePage: "Title page",
            tableOfContents: "Table of contents at start",
            tableOfContentsEnd: "Table of contents at end"
        },
        notices: {
            toggleUpdateError: "Failed to update toggle {0}: {1}",
            noExportPath: "No export path selected",
            noCoverTemplate: "No cover template selected",
            coverTemplateNotFound: "Cover template not found",
            noActiveFile: "No active file",
            coverGenerated: "Cover generated: {0}",
            coverGenerationFailed: "Cover generation failed: {0}",
            noTemplateSelected: "No template selected",
            templateNotFound: "Template not found",
            exportFailed: "Export failed: {0}",
            exportCompleted: "Export completed successfully",
            exportCancelled: "Export cancelled",
            noTemplatesAvailable: "No templates available"
        }
    }
};

const fr: Translations = {
    ribbonTooltip: "Ouvrir BookBrew",
    commands: {
        openView: "Ouvrir le panneau BookBrew",
        exportPdf: "Exporter la note actuelle en PDF"
    },
    settings: {
        language: "Langue",
        latexPath: "Chemin d'installation XeLaTeX (laisser vide pour utiliser le PATH système)",
        latexSection: "XeLaTeX",
        pandocPath: "Chemin d'installation Pandoc (laisser vide pour utiliser le PATH système)",
        pandocSection: "Pandoc",
        pdftkPath: "Chemin d'installation PDFtk (laisser vide pour utiliser le PATH système)",
        pdftkSection: "PDFtk",
        generalSection: "Général",
        keepTempFiles: "Conserver les fichiers temporaires"
    },
    view: {
        title: "Modèle LaTeX",
        template: "Modèle",
        dynamicFields: "Champs dynamiques détectés",
        options: "Options",
        imposition: "Imposition",
        compensation: "Activer la compensation pour l'imposition à cheval",
        paperThickness: "Épaisseur du papier (mm)",
        exportPath: "Chemin d'exportation",
        keepTemp: "Conserver le dossier temporaire",
        export: "Exporter",
        coverGenerator: "Générateur de couverture",
        coverThickness: "Épaisseur de la tranche (mm)",
        generateCover: "Générer la couverture",
        latexNotFound: "LaTeX non trouvé. Veuillez vérifier votre installation LaTeX ou spécifier le chemin dans les paramètres.",
        pandocNotFound: "Pandoc non trouvé. Veuillez vérifier votre installation Pandoc ou spécifier le chemin dans les paramètres.",
        none: "Non",
        cancel: "Annuler",
        exportProgress: {
            starting: "Démarrage de l'export...",
            converting: "Conversion du Markdown vers LaTeX...",
            compiling: "Compilation LaTeX...",
            generatingCover: "Génération de la couverture...",
            applyingImposition: "Application de l'imposition...",
            completed: "Export terminé avec succès",
            failed: "Échec de l'export : {0}",
            cancelled: "Export annulé"
        },
        toggles: {
            coverPage: "Page de garde",
            halfTitlePage: "Page de demi-titre",
            titlePage: "Page de titre",
            tableOfContents: "Table des matières au début",
            tableOfContentsEnd: "Table des matières à la fin"
        },
        notices: {
            toggleUpdateError: "Erreur lors de la mise à jour du toggle {0} : {1}",
            noExportPath: "Aucun chemin d'exportation sélectionné",
            noCoverTemplate: "Aucun modèle de couverture sélectionné",
            coverTemplateNotFound: "Modèle de couverture introuvable",
            noActiveFile: "Aucun fichier actif",
            coverGenerated: "Couverture générée : {0}",
            coverGenerationFailed: "Échec de la génération de la couverture : {0}",
            noTemplateSelected: "Aucun modèle sélectionné",
            templateNotFound: "Modèle introuvable",
            exportFailed: "Échec de l'export : {0}",
            exportCompleted: "Export terminé avec succès",
            exportCancelled: "Export annulé",
            noTemplatesAvailable: "Aucun modèle disponible"
        }
    }
};

const es: Translations = {
    ribbonTooltip: "Abrir BookBrew",
    commands: {
        openView: "Abrir panel BookBrew",
        exportPdf: "Exportar nota actual a PDF"
    },
    settings: {
        language: "Idioma",
        latexPath: "Ruta de instalación de XeLaTeX (dejar vacío para usar PATH del sistema)",
        latexSection: "XeLaTeX",
        pandocPath: "Ruta de instalación de Pandoc (dejar vacío para usar PATH del sistema)",
        pandocSection: "Pandoc",
        pdftkPath: "Ruta de instalación de PDFtk (dejar vacío para usar PATH del sistema)",
        pdftkSection: "PDFtk",
        generalSection: "General",
        keepTempFiles: "Mantener archivos temporales"
    },
    view: {
        title: "Plantilla LaTeX",
        template: "Plantilla",
        dynamicFields: "Campos dinámicos detectados",
        options: "Opciones",
        imposition: "Imposición",
        compensation: "Activar compensación para imposición a caballo",
        paperThickness: "Grosor del papel (mm)",
        exportPath: "Ruta de exportación",
        keepTemp: "Mantener directorio temporal",
        export: "Exportar",
        coverGenerator: "Generador de portada",
        coverThickness: "Grosor del lomo (mm)",
        generateCover: "Generar portada",
        latexNotFound: "LaTeX no encontrado. Por favor, verifique su instalación de LaTeX o especifique la ruta en la configuración.",
        pandocNotFound: "Pandoc no encontrado. Por favor, verifique su instalación de Pandoc o especifique la ruta en la configuración.",
        none: "No",
        cancel: "Cancelar",
        exportProgress: {
            starting: "Iniciando exportación...",
            converting: "Convirtiendo Markdown a LaTeX...",
            compiling: "Compilando LaTeX...",
            generatingCover: "Generando portada...",
            applyingImposition: "Aplicando imposición...",
            completed: "Exportación completada con éxito",
            failed: "Error en la exportación: {0}",
            cancelled: "Exportación cancelada"
        },
        toggles: {
            coverPage: "Página de cubierta",
            halfTitlePage: "Página de medio título",
            titlePage: "Página de título",
            tableOfContents: "Índice al principio",
            tableOfContentsEnd: "Índice al final"
        },
        notices: {
            toggleUpdateError: "Error al actualizar el toggle {0}: {1}",
            noExportPath: "No se ha seleccionado ruta de exportación",
            noCoverTemplate: "No se ha seleccionado plantilla de portada",
            coverTemplateNotFound: "Plantilla de portada no encontrada",
            noActiveFile: "No hay archivo activo",
            coverGenerated: "Portada generada: {0}",
            coverGenerationFailed: "Error al generar la portada: {0}",
            noTemplateSelected: "No se ha seleccionado plantilla",
            templateNotFound: "Plantilla no encontrada",
            exportFailed: "Error en la exportación: {0}",
            exportCompleted: "Exportación completada con éxito",
            exportCancelled: "Exportación cancelada",
            noTemplatesAvailable: "No hay plantillas disponibles"
        }
    }
};

const de: Translations = {
    ribbonTooltip: "BookBrew öffnen",
    commands: {
        openView: "BookBrew-Panel öffnen",
        exportPdf: "Aktuelle Notiz als PDF exportieren"
    },
    settings: {
        language: "Sprache",
        latexPath: "XeLaTeX-Installationspfad (leer lassen für System-PATH)",
        latexSection: "XeLaTeX",
        pandocPath: "Pandoc-Installationspfad (leer lassen für System-PATH)",
        pandocSection: "Pandoc",
        pdftkPath: "PDFtk-Installationspfad (leer lassen für System-PATH)",
        pdftkSection: "PDFtk",
        generalSection: "Allgemein",
        keepTempFiles: "Temporäre Dateien behalten"
    },
    view: {
        title: "LaTeX-Vorlage",
        template: "Vorlage",
        dynamicFields: "Erkannte dynamische Felder",
        options: "Optionen",
        imposition: "Imposition",
        compensation: "Kompensation für Sattelimposition aktivieren",
        paperThickness: "Papierdicke (mm)",
        exportPath: "Exportpfad",
        keepTemp: "Temporäres Verzeichnis behalten",
        export: "Exportieren",
        coverGenerator: "Umschlaggenerator",
        coverThickness: "Rückendicke (mm)",
        generateCover: "Umschlag generieren",
        latexNotFound: "LaTeX nicht gefunden. Bitte überprüfen Sie Ihre LaTeX-Installation oder geben Sie den Pfad in den Einstellungen an.",
        pandocNotFound: "Pandoc nicht gefunden. Bitte überprüfen Sie Ihre Pandoc-Installation oder geben Sie den Pfad in den Einstellungen an.",
        none: "Nein",
        cancel: "Abbrechen",
        exportProgress: {
            starting: "Export wird gestartet...",
            converting: "Konvertiere Markdown zu LaTeX...",
            compiling: "Kompiliere LaTeX...",
            generatingCover: "Generiere Umschlag...",
            applyingImposition: "Wende Imposition an...",
            completed: "Export erfolgreich abgeschlossen",
            failed: "Export fehlgeschlagen: {0}",
            cancelled: "Export abgebrochen"
        },
        toggles: {
            coverPage: "Umschlagseite",
            halfTitlePage: "Schmutztitel",
            titlePage: "Titelseite",
            tableOfContents: "Inhaltsverzeichnis am Anfang",
            tableOfContentsEnd: "Inhaltsverzeichnis am Ende"
        },
        notices: {
            toggleUpdateError: "Fehler beim Aktualisieren des Toggles {0}: {1}",
            noExportPath: "Kein Exportpfad ausgewählt",
            noCoverTemplate: "Keine Umschlagvorlage ausgewählt",
            coverTemplateNotFound: "Umschlagvorlage nicht gefunden",
            noActiveFile: "Keine aktive Datei",
            coverGenerated: "Umschlag generiert: {0}",
            coverGenerationFailed: "Umschlaggenerierung fehlgeschlagen: {0}",
            noTemplateSelected: "Keine Vorlage ausgewählt",
            templateNotFound: "Vorlage nicht gefunden",
            exportFailed: "Export fehlgeschlagen: {0}",
            exportCompleted: "Export erfolgreich abgeschlossen",
            exportCancelled: "Export abgebrochen",
            noTemplatesAvailable: "Keine Vorlagen verfügbar"
        }
    }
};

const translations: { [key: string]: Translations } = {
    en,
    fr,
    es,
    de
};

// Fonction pour détecter la langue du système
export function detectLanguage(): string {
    // Utiliser la langue de moment.js qui est synchronisée avec Obsidian
    const obsidianLocale = moment.locale();
    
    // Convertir la locale en code de langue simple
    const lang = obsidianLocale.split('-')[0];
    
    // Vérifier si la langue est supportée
    if (['en', 'fr', 'es', 'de'].includes(lang)) {
        return lang;
    }
    
    // Par défaut, utiliser l'anglais
    return 'en';
}

export function loadTranslations(): Translations {
    const obsidianLocale = moment.locale();
    const lang = obsidianLocale.split('-')[0];
    
    // Vérifier si la langue est supportée
    switch (lang) {
        case 'fr':
            return fr;
        case 'es':
            return es;
        case 'de':
            return de;
        default:
            return en;
    }
} 