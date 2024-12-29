export class ExportProgressUI {
    private progressBar: HTMLProgressElement;
    private progressText: HTMLDivElement;
    private logContainer: HTMLDivElement;
    private progressSection: HTMLElement;
    private isExporting: boolean = false;

    constructor(private containerEl: HTMLElement) {
        this.setupUI();
    }

    private setupUI() {
        // Créer la section de progression
        this.progressSection = this.containerEl.createDiv({ cls: 'progress-section hidden' });
        
        // Créer la barre de progression
        const progressContainer = this.progressSection.createDiv({ cls: 'progress-container' });
        this.progressBar = progressContainer.createEl('progress', {
            cls: 'progress-bar',
            attr: { max: '100', value: '0' }
        });
        this.progressText = progressContainer.createDiv({ cls: 'progress-text' });

        // Créer le conteneur de logs
        this.logContainer = this.progressSection.createDiv({ cls: 'log-container' });
    }

    public updateProgress(progress: number, message: string) {
        if (this.progressBar && this.progressText) {
            this.progressBar.value = progress;
            this.progressText.textContent = message;
        }
    }

    public addLogMessage(message: string) {
        const logLine = this.logContainer.createDiv({ cls: 'log-line' });
        logLine.textContent = message;
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    public show() {
        this.progressSection.removeClass('hidden');
        this.isExporting = true;
    }

    public hide() {
        this.progressSection.addClass('hidden');
        this.isExporting = false;
        if (this.logContainer) {
            this.logContainer.empty();
        }
    }

    public get isActive(): boolean {
        return this.isExporting;
    }
} 