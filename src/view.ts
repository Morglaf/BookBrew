import { ItemView, WorkspaceLeaf } from 'obsidian';
import BookBrewPlugin from './main';

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

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h2', { text: this.plugin.translations.view.title });

        // Template section
        const templateSection = container.createDiv();
        templateSection.createEl('h3', { text: this.plugin.translations.view.template });
        const templateSelect = templateSection.createEl('select');
        // TODO: Load templates from typeset/layout directory

        // Dynamic Fields section
        const fieldsSection = container.createDiv();
        fieldsSection.createEl('h3', { text: this.plugin.translations.view.dynamicFields });
        const fieldsList = fieldsSection.createEl('div', { cls: 'dynamic-fields' });
        // TODO: Parse current file's YAML and display fields

        // Options section
        const optionsSection = container.createDiv();
        optionsSection.createEl('h3', { text: this.plugin.translations.view.options });
        
        // Create toggle switches for each option
        const createToggle = (section: HTMLElement, name: string, setting: string) => {
            const toggle = section.createDiv({ cls: 'setting-item' });
            toggle.createEl('span', { text: name });
            const toggleComponent = toggle.createEl('div', { cls: 'checkbox-container' });
            const checkbox = toggleComponent.createEl('input', { type: 'checkbox' });
            // TODO: Link to settings
        };

        createToggle(optionsSection, this.plugin.translations.view.keepTemp, 'keepTemp');
        // Add more toggles as needed

        // Imposition section
        const impositionSection = container.createDiv();
        impositionSection.createEl('h3', { text: this.plugin.translations.view.imposition });
        const impositionSelect = impositionSection.createEl('select');
        // TODO: Load imposition templates

        // Paper thickness
        const thicknessSection = container.createDiv();
        const thicknessInput = thicknessSection.createEl('input', {
            type: 'number',
            placeholder: this.plugin.translations.view.paperThickness
        });
        // TODO: Link to settings

        // Export section
        const exportSection = container.createDiv();
        const exportButton = exportSection.createEl('button', {
            text: this.plugin.translations.view.export
        });
        // TODO: Implement export functionality

        // Cover Generator section
        const coverSection = container.createDiv();
        coverSection.createEl('h3', { text: this.plugin.translations.view.coverGenerator });
        const coverThicknessInput = coverSection.createEl('input', {
            type: 'number',
            placeholder: this.plugin.translations.view.coverThickness
        });
        const generateCoverButton = coverSection.createEl('button', {
            text: this.plugin.translations.view.generateCover
        });
        // TODO: Implement cover generation
    }

    async onClose() {
        // Nothing to clean up
    }
} 