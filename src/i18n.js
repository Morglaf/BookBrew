const en = {
    ribbonTooltip: "Open BookBrew",
    commands: {
        openView: "Open BookBrew Panel",
        exportPdf: "Export current note to PDF"
    },
    settings: {
        language: "Language",
        defaultTemplate: "Default LaTeX Template",
        paperThickness: "Paper Thickness (mm)",
        outputPath: "Output Path",
        keepTempFiles: "Keep Temporary Files",
        defaultImposition: "Default Imposition Template",
        latexPath: "XeLaTeX installation path (leave empty to use system PATH)",
        latexSection: "XeLaTeX configuration",
        pandocPath: "Pandoc installation path (leave empty to use system PATH)",
        pandocSection: "Pandoc configuration",
        pdftkPath: "PDFtk installation path (leave empty to use system PATH)",
        pdftkSection: "PDFtk configuration"
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
        pandocNotFound: "Pandoc not found. Please check your Pandoc installation or specify the path in settings."
    }
};
const fr = {
    ribbonTooltip: "Ouvrir BookBrew",
    commands: {
        openView: "Ouvrir le panneau BookBrew",
        exportPdf: "Exporter la note actuelle en PDF"
    },
    settings: {
        language: "Langue",
        defaultTemplate: "Modèle LaTeX par défaut",
        paperThickness: "Épaisseur du papier (mm)",
        outputPath: "Chemin d'exportation",
        keepTempFiles: "Conserver les fichiers temporaires",
        defaultImposition: "Modèle d'imposition par défaut",
        latexPath: "Chemin d'installation XeLaTeX (laisser vide pour utiliser le PATH système)",
        latexSection: "Configuration XeLaTeX",
        pandocPath: "Chemin d'installation Pandoc (laisser vide pour utiliser le PATH système)",
        pandocSection: "Configuration Pandoc",
        pdftkPath: "Chemin d'installation PDFtk (laisser vide pour utiliser le PATH système)",
        pdftkSection: "Configuration PDFtk"
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
        pandocNotFound: "Pandoc non trouvé. Veuillez vérifier votre installation Pandoc ou spécifier le chemin dans les paramètres."
    }
};
const es = {
    ribbonTooltip: "Abrir BookBrew",
    commands: {
        openView: "Abrir panel BookBrew",
        exportPdf: "Exportar nota actual a PDF"
    },
    settings: {
        language: "Idioma",
        defaultTemplate: "Plantilla LaTeX predeterminada",
        paperThickness: "Grosor del papel (mm)",
        outputPath: "Ruta de exportación",
        keepTempFiles: "Mantener archivos temporales",
        defaultImposition: "Plantilla de imposición predeterminada",
        latexPath: "Ruta de instalación de LaTeX (dejar vacío para usar PATH del sistema)",
        latexSection: "Configuración de LaTeX",
        pandocPath: "Ruta de instalación de Pandoc (dejar vacío para usar PATH del sistema)",
        pandocSection: "Configuración de Pandoc",
        pdftkPath: "Ruta de instalación de PDFtk (dejar vacío para usar PATH del sistema)",
        pdftkSection: "Configuración de PDFtk"
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
        pandocNotFound: "Pandoc no encontrado. Por favor, verifique su instalación de Pandoc o especifique la ruta en la configuración."
    }
};
const de = {
    ribbonTooltip: "BookBrew öffnen",
    commands: {
        openView: "BookBrew-Panel öffnen",
        exportPdf: "Aktuelle Notiz als PDF exportieren"
    },
    settings: {
        language: "Sprache",
        defaultTemplate: "Standard-LaTeX-Vorlage",
        paperThickness: "Papierdicke (mm)",
        outputPath: "Ausgabepfad",
        keepTempFiles: "Temporäre Dateien behalten",
        defaultImposition: "Standard-Impositionsvorlage",
        latexPath: "XeLaTeX-Installationspfad (leer lassen für System-PATH)",
        latexSection: "XeLaTeX-Konfiguration",
        pandocPath: "Pandoc-Installationspfad (leer lassen für System-PATH)",
        pandocSection: "Pandoc-Konfiguration",
        pdftkPath: "PDFtk-Installationspfad (leer lassen für System-PATH)",
        pdftkSection: "PDFtk-Konfiguration"
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
        pandocNotFound: "Pandoc nicht gefunden. Bitte überprüfen Sie Ihre Pandoc-Installation oder geben Sie den Pfad in den Einstellungen an."
    }
};
const translations = {
    en,
    fr,
    es,
    de
};
export function loadTranslations(lang) {
    return translations[lang] || translations.en;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImkxOG4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBdUNBLE1BQU0sRUFBRSxHQUFpQjtJQUNyQixhQUFhLEVBQUUsZUFBZTtJQUM5QixRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUscUJBQXFCO1FBQy9CLFNBQVMsRUFBRSw0QkFBNEI7S0FDMUM7SUFDRCxRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUsVUFBVTtRQUNwQixlQUFlLEVBQUUsd0JBQXdCO1FBQ3pDLGNBQWMsRUFBRSxzQkFBc0I7UUFDdEMsVUFBVSxFQUFFLGFBQWE7UUFDekIsYUFBYSxFQUFFLHNCQUFzQjtRQUNyQyxpQkFBaUIsRUFBRSw2QkFBNkI7UUFDaEQsU0FBUyxFQUFFLDREQUE0RDtRQUN2RSxZQUFZLEVBQUUsdUJBQXVCO1FBQ3JDLFVBQVUsRUFBRSwyREFBMkQ7UUFDdkUsYUFBYSxFQUFFLHNCQUFzQjtRQUNyQyxTQUFTLEVBQUUsMERBQTBEO1FBQ3JFLFlBQVksRUFBRSxxQkFBcUI7S0FDdEM7SUFDRCxJQUFJLEVBQUU7UUFDRixLQUFLLEVBQUUsZ0JBQWdCO1FBQ3ZCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGFBQWEsRUFBRSx5QkFBeUI7UUFDeEMsT0FBTyxFQUFFLFNBQVM7UUFDbEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsWUFBWSxFQUFFLDBDQUEwQztRQUN4RCxjQUFjLEVBQUUsc0JBQXNCO1FBQ3RDLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFFBQVEsRUFBRSwwQkFBMEI7UUFDcEMsTUFBTSxFQUFFLFFBQVE7UUFDaEIsY0FBYyxFQUFFLGlCQUFpQjtRQUNqQyxjQUFjLEVBQUUsc0JBQXNCO1FBQ3RDLGFBQWEsRUFBRSxnQkFBZ0I7UUFDL0IsYUFBYSxFQUFFLHdGQUF3RjtRQUN2RyxjQUFjLEVBQUUsMEZBQTBGO0tBQzdHO0NBQ0osQ0FBQztBQUVGLE1BQU0sRUFBRSxHQUFpQjtJQUNyQixhQUFhLEVBQUUsaUJBQWlCO0lBQ2hDLFFBQVEsRUFBRTtRQUNOLFFBQVEsRUFBRSw0QkFBNEI7UUFDdEMsU0FBUyxFQUFFLGtDQUFrQztLQUNoRDtJQUNELFFBQVEsRUFBRTtRQUNOLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLGVBQWUsRUFBRSx5QkFBeUI7UUFDMUMsY0FBYyxFQUFFLDBCQUEwQjtRQUMxQyxVQUFVLEVBQUUsc0JBQXNCO1FBQ2xDLGFBQWEsRUFBRSxvQ0FBb0M7UUFDbkQsaUJBQWlCLEVBQUUsZ0NBQWdDO1FBQ25ELFNBQVMsRUFBRSw0RUFBNEU7UUFDdkYsWUFBWSxFQUFFLHVCQUF1QjtRQUNyQyxVQUFVLEVBQUUsMkVBQTJFO1FBQ3ZGLGFBQWEsRUFBRSxzQkFBc0I7UUFDckMsU0FBUyxFQUFFLDBFQUEwRTtRQUNyRixZQUFZLEVBQUUscUJBQXFCO0tBQ3RDO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsS0FBSyxFQUFFLGNBQWM7UUFDckIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsYUFBYSxFQUFFLDRCQUE0QjtRQUMzQyxPQUFPLEVBQUUsU0FBUztRQUNsQixVQUFVLEVBQUUsWUFBWTtRQUN4QixZQUFZLEVBQUUsb0RBQW9EO1FBQ2xFLGNBQWMsRUFBRSwwQkFBMEI7UUFDMUMsVUFBVSxFQUFFLHNCQUFzQjtRQUNsQyxRQUFRLEVBQUUsaUNBQWlDO1FBQzNDLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLGNBQWMsRUFBRSwwQkFBMEI7UUFDMUMsY0FBYyxFQUFFLDhCQUE4QjtRQUM5QyxhQUFhLEVBQUUsdUJBQXVCO1FBQ3RDLGFBQWEsRUFBRSwwR0FBMEc7UUFDekgsY0FBYyxFQUFFLDRHQUE0RztLQUMvSDtDQUNKLENBQUM7QUFFRixNQUFNLEVBQUUsR0FBaUI7SUFDckIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUsc0JBQXNCO1FBQ2hDLFNBQVMsRUFBRSw0QkFBNEI7S0FDMUM7SUFDRCxRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUsUUFBUTtRQUNsQixlQUFlLEVBQUUsZ0NBQWdDO1FBQ2pELGNBQWMsRUFBRSx1QkFBdUI7UUFDdkMsVUFBVSxFQUFFLHFCQUFxQjtRQUNqQyxhQUFhLEVBQUUsOEJBQThCO1FBQzdDLGlCQUFpQixFQUFFLHdDQUF3QztRQUMzRCxTQUFTLEVBQUUsdUVBQXVFO1FBQ2xGLFlBQVksRUFBRSx3QkFBd0I7UUFDdEMsVUFBVSxFQUFFLHdFQUF3RTtRQUNwRixhQUFhLEVBQUUseUJBQXlCO1FBQ3hDLFNBQVMsRUFBRSx1RUFBdUU7UUFDbEYsWUFBWSxFQUFFLHdCQUF3QjtLQUN6QztJQUNELElBQUksRUFBRTtRQUNGLEtBQUssRUFBRSxpQkFBaUI7UUFDeEIsUUFBUSxFQUFFLFdBQVc7UUFDckIsYUFBYSxFQUFFLDZCQUE2QjtRQUM1QyxPQUFPLEVBQUUsVUFBVTtRQUNuQixVQUFVLEVBQUUsWUFBWTtRQUN4QixZQUFZLEVBQUUsZ0RBQWdEO1FBQzlELGNBQWMsRUFBRSx1QkFBdUI7UUFDdkMsVUFBVSxFQUFFLHFCQUFxQjtRQUNqQyxRQUFRLEVBQUUsOEJBQThCO1FBQ3hDLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLGNBQWMsRUFBRSxzQkFBc0I7UUFDdEMsY0FBYyxFQUFFLHNCQUFzQjtRQUN0QyxhQUFhLEVBQUUsaUJBQWlCO1FBQ2hDLGFBQWEsRUFBRSw4R0FBOEc7UUFDN0gsY0FBYyxFQUFFLGdIQUFnSDtLQUNuSTtDQUNKLENBQUM7QUFFRixNQUFNLEVBQUUsR0FBaUI7SUFDckIsYUFBYSxFQUFFLGlCQUFpQjtJQUNoQyxRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUsdUJBQXVCO1FBQ2pDLFNBQVMsRUFBRSxvQ0FBb0M7S0FDbEQ7SUFDRCxRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUsU0FBUztRQUNuQixlQUFlLEVBQUUsd0JBQXdCO1FBQ3pDLGNBQWMsRUFBRSxrQkFBa0I7UUFDbEMsVUFBVSxFQUFFLGFBQWE7UUFDekIsYUFBYSxFQUFFLDRCQUE0QjtRQUMzQyxpQkFBaUIsRUFBRSw2QkFBNkI7UUFDaEQsU0FBUyxFQUFFLHlEQUF5RDtRQUNwRSxZQUFZLEVBQUUsdUJBQXVCO1FBQ3JDLFVBQVUsRUFBRSx3REFBd0Q7UUFDcEUsYUFBYSxFQUFFLHNCQUFzQjtRQUNyQyxTQUFTLEVBQUUsdURBQXVEO1FBQ2xFLFlBQVksRUFBRSxxQkFBcUI7S0FDdEM7SUFDRCxJQUFJLEVBQUU7UUFDRixLQUFLLEVBQUUsZUFBZTtRQUN0QixRQUFRLEVBQUUsU0FBUztRQUNuQixhQUFhLEVBQUUsNEJBQTRCO1FBQzNDLE9BQU8sRUFBRSxVQUFVO1FBQ25CLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLFlBQVksRUFBRSw4Q0FBOEM7UUFDNUQsY0FBYyxFQUFFLGtCQUFrQjtRQUNsQyxVQUFVLEVBQUUsWUFBWTtRQUN4QixRQUFRLEVBQUUsaUNBQWlDO1FBQzNDLE1BQU0sRUFBRSxhQUFhO1FBQ3JCLGNBQWMsRUFBRSxtQkFBbUI7UUFDbkMsY0FBYyxFQUFFLGtCQUFrQjtRQUNsQyxhQUFhLEVBQUUscUJBQXFCO1FBQ3BDLGFBQWEsRUFBRSxxSEFBcUg7UUFDcEksY0FBYyxFQUFFLHVIQUF1SDtLQUMxSTtDQUNKLENBQUM7QUFFRixNQUFNLFlBQVksR0FBb0M7SUFDbEQsRUFBRTtJQUNGLEVBQUU7SUFDRixFQUFFO0lBQ0YsRUFBRTtDQUNMLENBQUM7QUFFRixNQUFNLFVBQVUsZ0JBQWdCLENBQUMsSUFBWTtJQUN6QyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDO0FBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIFRyYW5zbGF0aW9ucyB7XHJcbiAgICByaWJib25Ub29sdGlwOiBzdHJpbmc7XHJcbiAgICBjb21tYW5kczoge1xyXG4gICAgICAgIG9wZW5WaWV3OiBzdHJpbmc7XHJcbiAgICAgICAgZXhwb3J0UGRmOiBzdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgc2V0dGluZ3M6IHtcclxuICAgICAgICBsYW5ndWFnZTogc3RyaW5nO1xyXG4gICAgICAgIGRlZmF1bHRUZW1wbGF0ZTogc3RyaW5nO1xyXG4gICAgICAgIHBhcGVyVGhpY2tuZXNzOiBzdHJpbmc7XHJcbiAgICAgICAgb3V0cHV0UGF0aDogc3RyaW5nO1xyXG4gICAgICAgIGtlZXBUZW1wRmlsZXM6IHN0cmluZztcclxuICAgICAgICBkZWZhdWx0SW1wb3NpdGlvbjogc3RyaW5nO1xyXG4gICAgICAgIGxhdGV4UGF0aDogc3RyaW5nO1xyXG4gICAgICAgIGxhdGV4U2VjdGlvbjogc3RyaW5nO1xyXG4gICAgICAgIHBhbmRvY1BhdGg6IHN0cmluZztcclxuICAgICAgICBwYW5kb2NTZWN0aW9uOiBzdHJpbmc7XHJcbiAgICAgICAgcGRmdGtQYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgcGRmdGtTZWN0aW9uOiBzdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgdmlldzoge1xyXG4gICAgICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICAgICAgdGVtcGxhdGU6IHN0cmluZztcclxuICAgICAgICBkeW5hbWljRmllbGRzOiBzdHJpbmc7XHJcbiAgICAgICAgb3B0aW9uczogc3RyaW5nO1xyXG4gICAgICAgIGltcG9zaXRpb246IHN0cmluZztcclxuICAgICAgICBjb21wZW5zYXRpb246IHN0cmluZztcclxuICAgICAgICBwYXBlclRoaWNrbmVzczogc3RyaW5nO1xyXG4gICAgICAgIGV4cG9ydFBhdGg6IHN0cmluZztcclxuICAgICAgICBrZWVwVGVtcDogc3RyaW5nO1xyXG4gICAgICAgIGV4cG9ydDogc3RyaW5nO1xyXG4gICAgICAgIGNvdmVyR2VuZXJhdG9yOiBzdHJpbmc7XHJcbiAgICAgICAgY292ZXJUaGlja25lc3M6IHN0cmluZztcclxuICAgICAgICBnZW5lcmF0ZUNvdmVyOiBzdHJpbmc7XHJcbiAgICAgICAgbGF0ZXhOb3RGb3VuZDogc3RyaW5nO1xyXG4gICAgICAgIHBhbmRvY05vdEZvdW5kOiBzdHJpbmc7XHJcbiAgICB9O1xyXG59XHJcblxyXG5jb25zdCBlbjogVHJhbnNsYXRpb25zID0ge1xyXG4gICAgcmliYm9uVG9vbHRpcDogXCJPcGVuIEJvb2tCcmV3XCIsXHJcbiAgICBjb21tYW5kczoge1xyXG4gICAgICAgIG9wZW5WaWV3OiBcIk9wZW4gQm9va0JyZXcgUGFuZWxcIixcclxuICAgICAgICBleHBvcnRQZGY6IFwiRXhwb3J0IGN1cnJlbnQgbm90ZSB0byBQREZcIlxyXG4gICAgfSxcclxuICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgbGFuZ3VhZ2U6IFwiTGFuZ3VhZ2VcIixcclxuICAgICAgICBkZWZhdWx0VGVtcGxhdGU6IFwiRGVmYXVsdCBMYVRlWCBUZW1wbGF0ZVwiLFxyXG4gICAgICAgIHBhcGVyVGhpY2tuZXNzOiBcIlBhcGVyIFRoaWNrbmVzcyAobW0pXCIsXHJcbiAgICAgICAgb3V0cHV0UGF0aDogXCJPdXRwdXQgUGF0aFwiLFxyXG4gICAgICAgIGtlZXBUZW1wRmlsZXM6IFwiS2VlcCBUZW1wb3JhcnkgRmlsZXNcIixcclxuICAgICAgICBkZWZhdWx0SW1wb3NpdGlvbjogXCJEZWZhdWx0IEltcG9zaXRpb24gVGVtcGxhdGVcIixcclxuICAgICAgICBsYXRleFBhdGg6IFwiWGVMYVRlWCBpbnN0YWxsYXRpb24gcGF0aCAobGVhdmUgZW1wdHkgdG8gdXNlIHN5c3RlbSBQQVRIKVwiLFxyXG4gICAgICAgIGxhdGV4U2VjdGlvbjogXCJYZUxhVGVYIGNvbmZpZ3VyYXRpb25cIixcclxuICAgICAgICBwYW5kb2NQYXRoOiBcIlBhbmRvYyBpbnN0YWxsYXRpb24gcGF0aCAobGVhdmUgZW1wdHkgdG8gdXNlIHN5c3RlbSBQQVRIKVwiLFxyXG4gICAgICAgIHBhbmRvY1NlY3Rpb246IFwiUGFuZG9jIGNvbmZpZ3VyYXRpb25cIixcclxuICAgICAgICBwZGZ0a1BhdGg6IFwiUERGdGsgaW5zdGFsbGF0aW9uIHBhdGggKGxlYXZlIGVtcHR5IHRvIHVzZSBzeXN0ZW0gUEFUSClcIixcclxuICAgICAgICBwZGZ0a1NlY3Rpb246IFwiUERGdGsgY29uZmlndXJhdGlvblwiXHJcbiAgICB9LFxyXG4gICAgdmlldzoge1xyXG4gICAgICAgIHRpdGxlOiBcIkxhVGVYIFRlbXBsYXRlXCIsXHJcbiAgICAgICAgdGVtcGxhdGU6IFwiVGVtcGxhdGVcIixcclxuICAgICAgICBkeW5hbWljRmllbGRzOiBcIkRldGVjdGVkIER5bmFtaWMgRmllbGRzXCIsXHJcbiAgICAgICAgb3B0aW9uczogXCJPcHRpb25zXCIsXHJcbiAgICAgICAgaW1wb3NpdGlvbjogXCJJbXBvc2l0aW9uXCIsXHJcbiAgICAgICAgY29tcGVuc2F0aW9uOiBcIkVuYWJsZSBjb21wZW5zYXRpb24gZm9yIGhvcnNlIGltcG9zaXRpb25cIixcclxuICAgICAgICBwYXBlclRoaWNrbmVzczogXCJQYXBlciBUaGlja25lc3MgKG1tKVwiLFxyXG4gICAgICAgIGV4cG9ydFBhdGg6IFwiRXhwb3J0IFBhdGhcIixcclxuICAgICAgICBrZWVwVGVtcDogXCJLZWVwIFRlbXBvcmFyeSBEaXJlY3RvcnlcIixcclxuICAgICAgICBleHBvcnQ6IFwiRXhwb3J0XCIsXHJcbiAgICAgICAgY292ZXJHZW5lcmF0b3I6IFwiQ292ZXIgR2VuZXJhdG9yXCIsXHJcbiAgICAgICAgY292ZXJUaGlja25lc3M6IFwiU3BpbmUgVGhpY2tuZXNzIChtbSlcIixcclxuICAgICAgICBnZW5lcmF0ZUNvdmVyOiBcIkdlbmVyYXRlIENvdmVyXCIsXHJcbiAgICAgICAgbGF0ZXhOb3RGb3VuZDogXCJMYVRlWCBub3QgZm91bmQuIFBsZWFzZSBjaGVjayB5b3VyIExhVGVYIGluc3RhbGxhdGlvbiBvciBzcGVjaWZ5IHRoZSBwYXRoIGluIHNldHRpbmdzLlwiLFxyXG4gICAgICAgIHBhbmRvY05vdEZvdW5kOiBcIlBhbmRvYyBub3QgZm91bmQuIFBsZWFzZSBjaGVjayB5b3VyIFBhbmRvYyBpbnN0YWxsYXRpb24gb3Igc3BlY2lmeSB0aGUgcGF0aCBpbiBzZXR0aW5ncy5cIlxyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZnI6IFRyYW5zbGF0aW9ucyA9IHtcclxuICAgIHJpYmJvblRvb2x0aXA6IFwiT3V2cmlyIEJvb2tCcmV3XCIsXHJcbiAgICBjb21tYW5kczoge1xyXG4gICAgICAgIG9wZW5WaWV3OiBcIk91dnJpciBsZSBwYW5uZWF1IEJvb2tCcmV3XCIsXHJcbiAgICAgICAgZXhwb3J0UGRmOiBcIkV4cG9ydGVyIGxhIG5vdGUgYWN0dWVsbGUgZW4gUERGXCJcclxuICAgIH0sXHJcbiAgICBzZXR0aW5nczoge1xyXG4gICAgICAgIGxhbmd1YWdlOiBcIkxhbmd1ZVwiLFxyXG4gICAgICAgIGRlZmF1bHRUZW1wbGF0ZTogXCJNb2TDqGxlIExhVGVYIHBhciBkw6lmYXV0XCIsXHJcbiAgICAgICAgcGFwZXJUaGlja25lc3M6IFwiw4lwYWlzc2V1ciBkdSBwYXBpZXIgKG1tKVwiLFxyXG4gICAgICAgIG91dHB1dFBhdGg6IFwiQ2hlbWluIGQnZXhwb3J0YXRpb25cIixcclxuICAgICAgICBrZWVwVGVtcEZpbGVzOiBcIkNvbnNlcnZlciBsZXMgZmljaGllcnMgdGVtcG9yYWlyZXNcIixcclxuICAgICAgICBkZWZhdWx0SW1wb3NpdGlvbjogXCJNb2TDqGxlIGQnaW1wb3NpdGlvbiBwYXIgZMOpZmF1dFwiLFxyXG4gICAgICAgIGxhdGV4UGF0aDogXCJDaGVtaW4gZCdpbnN0YWxsYXRpb24gWGVMYVRlWCAobGFpc3NlciB2aWRlIHBvdXIgdXRpbGlzZXIgbGUgUEFUSCBzeXN0w6htZSlcIixcclxuICAgICAgICBsYXRleFNlY3Rpb246IFwiQ29uZmlndXJhdGlvbiBYZUxhVGVYXCIsXHJcbiAgICAgICAgcGFuZG9jUGF0aDogXCJDaGVtaW4gZCdpbnN0YWxsYXRpb24gUGFuZG9jIChsYWlzc2VyIHZpZGUgcG91ciB1dGlsaXNlciBsZSBQQVRIIHN5c3TDqG1lKVwiLFxyXG4gICAgICAgIHBhbmRvY1NlY3Rpb246IFwiQ29uZmlndXJhdGlvbiBQYW5kb2NcIixcclxuICAgICAgICBwZGZ0a1BhdGg6IFwiQ2hlbWluIGQnaW5zdGFsbGF0aW9uIFBERnRrIChsYWlzc2VyIHZpZGUgcG91ciB1dGlsaXNlciBsZSBQQVRIIHN5c3TDqG1lKVwiLFxyXG4gICAgICAgIHBkZnRrU2VjdGlvbjogXCJDb25maWd1cmF0aW9uIFBERnRrXCJcclxuICAgIH0sXHJcbiAgICB2aWV3OiB7XHJcbiAgICAgICAgdGl0bGU6IFwiTW9kw6hsZSBMYVRlWFwiLFxyXG4gICAgICAgIHRlbXBsYXRlOiBcIk1vZMOobGVcIixcclxuICAgICAgICBkeW5hbWljRmllbGRzOiBcIkNoYW1wcyBkeW5hbWlxdWVzIGTDqXRlY3TDqXNcIixcclxuICAgICAgICBvcHRpb25zOiBcIk9wdGlvbnNcIixcclxuICAgICAgICBpbXBvc2l0aW9uOiBcIkltcG9zaXRpb25cIixcclxuICAgICAgICBjb21wZW5zYXRpb246IFwiQWN0aXZlciBsYSBjb21wZW5zYXRpb24gcG91ciBsJ2ltcG9zaXRpb24gw6AgY2hldmFsXCIsXHJcbiAgICAgICAgcGFwZXJUaGlja25lc3M6IFwiw4lwYWlzc2V1ciBkdSBwYXBpZXIgKG1tKVwiLFxyXG4gICAgICAgIGV4cG9ydFBhdGg6IFwiQ2hlbWluIGQnZXhwb3J0YXRpb25cIixcclxuICAgICAgICBrZWVwVGVtcDogXCJDb25zZXJ2ZXIgbGUgZG9zc2llciB0ZW1wb3JhaXJlXCIsXHJcbiAgICAgICAgZXhwb3J0OiBcIkV4cG9ydGVyXCIsXHJcbiAgICAgICAgY292ZXJHZW5lcmF0b3I6IFwiR8OpbsOpcmF0ZXVyIGRlIGNvdXZlcnR1cmVcIixcclxuICAgICAgICBjb3ZlclRoaWNrbmVzczogXCLDiXBhaXNzZXVyIGRlIGxhIHRyYW5jaGUgKG1tKVwiLFxyXG4gICAgICAgIGdlbmVyYXRlQ292ZXI6IFwiR8OpbsOpcmVyIGxhIGNvdXZlcnR1cmVcIixcclxuICAgICAgICBsYXRleE5vdEZvdW5kOiBcIkxhVGVYIG5vbiB0cm91dsOpLiBWZXVpbGxleiB2w6lyaWZpZXIgdm90cmUgaW5zdGFsbGF0aW9uIExhVGVYIG91IHNww6ljaWZpZXIgbGUgY2hlbWluIGRhbnMgbGVzIHBhcmFtw6h0cmVzLlwiLFxyXG4gICAgICAgIHBhbmRvY05vdEZvdW5kOiBcIlBhbmRvYyBub24gdHJvdXbDqS4gVmV1aWxsZXogdsOpcmlmaWVyIHZvdHJlIGluc3RhbGxhdGlvbiBQYW5kb2Mgb3Ugc3DDqWNpZmllciBsZSBjaGVtaW4gZGFucyBsZXMgcGFyYW3DqHRyZXMuXCJcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGVzOiBUcmFuc2xhdGlvbnMgPSB7XHJcbiAgICByaWJib25Ub29sdGlwOiBcIkFicmlyIEJvb2tCcmV3XCIsXHJcbiAgICBjb21tYW5kczoge1xyXG4gICAgICAgIG9wZW5WaWV3OiBcIkFicmlyIHBhbmVsIEJvb2tCcmV3XCIsXHJcbiAgICAgICAgZXhwb3J0UGRmOiBcIkV4cG9ydGFyIG5vdGEgYWN0dWFsIGEgUERGXCJcclxuICAgIH0sXHJcbiAgICBzZXR0aW5nczoge1xyXG4gICAgICAgIGxhbmd1YWdlOiBcIklkaW9tYVwiLFxyXG4gICAgICAgIGRlZmF1bHRUZW1wbGF0ZTogXCJQbGFudGlsbGEgTGFUZVggcHJlZGV0ZXJtaW5hZGFcIixcclxuICAgICAgICBwYXBlclRoaWNrbmVzczogXCJHcm9zb3IgZGVsIHBhcGVsIChtbSlcIixcclxuICAgICAgICBvdXRwdXRQYXRoOiBcIlJ1dGEgZGUgZXhwb3J0YWNpw7NuXCIsXHJcbiAgICAgICAga2VlcFRlbXBGaWxlczogXCJNYW50ZW5lciBhcmNoaXZvcyB0ZW1wb3JhbGVzXCIsXHJcbiAgICAgICAgZGVmYXVsdEltcG9zaXRpb246IFwiUGxhbnRpbGxhIGRlIGltcG9zaWNpw7NuIHByZWRldGVybWluYWRhXCIsXHJcbiAgICAgICAgbGF0ZXhQYXRoOiBcIlJ1dGEgZGUgaW5zdGFsYWNpw7NuIGRlIExhVGVYIChkZWphciB2YWPDrW8gcGFyYSB1c2FyIFBBVEggZGVsIHNpc3RlbWEpXCIsXHJcbiAgICAgICAgbGF0ZXhTZWN0aW9uOiBcIkNvbmZpZ3VyYWNpw7NuIGRlIExhVGVYXCIsXHJcbiAgICAgICAgcGFuZG9jUGF0aDogXCJSdXRhIGRlIGluc3RhbGFjacOzbiBkZSBQYW5kb2MgKGRlamFyIHZhY8OtbyBwYXJhIHVzYXIgUEFUSCBkZWwgc2lzdGVtYSlcIixcclxuICAgICAgICBwYW5kb2NTZWN0aW9uOiBcIkNvbmZpZ3VyYWNpw7NuIGRlIFBhbmRvY1wiLFxyXG4gICAgICAgIHBkZnRrUGF0aDogXCJSdXRhIGRlIGluc3RhbGFjacOzbiBkZSBQREZ0ayAoZGVqYXIgdmFjw61vIHBhcmEgdXNhciBQQVRIIGRlbCBzaXN0ZW1hKVwiLFxyXG4gICAgICAgIHBkZnRrU2VjdGlvbjogXCJDb25maWd1cmFjacOzbiBkZSBQREZ0a1wiXHJcbiAgICB9LFxyXG4gICAgdmlldzoge1xyXG4gICAgICAgIHRpdGxlOiBcIlBsYW50aWxsYSBMYVRlWFwiLFxyXG4gICAgICAgIHRlbXBsYXRlOiBcIlBsYW50aWxsYVwiLFxyXG4gICAgICAgIGR5bmFtaWNGaWVsZHM6IFwiQ2FtcG9zIGRpbsOhbWljb3MgZGV0ZWN0YWRvc1wiLFxyXG4gICAgICAgIG9wdGlvbnM6IFwiT3BjaW9uZXNcIixcclxuICAgICAgICBpbXBvc2l0aW9uOiBcIkltcG9zaWNpw7NuXCIsXHJcbiAgICAgICAgY29tcGVuc2F0aW9uOiBcIkFjdGl2YXIgY29tcGVuc2FjacOzbiBwYXJhIGltcG9zaWNpw7NuIGEgY2FiYWxsb1wiLFxyXG4gICAgICAgIHBhcGVyVGhpY2tuZXNzOiBcIkdyb3NvciBkZWwgcGFwZWwgKG1tKVwiLFxyXG4gICAgICAgIGV4cG9ydFBhdGg6IFwiUnV0YSBkZSBleHBvcnRhY2nDs25cIixcclxuICAgICAgICBrZWVwVGVtcDogXCJNYW50ZW5lciBkaXJlY3RvcmlvIHRlbXBvcmFsXCIsXHJcbiAgICAgICAgZXhwb3J0OiBcIkV4cG9ydGFyXCIsXHJcbiAgICAgICAgY292ZXJHZW5lcmF0b3I6IFwiR2VuZXJhZG9yIGRlIHBvcnRhZGFcIixcclxuICAgICAgICBjb3ZlclRoaWNrbmVzczogXCJHcm9zb3IgZGVsIGxvbW8gKG1tKVwiLFxyXG4gICAgICAgIGdlbmVyYXRlQ292ZXI6IFwiR2VuZXJhciBwb3J0YWRhXCIsXHJcbiAgICAgICAgbGF0ZXhOb3RGb3VuZDogXCJMYVRlWCBubyBlbmNvbnRyYWRvLiBQb3IgZmF2b3IsIHZlcmlmaXF1ZSBzdSBpbnN0YWxhY2nDs24gZGUgTGFUZVggbyBlc3BlY2lmaXF1ZSBsYSBydXRhIGVuIGxhIGNvbmZpZ3VyYWNpw7NuLlwiLFxyXG4gICAgICAgIHBhbmRvY05vdEZvdW5kOiBcIlBhbmRvYyBubyBlbmNvbnRyYWRvLiBQb3IgZmF2b3IsIHZlcmlmaXF1ZSBzdSBpbnN0YWxhY2nDs24gZGUgUGFuZG9jIG8gZXNwZWNpZmlxdWUgbGEgcnV0YSBlbiBsYSBjb25maWd1cmFjacOzbi5cIlxyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZGU6IFRyYW5zbGF0aW9ucyA9IHtcclxuICAgIHJpYmJvblRvb2x0aXA6IFwiQm9va0JyZXcgw7ZmZm5lblwiLFxyXG4gICAgY29tbWFuZHM6IHtcclxuICAgICAgICBvcGVuVmlldzogXCJCb29rQnJldy1QYW5lbCDDtmZmbmVuXCIsXHJcbiAgICAgICAgZXhwb3J0UGRmOiBcIkFrdHVlbGxlIE5vdGl6IGFscyBQREYgZXhwb3J0aWVyZW5cIlxyXG4gICAgfSxcclxuICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgbGFuZ3VhZ2U6IFwiU3ByYWNoZVwiLFxyXG4gICAgICAgIGRlZmF1bHRUZW1wbGF0ZTogXCJTdGFuZGFyZC1MYVRlWC1Wb3JsYWdlXCIsXHJcbiAgICAgICAgcGFwZXJUaGlja25lc3M6IFwiUGFwaWVyZGlja2UgKG1tKVwiLFxyXG4gICAgICAgIG91dHB1dFBhdGg6IFwiQXVzZ2FiZXBmYWRcIixcclxuICAgICAgICBrZWVwVGVtcEZpbGVzOiBcIlRlbXBvcsOkcmUgRGF0ZWllbiBiZWhhbHRlblwiLFxyXG4gICAgICAgIGRlZmF1bHRJbXBvc2l0aW9uOiBcIlN0YW5kYXJkLUltcG9zaXRpb25zdm9ybGFnZVwiLFxyXG4gICAgICAgIGxhdGV4UGF0aDogXCJYZUxhVGVYLUluc3RhbGxhdGlvbnNwZmFkIChsZWVyIGxhc3NlbiBmw7xyIFN5c3RlbS1QQVRIKVwiLFxyXG4gICAgICAgIGxhdGV4U2VjdGlvbjogXCJYZUxhVGVYLUtvbmZpZ3VyYXRpb25cIixcclxuICAgICAgICBwYW5kb2NQYXRoOiBcIlBhbmRvYy1JbnN0YWxsYXRpb25zcGZhZCAobGVlciBsYXNzZW4gZsO8ciBTeXN0ZW0tUEFUSClcIixcclxuICAgICAgICBwYW5kb2NTZWN0aW9uOiBcIlBhbmRvYy1Lb25maWd1cmF0aW9uXCIsXHJcbiAgICAgICAgcGRmdGtQYXRoOiBcIlBERnRrLUluc3RhbGxhdGlvbnNwZmFkIChsZWVyIGxhc3NlbiBmw7xyIFN5c3RlbS1QQVRIKVwiLFxyXG4gICAgICAgIHBkZnRrU2VjdGlvbjogXCJQREZ0ay1Lb25maWd1cmF0aW9uXCJcclxuICAgIH0sXHJcbiAgICB2aWV3OiB7XHJcbiAgICAgICAgdGl0bGU6IFwiTGFUZVgtVm9ybGFnZVwiLFxyXG4gICAgICAgIHRlbXBsYXRlOiBcIlZvcmxhZ2VcIixcclxuICAgICAgICBkeW5hbWljRmllbGRzOiBcIkVya2FubnRlIGR5bmFtaXNjaGUgRmVsZGVyXCIsXHJcbiAgICAgICAgb3B0aW9uczogXCJPcHRpb25lblwiLFxyXG4gICAgICAgIGltcG9zaXRpb246IFwiSW1wb3NpdGlvblwiLFxyXG4gICAgICAgIGNvbXBlbnNhdGlvbjogXCJLb21wZW5zYXRpb24gZsO8ciBTYXR0ZWxpbXBvc2l0aW9uIGFrdGl2aWVyZW5cIixcclxuICAgICAgICBwYXBlclRoaWNrbmVzczogXCJQYXBpZXJkaWNrZSAobW0pXCIsXHJcbiAgICAgICAgZXhwb3J0UGF0aDogXCJFeHBvcnRwZmFkXCIsXHJcbiAgICAgICAga2VlcFRlbXA6IFwiVGVtcG9yw6RyZXMgVmVyemVpY2huaXMgYmVoYWx0ZW5cIixcclxuICAgICAgICBleHBvcnQ6IFwiRXhwb3J0aWVyZW5cIixcclxuICAgICAgICBjb3ZlckdlbmVyYXRvcjogXCJVbXNjaGxhZ2dlbmVyYXRvclwiLFxyXG4gICAgICAgIGNvdmVyVGhpY2tuZXNzOiBcIlLDvGNrZW5kaWNrZSAobW0pXCIsXHJcbiAgICAgICAgZ2VuZXJhdGVDb3ZlcjogXCJVbXNjaGxhZyBnZW5lcmllcmVuXCIsXHJcbiAgICAgICAgbGF0ZXhOb3RGb3VuZDogXCJMYVRlWCBuaWNodCBnZWZ1bmRlbi4gQml0dGUgw7xiZXJwcsO8ZmVuIFNpZSBJaHJlIExhVGVYLUluc3RhbGxhdGlvbiBvZGVyIGdlYmVuIFNpZSBkZW4gUGZhZCBpbiBkZW4gRWluc3RlbGx1bmdlbiBhbi5cIixcclxuICAgICAgICBwYW5kb2NOb3RGb3VuZDogXCJQYW5kb2MgbmljaHQgZ2VmdW5kZW4uIEJpdHRlIMO8YmVycHLDvGZlbiBTaWUgSWhyZSBQYW5kb2MtSW5zdGFsbGF0aW9uIG9kZXIgZ2ViZW4gU2llIGRlbiBQZmFkIGluIGRlbiBFaW5zdGVsbHVuZ2VuIGFuLlwiXHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCB0cmFuc2xhdGlvbnM6IHsgW2tleTogc3RyaW5nXTogVHJhbnNsYXRpb25zIH0gPSB7XHJcbiAgICBlbixcclxuICAgIGZyLFxyXG4gICAgZXMsXHJcbiAgICBkZVxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRUcmFuc2xhdGlvbnMobGFuZzogc3RyaW5nKTogVHJhbnNsYXRpb25zIHtcclxuICAgIHJldHVybiB0cmFuc2xhdGlvbnNbbGFuZ10gfHwgdHJhbnNsYXRpb25zLmVuO1xyXG59ICJdfQ==