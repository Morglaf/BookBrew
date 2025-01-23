import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, MarkdownView, Notice, FileSystemAdapter } from 'obsidian';
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

		// Section LaTeX
		new Setting(containerEl)
			.setName(this.plugin.translations.settings.latexSection)
			.setHeading();

		new Setting(containerEl)
			.setName(this.plugin.translations.settings.latexPath)
			.addText(text => text
				.setPlaceholder('/usr/local/texlive/bin')
				.setValue(this.plugin.settings.latexPath)
				.onChange(async (value) => {
					this.plugin.settings.latexPath = value;
					await this.plugin.saveSettings();
				}));

		// Section Pandoc
		new Setting(containerEl)
			.setName(this.plugin.translations.settings.pandocSection)
			.setHeading();

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
		new Setting(containerEl)
			.setName(this.plugin.translations.settings.pdftkSection)
			.setHeading();

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
		new Setting(containerEl)
			.setName(this.plugin.translations.settings.generalSection)
			.setHeading();

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
	public settings: BookBrewSettings;
	public translations: Translations;
	private view: BookBrewView;
	latex: LatexService;
	exportCoordinator: ExportCoordinator;
	coverGenerator: CoverGenerator;

	async onload() {
		await this.loadSettings();
		
		// Charger les traductions en fonction de la langue d'Obsidian
		this.translations = loadTranslations();
		
		// Initialize LaTeX service
		let pluginPath: string;
		if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
			throw new Error('BookBrew requires a local vault');
		}

		// S'assurer que manifest.dir existe
		if (!this.manifest.dir) {
			throw new Error('Plugin directory not found');
		}

		pluginPath = join(
			this.app.vault.adapter.getBasePath(),
			this.manifest.dir
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
			(leaf: WorkspaceLeaf) => (this.view = new BookBrewView(leaf, this))
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
				new Notice(this.translations.view.notices.noActiveFile);
				return;
			}

			// Utiliser le premier template disponible comme template par défaut
			const templates = this.latex.templates;
			if (templates.length === 0) {
				new Notice(this.translations.view.notices.noTemplatesAvailable);
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
			new Notice(this.translations.view.notices.exportCompleted);
		} catch (error) {
			new Notice(this.translations.view.notices.exportFailed.replace('{0}', error.message));
		}
	}

	onunload() {
		// Cleanup will be handled by Obsidian
	}
}
