import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, MarkdownView, Notice } from 'obsidian';
import { BookBrewView } from './view';
import { BookBrewSettings } from './settings';
import { Translations, loadTranslations } from './i18n';
import { LatexService } from './services/latex/LatexService';
import { ExportCoordinator } from './services/export/ExportCoordinator';
import { CoverGenerator } from './services/export/CoverGenerator';
import { ExportOptions } from './types/interfaces';
import { VIEW_TYPE_BOOKBREW, DEFAULT_SETTINGS } from './constants/settings';
import { getExportPath } from './utils/paths';
import { join } from 'path';

class BookBrewSettingTab extends PluginSettingTab {
	private readonly plugin: BookBrewPlugin;

	constructor(app: App, plugin: BookBrewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Langue
		new Setting(containerEl)
			.setName(this.plugin.translations.settings.language)
			.addDropdown(dropdown => dropdown
				.addOption('auto', 'Auto')
				.addOption('en', 'English')
				.addOption('fr', 'Français')
				.addOption('es', 'Español')
				.addOption('de', 'Deutsch')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value;
					this.plugin.translations = loadTranslations(value);
					await this.plugin.saveSettings();
				}));

		// Section LaTeX
		containerEl.createEl('h3', { text: this.plugin.translations.settings.latexSection });

		new Setting(containerEl)
			.setName(this.plugin.translations.settings.latexPath)
			.addText(text => text
				.setPlaceholder('/usr/local/texlive/bin')
				.setValue(this.plugin.settings.latexPath)
				.onChange(async (value) => {
					this.plugin.settings.latexPath = value;
					await this.plugin.saveSettings();
					await this.plugin.initLatex();
				}));

		// Section Pandoc
		containerEl.createEl('h3', { text: this.plugin.translations.settings.pandocSection });

		new Setting(containerEl)
			.setName(this.plugin.translations.settings.pandocPath)
			.addText(text => text
				.setPlaceholder('/usr/local/bin')
				.setValue(this.plugin.settings.pandocPath)
				.onChange(async (value) => {
					this.plugin.settings.pandocPath = value;
					await this.plugin.saveSettings();
				}));

		// Section PDFtk
		containerEl.createEl('h3', { text: this.plugin.translations.settings.pdftkSection });

		new Setting(containerEl)
			.setName(this.plugin.translations.settings.pdftkPath)
			.addText(text => text
				.setPlaceholder('/usr/local/bin')
				.setValue(this.plugin.settings.pdftkPath)
				.onChange(async (value) => {
					this.plugin.settings.pdftkPath = value;
					await this.plugin.saveSettings();
				}));

		// Options générales
		containerEl.createEl('h3', { text: this.plugin.translations.settings.generalSection });

		new Setting(containerEl)
			.setName(this.plugin.translations.settings.keepTempFiles)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.keepTempFiles)
				.onChange(async (value) => {
					this.plugin.settings.keepTempFiles = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(this.plugin.translations.view.exportPath)
			.addText(text => text
				.setPlaceholder(this.app.vault.configDir)
				.setValue(this.plugin.settings.lastExportPath)
				.onChange(async (value) => {
					this.plugin.settings.lastExportPath = value;
					await this.plugin.saveSettings();
				}));
	}
}

export default class BookBrewPlugin extends Plugin {
	settings: BookBrewSettings;
	translations: Translations;
	latex: LatexService;
	exportCoordinator: ExportCoordinator;
	coverGenerator: CoverGenerator;

	async onload() {
		await this.loadSettings();
		this.translations = loadTranslations(this.settings.language);
		
		// Initialize LaTeX service
		const pluginPath = join(
			(this.app.vault.adapter as any).basePath,
			'.obsidian',
			'plugins',
			'bookbrew'
		);
		this.latex = new LatexService(
			this.app.vault,
			pluginPath,
			this.settings.latexPath,
			this.settings.pandocPath,
			this.settings.pdftkPath
		);
		
		await this.initLatex();

		// Initialize Export Coordinator
		this.exportCoordinator = new ExportCoordinator(
			this.app.vault,
			pluginPath,
			this.settings.latexPath,
			this.settings.pandocPath,
			this.settings.pdftkPath
		);
		await this.exportCoordinator.init();

		// Initialize Cover Generator
		this.coverGenerator = new CoverGenerator(
			pluginPath,
			this.settings.latexPath
		);

		// Register View
		this.registerView(
			VIEW_TYPE_BOOKBREW,
			(leaf) => new BookBrewView(leaf, this)
		);

		// Add ribbon icon
		this.addRibbonIcon('book-dashed', 'BookBrew', () => {
			this.activateView();
		});

		// Add settings tab
		this.addSettingTab(new BookBrewSettingTab(this.app, this));

		// Add commands
		this.addCommand({
			id: 'open-view',
			name: this.translations.commands.openView,
			callback: () => this.activateView(),
		});

		// Add command to export current note
		this.addCommand({
			id: 'export-current',
			name: this.translations.commands.exportPdf,
			editorCheckCallback: (checking, editor, view) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!markdownView) {
					return false;
				}
				if (!checking) {
					this.exportCurrentNote(markdownView);
				}
				return true;
			}
		});

		// Activer automatiquement le panneau au démarrage
		this.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	async initLatex() {
		await this.latex.init();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BOOKBREW);
		
		if (leaves.length > 0) {
			this.app.workspace.revealLeaf(leaves[0]);
			return;
		}

		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_BOOKBREW,
				active: true,
			});
			this.app.workspace.revealLeaf(leaf);
		}
	}

	private async exportCurrentNote(view: MarkdownView) {
		try {
			const file = view.file;
			if (!file) {
				new Notice('No file is currently open');
				return;
			}

			// Utiliser le premier template disponible comme template par défaut
			const templates = this.latex.templates;
			if (templates.length === 0) {
				new Notice('No templates available');
				return;
			}
			const defaultTemplate = templates[0];

			// Créer les options d'export avec des paramètres par défaut
			const exportOptions: ExportOptions = {
				file: file,
				template: defaultTemplate,
				dynamicFields: {},
				toggles: this.settings.toggles,
				outputPath: join(this.settings.lastExportPath || '.', `${file.basename}.pdf`)
			};

			// Lancer l'export
			await this.exportCoordinator.export(exportOptions);
			new Notice('Export completed successfully');
		} catch (error) {
			new Notice(`Export failed: ${error.message}`);
		}
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_BOOKBREW);
	}
}
