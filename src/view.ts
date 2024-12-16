import { ItemView, WorkspaceLeaf } from 'obsidian';
import BookBrewPlugin from './main';
import { BookBrewSettings } from './settings';

export const VIEW_TYPE_BOOKBREW = 'bookbrew-view';

export class BookBrewView extends ItemView {
    private plugin: BookBrewPlugin;

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

        console.log('Plugin:', this.plugin);
        console.log('LaTeX Manager:', this.plugin.latex);

        // Template section
        const templateSection = container.createDiv();
        templateSection.createEl('h3', { text: this.plugin.translations.view.template });
        const templateSelect = templateSection.createEl('select');
        
        // Ajouter les templates depuis le plugin
        console.log('Templates avant la boucle:', this.plugin.latex.templates);
        if (this.plugin.latex.templates && this.plugin.latex.templates.length > 0) {
            console.log('Ajout des templates...');
            this.plugin.latex.templates.forEach(template => {
                console.log('Ajout du template:', template.name);
                const option = new Option(template.name, template.name);
                templateSelect.appendChild(option);
            });
        } else {
            console.log('Aucun template trouvé ou tableau vide');
        }

        // Dynamic Fields section
        const fieldsSection = container.createDiv();
        fieldsSection.createEl('h3', { text: this.plugin.translations.view.dynamicFields });
        const fieldsList = fieldsSection.createEl('div', { cls: 'dynamic-fields' });
        // TODO: Parse current file's YAML and display fields

        // Options section
        const optionsSection = container.createDiv();
        optionsSection.createEl('h3', { text: this.plugin.translations.view.options });
        
        // Create toggle switches for each option
        const createToggle = (section: HTMLElement, name: string, setting: 'keepTempFiles') => {
            const toggle = section.createDiv({ cls: 'setting-item' });
            toggle.createEl('span', { text: name });
            const toggleComponent = toggle.createEl('div', { cls: 'checkbox-container' });
            const checkbox = toggleComponent.createEl('input', { type: 'checkbox' });
            checkbox.checked = this.plugin.settings[setting];
            checkbox.addEventListener('change', async () => {
                this.plugin.settings[setting] = checkbox.checked;
                await this.plugin.saveSettings();
            });
        };

        createToggle(optionsSection, this.plugin.translations.view.keepTemp, 'keepTempFiles');

        // Imposition section
        const impositionSection = container.createDiv();
        impositionSection.createEl('h3', { text: this.plugin.translations.view.imposition });
        const impositionSelect = impositionSection.createEl('select');
        
        // Ajouter les impositions depuis le plugin
        console.log('Impositions avant la boucle:', this.plugin.latex.impositions);
        if (this.plugin.latex.impositions && this.plugin.latex.impositions.length > 0) {
            console.log('Ajout des impositions...');
            this.plugin.latex.impositions.forEach(imposition => {
                console.log('Ajout de l\'imposition:', imposition.name);
                const option = new Option(imposition.name, imposition.name);
                impositionSelect.appendChild(option);
            });
        } else {
            console.log('Aucune imposition trouvée ou tableau vide');
        }

        // Paper thickness
        const thicknessSection = container.createDiv();
        const thicknessInput = thicknessSection.createEl('input', {
            type: 'number',
            placeholder: this.plugin.translations.view.paperThickness,
            value: this.plugin.settings.paperThickness.toString()
        });
        thicknessInput.addEventListener('change', async () => {
            this.plugin.settings.paperThickness = parseFloat(thicknessInput.value);
            await this.plugin.saveSettings();
        });

        // Export section
        const exportSection = container.createDiv();
        const exportButton = exportSection.createEl('button', {
            text: this.plugin.translations.view.export
        });
        exportButton.addEventListener('click', () => {
            // TODO: Implement export functionality
        });

        // Cover Generator section
        const coverSection = container.createDiv();
        coverSection.createEl('h3', { text: this.plugin.translations.view.coverGenerator });
        
        // Ajouter les couvertures depuis le plugin
        const coverSelect = coverSection.createEl('select');
        console.log('Couvertures avant la boucle:', this.plugin.latex.covers);
        if (this.plugin.latex.covers && this.plugin.latex.covers.length > 0) {
            console.log('Ajout des couvertures...');
            this.plugin.latex.covers.forEach(cover => {
                console.log('Ajout de la couverture:', cover.name);
                const option = new Option(cover.name, cover.name);
                coverSelect.appendChild(option);
            });
        } else {
            console.log('Aucune couverture trouvée ou tableau vide');
        }
        
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

        // Ajouter des logs pour le débogage
        console.log('Templates:', this.plugin.latex.templates);
        console.log('Impositions:', this.plugin.latex.impositions);
        console.log('Covers:', this.plugin.latex.covers);
    }

    async onClose() {
        // Nothing to clean up
    }
} 