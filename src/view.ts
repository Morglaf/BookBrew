import { ItemView, WorkspaceLeaf, ToggleComponent } from 'obsidian';
import BookBrewPlugin from './main';
import { BookBrewSettings } from './settings';

export const VIEW_TYPE_BOOKBREW = 'bookbrew-view';

export class BookBrewView extends ItemView {
    private plugin: BookBrewPlugin;
    private selectedFormat: string = '';
    private thicknessSection: HTMLDivElement;
    private impositionSelect: HTMLSelectElement;
    private coverSelect: HTMLSelectElement;

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
        return 'lucide-beer';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h2', { text: this.plugin.translations.view.title });

        // Template section
        const templateSection = container.createDiv();
        templateSection.createEl('h3', { text: this.plugin.translations.view.template });
        const templateSelect = templateSection.createEl('select');
        
        // Ajouter les templates depuis le plugin
        if (this.plugin.latex.templates && this.plugin.latex.templates.length > 0) {
            this.plugin.latex.templates.forEach(template => {
                const option = new Option(template.name, template.name);
                option.setAttribute('data-format', template.format || '');
                templateSelect.appendChild(option);
            });
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
        const fieldsSection = container.createDiv();
        fieldsSection.createEl('h3', { text: this.plugin.translations.view.dynamicFields + ' (Template)' });
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
                fieldsList.createEl('p', { text: 'No dynamic fields detected', cls: 'no-fields' });
            }
        };

        // LaTeX Toggles section
        const togglesSection = container.createDiv();
        togglesSection.createEl('h3', { text: 'LaTeX Options' });
        const togglesList = togglesSection.createEl('div', { cls: 'latex-toggles' });

        // Fonction pour extraire les toggles du fichier de mise en page
        const extractTogglesFromLayout = (layoutContent: string): string[] => {
            const togglePattern = /\\newif\\if(\w+)/g;
            const matches = [...layoutContent.matchAll(togglePattern)];
            return matches.map(match => match[1]);
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
                this.plugin.settings.toggles[name] = value;
                await this.plugin.saveSettings();

                if (templateSelect.value) {
                    const template = this.plugin.latex.findTemplate(templateSelect.value);
                    if (template && template.content) {
                        const toggleValue = value ? 'true' : 'false';
                        const togglePattern = new RegExp(`\\\\${name}${toggleValue === 'true' ? 'false' : 'true'}`, 'g');
                        template.content = template.content.replace(togglePattern, `\\${name}${toggleValue}`);
                        
                        if (!template.content.includes(`\\${name}${toggleValue}`)) {
                            const declarationPattern = new RegExp(`\\\\newif\\\\if${name}`);
                            template.content = template.content.replace(
                                declarationPattern,
                                `\\newif\\if${name}\n\\${name}${toggleValue}`
                            );
                        }
                        
                        try {
                            await this.plugin.latex.updateTemplateContent(template, template.content);
                        } catch (error) {
                            toggleComponent.setValue(!value);
                            this.plugin.settings.toggles[name] = !value;
                            await this.plugin.saveSettings();
                        }
                    }
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
        const impositionSection = container.createDiv();
        impositionSection.createEl('h3', { text: this.plugin.translations.view.imposition });
        const impositionSelect = impositionSection.createEl('select');
        impositionSelect.appendChild(new Option(this.plugin.translations.view.none, ''));
        
        // Paper thickness section (caché par défaut)
        this.thicknessSection = container.createDiv({ cls: 'hidden' });
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

        // Export section
        const exportSection = container.createDiv({ cls: 'export-section' });
        const exportPathContainer = exportSection.createDiv({ cls: 'export-path-container' });
        const exportPathInput = exportPathContainer.createEl('input', {
            type: 'text',
            placeholder: this.plugin.translations.view.exportPath || 'Export path...',
            value: this.plugin.settings.lastExportPath || '',
            cls: 'export-path-input'
        });
        
        const chooseFolderButton = exportPathContainer.createEl('button', {
            text: '📁',
            cls: 'choose-folder-button'
        });
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
        exportButton.addEventListener('click', () => {
            const exportPath = exportPathInput.value;
            if (!exportPath) {
                return;
            }
            // TODO: Continuer avec l'export
        });

        // Cover Generator section
        const coverSection = container.createDiv();
        coverSection.createEl('h3', { text: this.plugin.translations.view.coverGenerator });
        const coverSelect = coverSection.createEl('select');
        coverSelect.appendChild(new Option(this.plugin.translations.view.none, ''));

        // Dynamic Fields section for cover
        const coverFieldsSection = container.createDiv();
        coverFieldsSection.createEl('h3', { text: this.plugin.translations.view.dynamicFields + ' (Cover)' });
        const coverFieldsList = coverFieldsSection.createEl('div', { cls: 'dynamic-fields' });

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
                coverFieldsList.createEl('p', { text: 'No dynamic fields detected', cls: 'no-fields' });
            }
        };

        // Cover thickness
        const coverThicknessInput = coverSection.createEl('input', {
            type: 'number',
            placeholder: this.plugin.translations.view.coverThickness,
            value: this.plugin.settings.coverThickness.toString()
        });
        coverThicknessInput.addEventListener('change', async () => {
            this.plugin.settings.coverThickness = parseFloat(coverThicknessInput.value);
            await this.plugin.saveSettings();
        });
        
        const generateCoverButton = coverSection.createEl('button', {
            text: this.plugin.translations.view.generateCover
        });
        generateCoverButton.addEventListener('click', () => {
            // TODO: Implement cover generation
        });

        // Écouter les changements de couverture
        coverSelect.addEventListener('change', updateCoverDynamicFields);

        // Appel initial pour afficher les champs dynamiques
        updateDynamicFields();
        updateCoverDynamicFields();

        // Charger les toggles initiaux
        loadSelectedTemplate();

        // Mettre à jour les toggles lors du changement de template
        templateSelect.addEventListener('change', loadSelectedTemplate);

        // Style pour les sections
        const style = document.head.appendChild(document.createElement('style'));
        style.textContent = `
            .dynamic-fields {
                background: var(--background-primary-alt);
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 15px;
            }
            .dynamic-fields p {
                margin: 0;
                font-family: var(--font-monospace);
            }
            .dynamic-fields .no-fields {
                color: var(--text-muted);
                font-style: italic;
            }
            .latex-toggles {
                background: var(--background-primary-alt);
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 15px;
            }
            .latex-toggles .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 0;
                border-bottom: 1px solid var(--background-modifier-border);
            }
            .latex-toggles .setting-item:last-child {
                border-bottom: none;
            }
            .export-section {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 16px 0;
            }
            .export-path-container {
                display: flex;
                flex: 1;
                gap: 4px;
            }
            .export-path-input {
                flex: 1;
                min-width: 0;
                padding: 4px 8px;
            }
            .choose-folder-button {
                padding: 4px 8px;
                cursor: pointer;
            }
            .export-button {
                padding: 4px 12px;
            }
        `;

        // Stocker les références pour la mise à jour
        this.impositionSelect = impositionSelect;
        this.coverSelect = coverSelect;
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

// Ajouter le style CSS pour la classe hidden
document.head.appendChild(document.createElement('style')).textContent = `
.hidden {
    display: none;
}
`; 