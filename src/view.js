import { __awaiter } from "tslib";
import { ItemView } from 'obsidian';
export const VIEW_TYPE_BOOKBREW = 'bookbrew-view';
export class BookBrewView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType() {
        return VIEW_TYPE_BOOKBREW;
    }
    getDisplayText() {
        return 'BookBrew';
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const createToggle = (section, name, setting) => {
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
        });
    }
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            // Nothing to clean up
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQWlCLE1BQU0sVUFBVSxDQUFDO0FBR25ELE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQztBQUVsRCxNQUFNLE9BQU8sWUFBYSxTQUFRLFFBQVE7SUFHdEMsWUFBWSxJQUFtQixFQUFFLE1BQXNCO1FBQ25ELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxXQUFXO1FBQ1AsT0FBTyxrQkFBa0IsQ0FBQztJQUM5QixDQUFDO0lBRUQsY0FBYztRQUNWLE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFSyxNQUFNOztZQUNSLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNsQixTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUV4RSxtQkFBbUI7WUFDbkIsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzlDLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQscURBQXFEO1lBRXJELHlCQUF5QjtZQUN6QixNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsU0FB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QyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUN2RCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWM7YUFDNUQsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtnQkFDeEQsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhO2FBQ3BELENBQUMsQ0FBQztZQUNILG1DQUFtQztRQUN2QyxDQUFDO0tBQUE7SUFFSyxPQUFPOztZQUNULHNCQUFzQjtRQUMxQixDQUFDO0tBQUE7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEl0ZW1WaWV3LCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgQm9va0JyZXdQbHVnaW4gZnJvbSAnLi9tYWluJztcclxuXHJcbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfQk9PS0JSRVcgPSAnYm9va2JyZXctdmlldyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9va0JyZXdWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xyXG4gICAgcHJpdmF0ZSBwbHVnaW46IEJvb2tCcmV3UGx1Z2luO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHBsdWdpbjogQm9va0JyZXdQbHVnaW4pIHtcclxuICAgICAgICBzdXBlcihsZWFmKTtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBWSUVXX1RZUEVfQk9PS0JSRVc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gJ0Jvb2tCcmV3JztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvbk9wZW4oKSB7XHJcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXTtcclxuICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcclxuICAgICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiB0aGlzLnBsdWdpbi50cmFuc2xhdGlvbnMudmlldy50aXRsZSB9KTtcclxuXHJcbiAgICAgICAgLy8gVGVtcGxhdGUgc2VjdGlvblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlU2VjdGlvbiA9IGNvbnRhaW5lci5jcmVhdGVEaXYoKTtcclxuICAgICAgICB0ZW1wbGF0ZVNlY3Rpb24uY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiB0aGlzLnBsdWdpbi50cmFuc2xhdGlvbnMudmlldy50ZW1wbGF0ZSB9KTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVNlbGVjdCA9IHRlbXBsYXRlU2VjdGlvbi5jcmVhdGVFbCgnc2VsZWN0Jyk7XHJcbiAgICAgICAgLy8gVE9ETzogTG9hZCB0ZW1wbGF0ZXMgZnJvbSB0eXBlc2V0L2xheW91dCBkaXJlY3RvcnlcclxuXHJcbiAgICAgICAgLy8gRHluYW1pYyBGaWVsZHMgc2VjdGlvblxyXG4gICAgICAgIGNvbnN0IGZpZWxkc1NlY3Rpb24gPSBjb250YWluZXIuY3JlYXRlRGl2KCk7XHJcbiAgICAgICAgZmllbGRzU2VjdGlvbi5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6IHRoaXMucGx1Z2luLnRyYW5zbGF0aW9ucy52aWV3LmR5bmFtaWNGaWVsZHMgfSk7XHJcbiAgICAgICAgY29uc3QgZmllbGRzTGlzdCA9IGZpZWxkc1NlY3Rpb24uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZHluYW1pYy1maWVsZHMnIH0pO1xyXG4gICAgICAgIC8vIFRPRE86IFBhcnNlIGN1cnJlbnQgZmlsZSdzIFlBTUwgYW5kIGRpc3BsYXkgZmllbGRzXHJcblxyXG4gICAgICAgIC8vIE9wdGlvbnMgc2VjdGlvblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNTZWN0aW9uID0gY29udGFpbmVyLmNyZWF0ZURpdigpO1xyXG4gICAgICAgIG9wdGlvbnNTZWN0aW9uLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogdGhpcy5wbHVnaW4udHJhbnNsYXRpb25zLnZpZXcub3B0aW9ucyB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDcmVhdGUgdG9nZ2xlIHN3aXRjaGVzIGZvciBlYWNoIG9wdGlvblxyXG4gICAgICAgIGNvbnN0IGNyZWF0ZVRvZ2dsZSA9IChzZWN0aW9uOiBIVE1MRWxlbWVudCwgbmFtZTogc3RyaW5nLCBzZXR0aW5nOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdG9nZ2xlID0gc2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdzZXR0aW5nLWl0ZW0nIH0pO1xyXG4gICAgICAgICAgICB0b2dnbGUuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IG5hbWUgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvZ2dsZUNvbXBvbmVudCA9IHRvZ2dsZS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdjaGVja2JveC1jb250YWluZXInIH0pO1xyXG4gICAgICAgICAgICBjb25zdCBjaGVja2JveCA9IHRvZ2dsZUNvbXBvbmVudC5jcmVhdGVFbCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcgfSk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IExpbmsgdG8gc2V0dGluZ3NcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjcmVhdGVUb2dnbGUob3B0aW9uc1NlY3Rpb24sIHRoaXMucGx1Z2luLnRyYW5zbGF0aW9ucy52aWV3LmtlZXBUZW1wLCAna2VlcFRlbXAnKTtcclxuICAgICAgICAvLyBBZGQgbW9yZSB0b2dnbGVzIGFzIG5lZWRlZFxyXG5cclxuICAgICAgICAvLyBJbXBvc2l0aW9uIHNlY3Rpb25cclxuICAgICAgICBjb25zdCBpbXBvc2l0aW9uU2VjdGlvbiA9IGNvbnRhaW5lci5jcmVhdGVEaXYoKTtcclxuICAgICAgICBpbXBvc2l0aW9uU2VjdGlvbi5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6IHRoaXMucGx1Z2luLnRyYW5zbGF0aW9ucy52aWV3LmltcG9zaXRpb24gfSk7XHJcbiAgICAgICAgY29uc3QgaW1wb3NpdGlvblNlbGVjdCA9IGltcG9zaXRpb25TZWN0aW9uLmNyZWF0ZUVsKCdzZWxlY3QnKTtcclxuICAgICAgICAvLyBUT0RPOiBMb2FkIGltcG9zaXRpb24gdGVtcGxhdGVzXHJcblxyXG4gICAgICAgIC8vIFBhcGVyIHRoaWNrbmVzc1xyXG4gICAgICAgIGNvbnN0IHRoaWNrbmVzc1NlY3Rpb24gPSBjb250YWluZXIuY3JlYXRlRGl2KCk7XHJcbiAgICAgICAgY29uc3QgdGhpY2tuZXNzSW5wdXQgPSB0aGlja25lc3NTZWN0aW9uLmNyZWF0ZUVsKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiB0aGlzLnBsdWdpbi50cmFuc2xhdGlvbnMudmlldy5wYXBlclRoaWNrbmVzc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFRPRE86IExpbmsgdG8gc2V0dGluZ3NcclxuXHJcbiAgICAgICAgLy8gRXhwb3J0IHNlY3Rpb25cclxuICAgICAgICBjb25zdCBleHBvcnRTZWN0aW9uID0gY29udGFpbmVyLmNyZWF0ZURpdigpO1xyXG4gICAgICAgIGNvbnN0IGV4cG9ydEJ1dHRvbiA9IGV4cG9ydFNlY3Rpb24uY3JlYXRlRWwoJ2J1dHRvbicsIHtcclxuICAgICAgICAgICAgdGV4dDogdGhpcy5wbHVnaW4udHJhbnNsYXRpb25zLnZpZXcuZXhwb3J0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IGV4cG9ydCBmdW5jdGlvbmFsaXR5XHJcblxyXG4gICAgICAgIC8vIENvdmVyIEdlbmVyYXRvciBzZWN0aW9uXHJcbiAgICAgICAgY29uc3QgY292ZXJTZWN0aW9uID0gY29udGFpbmVyLmNyZWF0ZURpdigpO1xyXG4gICAgICAgIGNvdmVyU2VjdGlvbi5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6IHRoaXMucGx1Z2luLnRyYW5zbGF0aW9ucy52aWV3LmNvdmVyR2VuZXJhdG9yIH0pO1xyXG4gICAgICAgIGNvbnN0IGNvdmVyVGhpY2tuZXNzSW5wdXQgPSBjb3ZlclNlY3Rpb24uY3JlYXRlRWwoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMucGx1Z2luLnRyYW5zbGF0aW9ucy52aWV3LmNvdmVyVGhpY2tuZXNzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgZ2VuZXJhdGVDb3ZlckJ1dHRvbiA9IGNvdmVyU2VjdGlvbi5jcmVhdGVFbCgnYnV0dG9uJywge1xyXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnBsdWdpbi50cmFuc2xhdGlvbnMudmlldy5nZW5lcmF0ZUNvdmVyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IGNvdmVyIGdlbmVyYXRpb25cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvbkNsb3NlKCkge1xyXG4gICAgICAgIC8vIE5vdGhpbmcgdG8gY2xlYW4gdXBcclxuICAgIH1cclxufSAiXX0=