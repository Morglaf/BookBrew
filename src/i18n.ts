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
    };
}

const en: Translations = {
    ribbonTooltip: "Open BookBrew",
    commands: {
        openView: "Open BookBrew Panel",
        exportPdf: "Export current note to PDF"
    },
    settings: {
        language: "Language",
        latexPath: "XeLaTeX installation path (leave empty to use system PATH)",
        latexSection: "XeLaTeX configuration",
        pandocPath: "Pandoc installation path (leave empty to use system PATH)",
        pandocSection: "Pandoc configuration",
        pdftkPath: "PDFtk installation path (leave empty to use system PATH)",
        pdftkSection: "PDFtk configuration",
        generalSection: "General options",
        keepTempFiles: "Keep temporary files"
    },
    view: {
        title: "LaTeX Template",
        template: "Template",
        dynamicFields: "Detected Dynamic Fields",
        options: "Options",
        imposition: "Imposition",
        compensation: "Enable compensation for horse imposition",
        paperThickness: "Paper Thickness (mm)",
        exportPath: "Export Path",
        keepTemp: "Keep Temporary Directory",
        export: "Export",
        coverGenerator: "Cover Generator",
        coverThickness: "Spine Thickness (mm)",
        generateCover: "Generate Cover",
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
            coverPage: "Cover Page",
            halfTitlePage: "Half Title Page",
            titlePage: "Title Page",
            tableOfContents: "Table of Contents at Start",
            tableOfContentsEnd: "Table of Contents at End"
        },
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
        latexSection: "Configuration XeLaTeX",
        pandocPath: "Chemin d'installation Pandoc (laisser vide pour utiliser le PATH système)",
        pandocSection: "Configuration Pandoc",
        pdftkPath: "Chemin d'installation PDFtk (laisser vide pour utiliser le PATH système)",
        pdftkSection: "Configuration PDFtk",
        generalSection: "Options générales",
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
            coverPage: "Page de Garde",
            halfTitlePage: "Page de Demi-titre",
            titlePage: "Page de Titre",
            tableOfContents: "Table des Matières au Début",
            tableOfContentsEnd: "Table des Matières à la Fin"
        },
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
        latexSection: "Configuración de XeLaTeX",
        pandocPath: "Ruta de instalación de Pandoc (dejar vacío para usar PATH del sistema)",
        pandocSection: "Configuración de Pandoc",
        pdftkPath: "Ruta de instalación de PDFtk (dejar vacío para usar PATH del sistema)",
        pdftkSection: "Configuración de PDFtk",
        generalSection: "Opciones generales",
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
            coverPage: "Página de Cubierta",
            halfTitlePage: "Página de Medio Título",
            titlePage: "Página de Título",
            tableOfContents: "Índice al Principio",
            tableOfContentsEnd: "Índice al Final"
        },
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
        latexSection: "XeLaTeX-Konfiguration",
        pandocPath: "Pandoc-Installationspfad (leer lassen für System-PATH)",
        pandocSection: "Pandoc-Konfiguration",
        pdftkPath: "PDFtk-Installationspfad (leer lassen für System-PATH)",
        pdftkSection: "PDFtk-Konfiguration",
        generalSection: "Allgemeine Optionen",
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
    }
};

const translations: { [key: string]: Translations } = {
    en,
    fr,
    es,
    de
};

export function loadTranslations(lang: string): Translations {
    return translations[lang] || translations.en;
} 