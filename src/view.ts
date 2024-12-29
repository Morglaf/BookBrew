import { ItemView, WorkspaceLeaf, ToggleComponent, setIcon, Notice } from 'obsidian';
import BookBrewPlugin from './main';
import { BookBrewSettings } from './settings';
import { ExportOptions } from './types/interfaces';
import { ExportProgressUI } from './ui/ExportProgressUI';
import { VIEW_TYPE_BOOKBREW } from './constants/settings';
import { getExportPath } from './utils/paths';
import { join } from 'path';

export class BookBrewView extends ItemView {
    private plugin: BookBrewPlugin;
    private selectedFormat: string = '';
    private thicknessSection: HTMLDivElement;
    private impositionSelect: HTMLSelectElement;
    private coverSelect: HTMLSelectElement;
    private progressBar: HTMLProgressElement;
    private progressText: HTMLDivElement;
    private cancelButton: HTMLButtonElement;
    private logContainer: HTMLDivElement;
    private isExporting: boolean = false;
    private progressUI: ExportProgressUI;

    constructor(leaf: WorkspaceLeaf, plugin: BookBrewPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_BOOKBREW;
    }

    getDisplayText(): string {
        return 'BookBrew';
    }

    getIcon(): string {
        return 'book-dashed';
    }

    private createProgressSection(container: HTMLElement) {
        const progressSection = container.createDiv({ cls: 'progress-section hidden' });
        
        const progressHeader = progressSection.createDiv({ cls: 'progress-header' });
        this.progressText = progressHeader.createDiv({ cls: 'progress-text' });
        
        this.cancelButton = progressHeader.createEl('button', {
            text: this.plugin.translations.view.cancel,
            cls: 'cancel-button'
        });
        this.cancelButton.addEventListener('click', () => {
            if (this.isExporting) {
                this.plugin.exportCoordinator.cancelExport();
            }
        });

        this.progressBar = progressSection.createEl('progress', {
            cls: 'progress-bar',
            attr: { max: '100', value: '0' }
        });

        this.logContainer = progressSection.createDiv({ cls: 'log-container' });
    }

    private updateProgress(progress: number, message: string) {
        this.progressUI.updateProgress(progress, message);
    }

    private addLogMessage(message: string) {
        this.progressUI.addLogMessage(message);
    }

    private showProgress() {
        this.progressUI.show();
    }

    private hideProgress() {
        this.progressUI.hide();
    }

    async onOpen() {
        const { containerEl } = this;
        containerEl.empty();
        
        this.progressUI = new ExportProgressUI(containerEl);
        
        // Titre avec icône
        const titleContainer = containerEl.createDiv({ cls: 'bookbrew-title' });
        const titleIcon = titleContainer.createSpan({ cls: 'bookbrew-title-icon' });
        setIcon(titleIcon, 'book-dashed');
        titleContainer.createEl('h2', { text: 'BookBrew' });

        // Créer la section de progression
        this.createProgressSection(containerEl);

        // Template section
        const templateSection = containerEl.createDiv();
        const templateHeader = templateSection.createDiv({ cls: 'section-header' });
        templateHeader.createEl('h3', { text: this.plugin.translations.view.template });
        const templateSelect = templateHeader.createEl('select');
        
        // Ajouter les templates depuis le plugin
        if (this.plugin.latex.templates && this.plugin.latex.templates.length > 0) {
            this.plugin.latex.templates.forEach(template => {
                const option = new Option(template.name, template.name);
                option.setAttribute('data-format', template.format || '');
                templateSelect.appendChild(option);
            });
            
            // Initialiser le format sélectionné avec le premier template
            const firstOption = templateSelect.options[0];
            this.selectedFormat = firstOption.getAttribute('data-format') || '';
        }

        // Écouter les changements de template
        templateSelect.addEventListener('change', () => {
            const selectedOption = templateSelect.selectedOptions[0];
            this.selectedFormat = selectedOption.getAttribute('data-format') || '';
            this.updateImpositionsAndCovers();
            loadSelectedTemplate();
            updateDynamicFields();
        });

        // Dynamic Fields section for template
        const fieldsSection = containerEl.createDiv({ cls: 'fields-section' });
        fieldsSection.createEl('h4', { text: this.plugin.translations.view.dynamicFields + ' (Template)' });
        const fieldsList = fieldsSection.createEl('div', { cls: 'dynamic-fields' });

        // Fonction pour extraire les champs dynamiques
        const extractDynamicFields = (content: string): Set<string> => {
            const fieldPattern = /\{\{(\w+)\}\}/g;
            const fields = new Set<string>();
            let match;
            while ((match = fieldPattern.exec(content)) !== null) {
                fields.add(match[1]);
            }
            return fields;
        };

        // Fonction pour mettre à jour les champs dynamiques du template
        const updateDynamicFields = async () => {
            const selectedTemplate = templateSelect.value;
            const fields = new Set<string>();

            if (selectedTemplate) {
                const template = this.plugin.latex.findTemplate(selectedTemplate);
                if (template?.content) {
                    const templateFields = extractDynamicFields(template.content);
                    templateFields.forEach(field => fields.add(field));
                }
            }

            fieldsList.empty();
            if (fields.size > 0) {
                const fieldsText = Array.from(fields).join(', ');
                fieldsList.createEl('p', { text: fieldsText });
            } else {
                fieldsList.createEl('p', { text: this.plugin.translations.view.none, cls: 'no-fields' });
            }
        };

        // LaTeX Toggles section
        const togglesSection = containerEl.createDiv();
        togglesSection.createEl('h3', { text: 'LaTeX Options' });
        const togglesList = togglesSection.createEl('div', { cls: 'latex-toggles' });

        // Fonction pour extraire les toggles du fichier de mise en page
        const extractTogglesFromLayout = (layoutContent: string): string[] => {
            if (!layoutContent) return [];
            const template = this.plugin.latex.findTemplate(templateSelect.value);
            return template ? this.plugin.latex.getTemplateToggles(template) : [];
        };

        // Créer les toggles pour les options LaTeX
        const createLatexToggle = (name: string) => {
            const toggle = togglesList.createDiv({ cls: 'setting-item' });
            const translationKey = name as keyof typeof this.plugin.translations.view.toggles;
            const displayName = this.plugin.translations.view.toggles[translationKey] || name;
            
            toggle.createEl('span', { text: displayName });
            const toggleComponent = new ToggleComponent(toggle);

            const toggleState = this.plugin.settings.toggles[name];
            toggleComponent.setValue(toggleState !== undefined ? toggleState : false);

            toggleComponent.onChange(async (value: boolean) => {
                try {
                    if (templateSelect.value) {
                        const template = this.plugin.latex.findTemplate(templateSelect.value);
                        if (template) {
                            await this.plugin.latex.updateTemplateToggle(template, name, value);
                            this.plugin.settings.toggles[name] = value;
                            await this.plugin.saveSettings();
                        }
                    }
                } catch (error) {
                    new Notice(`Erreur lors de la mise à jour du toggle ${name}: ${error.message}`);
                    toggleComponent.setValue(!value);
                    this.plugin.settings.toggles[name] = !value;
                    await this.plugin.saveSettings();
                }
            });
        };

        // Récupérer et charger le template sélectionné
        const loadSelectedTemplate = async () => {
            const selectedTemplate = templateSelect.value;
            if (selectedTemplate) {
                const template = this.plugin.latex.templates.find(t => t.name === selectedTemplate);
                if (template) {
                    if (!template.content) {
                        try {
                            template.content = await this.app.vault.adapter.read(template.path);
                        } catch (error) {
                            return;
                        }
                    }
                    
                    togglesList.empty();
                    if (template.content) {
                        const toggles = extractTogglesFromLayout(template.content);
                        toggles.forEach(toggle => createLatexToggle(toggle));
                    }
                }
            }
        };

        // Imposition section
        const impositionSection = containerEl.createDiv({ cls: 'imposition-section' });
        const impositionHeader = impositionSection.createDiv({ cls: 'section-header' });
        impositionHeader.createEl('h3', { text: this.plugin.translations.view.imposition });
        const impositionSelect = impositionHeader.createEl('select');
        impositionSelect.appendChild(new Option(this.plugin.translations.view.none, ''));
        
        // Paper thickness section (caché par défaut)
        this.thicknessSection = impositionSection.createDiv({ cls: 'hidden thickness-section' });
        const thicknessLabel = this.thicknessSection.createSpan({ 
            text: this.plugin.translations.view.paperThickness, 
            cls: 'thickness-label' 
        });
        const thicknessInput = this.thicknessSection.createEl('input', {
            type: 'number',
            placeholder: this.plugin.translations.view.paperThickness,
            value: this.plugin.settings.paperThickness.toString()
        });
        thicknessInput.addEventListener('change', async () => {
            this.plugin.settings.paperThickness = parseFloat(thicknessInput.value);
            await this.plugin.saveSettings();
        });

        // Écouter les changements d'imposition
        impositionSelect.addEventListener('change', () => {
            const selectedImposition = this.plugin.latex.impositions.find(
                imp => imp.name === impositionSelect.value
            );
            
            if (selectedImposition?.type === 'spread') {
                this.thicknessSection.removeClass('hidden');
            } else {
                this.thicknessSection.addClass('hidden');
            }
        });

        // Cover Generator section
        const coverSection = containerEl.createDiv({ cls: 'cover-section' });
        const coverHeader = coverSection.createDiv({ cls: 'section-header' });
        coverHeader.createEl('h3', { text: this.plugin.translations.view.coverGenerator });
        const coverSelect = coverHeader.createEl('select');
        coverSelect.appendChild(new Option(this.plugin.translations.view.none, ''));

        // Dynamic Fields section for cover
        const coverFieldsSection = coverSection.createDiv({ cls: 'fields-section' });
        coverFieldsSection.createEl('h4', { text: this.plugin.translations.view.dynamicFields + ' (Cover)' });
        const coverFieldsList = coverFieldsSection.createEl('div', { cls: 'dynamic-fields' });

        const coverThicknessContainer = coverSection.createDiv({ cls: 'cover-thickness-container' });
        const coverThicknessLabel = coverThicknessContainer.createSpan({ 
            text: this.plugin.translations.view.coverThickness, 
            cls: 'thickness-label' 
        });
        const coverThicknessInput = coverThicknessContainer.createEl('input', {
            type: 'number',
            placeholder: this.plugin.translations.view.coverThickness,
            value: this.plugin.settings.coverThickness.toString()
        });
        coverThicknessInput.addEventListener('change', async () => {
            this.plugin.settings.coverThickness = parseFloat(coverThicknessInput.value);
            await this.plugin.saveSettings();
        });
        
        // Generate Cover button
        const generateCoverButton = coverSection.createEl('button', {
            text: this.plugin.translations.view.generateCover
        });
        generateCoverButton.addEventListener('click', async () => {
            const exportPath = exportPathInput.value;
            if (!exportPath) {
                new Notice('No export path selected');
                return;
            }

            const selectedCover = coverSelect.value;
            if (!selectedCover) {
                new Notice('No cover template selected');
                return;
            }

            const cover = this.plugin.latex.covers.find(c => c.name === selectedCover);
            if (!cover) {
                new Notice('Cover template not found');
                return;
            }

            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active file');
                return;
            }

            try {
                this.showProgress();
                
                // Récupérer les champs dynamiques du YAML frontmatter
                const dynamicFields = await this.plugin.latex.parseYAMLFields(activeFile);

                // Préparer le chemin de sortie
                const coverOutputPath = join(exportPath, `${activeFile.basename}_cover.pdf`);

                // Générer la couverture
                const result = await this.plugin.coverGenerator.generateCover(
                    cover,
                    dynamicFields,
                    this.plugin.settings.coverThickness,
                    coverOutputPath
                );

                this.hideProgress();
                new Notice(`Cover generated: ${result}`);
            } catch (error) {
                this.hideProgress();
                new Notice(`Cover generation failed: ${error.message}`);
            }
        });

        // Export section (déplacée à la fin)
        const exportSection = containerEl.createDiv({ cls: 'export-section' });
        const exportPathContainer = exportSection.createDiv({ cls: 'export-path-container' });
        const exportPathInput = exportPathContainer.createEl('input', {
            type: 'text',
            placeholder: this.plugin.translations.view.exportPath || 'Export path...',
            value: this.plugin.settings.lastExportPath || '',
            cls: 'export-path-input'
        });
        
        const chooseFolderButton = exportPathContainer.createEl('button', {
            cls: 'choose-folder-button'
        });
        setIcon(chooseFolderButton, 'folder');
        chooseFolderButton.addEventListener('click', () => {
            try {
                const { dialog } = require('@electron/remote');
                dialog.showOpenDialog({
                    properties: ['openDirectory']
                }).then((result: { canceled: boolean; filePaths: string[] }) => {
                    if (!result.canceled && result.filePaths.length > 0) {
                        const selectedPath = result.filePaths[0];
                        exportPathInput.value = selectedPath;
                        this.plugin.settings.lastExportPath = selectedPath;
                        this.plugin.saveSettings();
                    }
                });
            } catch (error: unknown) {
                // Permettre la saisie manuelle
            }
        });

        const exportButton = exportSection.createEl('button', {
            text: this.plugin.translations.view.export,
            cls: 'export-button'
        });
        exportButton.addEventListener('click', async () => {
            const exportPath = exportPathInput.value;
            if (!exportPath) {
                new Notice('No export path selected');
                return;
            }

            const selectedTemplate = templateSelect.value;
            if (!selectedTemplate) {
                new Notice('No template selected');
                return;
            }

            const template = this.plugin.latex.findTemplate(selectedTemplate);
            if (!template) {
                new Notice('Template not found');
                return;
            }

            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active file');
                return;
            }

            try {
                this.showProgress();

                // Configurer le callback pour les événements d'export
                this.plugin.exportCoordinator.setEventCallback((event) => {
                    switch (event.type) {
                        case 'progress':
                            if (event.progress !== undefined) {
                                this.updateProgress(event.progress, event.message);
                            }
                            break;
                        case 'log':
                            this.addLogMessage(event.message);
                            break;
                        case 'error':
                            this.hideProgress();
                            new Notice(`Export failed: ${event.message}`);
                            break;
                        case 'complete':
                            this.hideProgress();
                            new Notice('Export completed successfully');
                            break;
                        case 'cancelled':
                            this.hideProgress();
                            new Notice('Export cancelled');
                            break;
                    }
                });

                // Récupérer les champs dynamiques du YAML frontmatter
                const fileContent = await this.app.vault.read(activeFile);
                const yamlRegex = /^---\n([\s\S]*?)\n---/;
                const match = fileContent.match(yamlRegex);
                const dynamicFields: Record<string, any> = {};
                
                if (match) {
                    const yamlContent = match[1];
                    const lines = yamlContent.split('\n');
                    for (const line of lines) {
                        const [key, ...valueParts] = line.split(':');
                        if (key && valueParts.length > 0) {
                            const value = valueParts.join(':').trim();
                            if (value) {
                                dynamicFields[key.trim()] = value;
                            }
                        }
                    }
                }

                // Préparer les options d'export
                const exportOptions = {
                    file: activeFile,
                    template: template,
                    dynamicFields: dynamicFields,
                    toggles: this.plugin.settings.toggles,
                    outputPath: join(exportPath, `${activeFile.basename}.pdf`)
                } as ExportOptions;

                // Ajouter l'imposition si sélectionnée
                const selectedImposition = impositionSelect.value;
                
                if (selectedImposition) {
                    const imposition = this.plugin.latex.impositions.find(
                        imp => imp.name === selectedImposition
                    );
                    
                    if (imposition) {
                        exportOptions.imposition = imposition;
                        if (imposition.type === 'spread') {
                            exportOptions.paperThickness = this.plugin.settings.paperThickness;
                        }
                    }
                }

                // Lancer l'export
                await this.plugin.exportCoordinator.export(exportOptions);
            } catch (error) {
                this.hideProgress();
                new Notice(`Export failed: ${error.message}`);
            }
        });

        // Fonction pour mettre à jour les champs dynamiques de la couverture
        const updateCoverDynamicFields = async () => {
            const selectedCover = coverSelect.value;
            const fields = new Set<string>();

            if (selectedCover) {
                const cover = this.plugin.latex.covers.find(c => c.name === selectedCover);
                if (cover?.content) {
                    const coverFields = extractDynamicFields(cover.content);
                    coverFields.forEach(field => fields.add(field));
                }
            }

            coverFieldsList.empty();
            if (fields.size > 0) {
                const fieldsText = Array.from(fields).join(', ');
                coverFieldsList.createEl('p', { text: fieldsText });
            } else {
                coverFieldsList.createEl('p', { text: this.plugin.translations.view.none, cls: 'no-fields' });
            }
        };

        // Écouter les changements de couverture
        coverSelect.addEventListener('change', updateCoverDynamicFields);

        // Appel initial pour afficher les champs dynamiques
        updateDynamicFields();
        updateCoverDynamicFields();

        // Charger les toggles initiaux
        loadSelectedTemplate();

        // Mettre à jour les toggles lors du changement de template
        templateSelect.addEventListener('change', loadSelectedTemplate);

        // Stocker les références pour la mise à jour
        this.impositionSelect = impositionSelect;
        this.coverSelect = coverSelect;

        // Mettre à jour les impositions et couvertures initiales
        this.updateImpositionsAndCovers();
    }

    private updateImpositionsAndCovers() {
        // Mettre à jour les impositions disponibles
        const impositions = this.plugin.latex.getImpositionsForFormat(this.selectedFormat);
        
        this.impositionSelect.innerHTML = `<option value="">${this.plugin.translations.view.none}</option>`;
        impositions.forEach(imposition => {
            const option = new Option(imposition.name, imposition.name);
            this.impositionSelect.appendChild(option);
        });

        // Mettre à jour les couvertures disponibles
        const covers = this.plugin.latex.getCoversForFormat(this.selectedFormat);
        
        this.coverSelect.innerHTML = `<option value="">${this.plugin.translations.view.none}</option>`;
        covers.forEach(cover => {
            const option = new Option(cover.name, cover.name);
            this.coverSelect.appendChild(option);
        });

        // Masquer le champ d'épaisseur par défaut
        this.thicknessSection.addClass('hidden');
    }

    async onClose() {
        // Nothing to clean up
    }
} 