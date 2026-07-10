import {
	App,
	Editor,
	MarkdownFileInfo,
	MarkdownView,
	Notice,
	PluginSettingTab,
	Setting,
	normalizePath,
} from 'obsidian';
import type ZeroQoLModulesPlugin from '../../main';
import { BaseModule } from '../base-module';

const MODULE_ID = 'attachment-clean-paste';

interface AttachmentCleanPasteSettings {
	extensions: string;
}

export class AttachmentCleanPasteModule extends BaseModule {
	id = MODULE_ID;
	name = 'Attachment Clean Paste';
	description =
		'Заменяет ![[вложение]] на [[вложение|имя]] для указанных расширений при вставке/перетаскивании';

	private app: App;

	get defaultSettings(): Record<string, unknown> {
		return {
			extensions: 'png, jpg, jpeg, gif, svg, webp, bmp, pdf',
		};
	}

	onload(plugin: ZeroQoLModulesPlugin, moduleSettings: Record<string, unknown>): void {
		this.app = plugin.app;
		const settings = moduleSettings as unknown as AttachmentCleanPasteSettings;

		plugin.addSettingTab(
			new AttachmentCleanPasteSettingTab(plugin.app, plugin, MODULE_ID),
		);

		const pasteRef = plugin.app.workspace.on(
			'editor-paste',
			this.createPasteHandler(settings),
		);
		this.registerCleanup(() => plugin.app.workspace.offref(pasteRef));

		const dropRef = plugin.app.workspace.on(
			'editor-drop',
			this.createDropHandler(settings),
		);
		this.registerCleanup(() => plugin.app.workspace.offref(dropRef));
	}

	private createPasteHandler(settings: AttachmentCleanPasteSettings) {
		return async (
			evt: ClipboardEvent,
			editor: Editor,
			_info: MarkdownView | MarkdownFileInfo,
		): Promise<void> => {
			const files = evt.clipboardData?.files;
			if (!files || files.length === 0) return;

			const matchingFiles = Array.from(files).filter((f) =>
				this.shouldProcess(f.name, settings),
			);
			if (matchingFiles.length === 0) return;

			evt.preventDefault();
			evt.stopPropagation();

			for (const file of matchingFiles) {
				await this.processFile(file, editor, settings);
			}
		};
	}

	private createDropHandler(settings: AttachmentCleanPasteSettings) {
		return async (
			evt: DragEvent,
			editor: Editor,
			_info: MarkdownView | MarkdownFileInfo,
		): Promise<void> => {
			const files = evt.dataTransfer?.files;
			if (!files || files.length === 0) return;

			const matchingFiles = Array.from(files).filter((f) =>
				this.shouldProcess(f.name, settings),
			);
			if (matchingFiles.length === 0) return;

			evt.preventDefault();
			evt.stopPropagation();

			for (const file of matchingFiles) {
				await this.processFile(file, editor, settings);
			}
		};
	}

	private shouldProcess(
		filename: string,
		settings: AttachmentCleanPasteSettings,
	): boolean {
		const dotIndex = filename.lastIndexOf('.');
		if (dotIndex === -1) return false;
		const ext = filename.slice(dotIndex + 1).toLowerCase();

		const exts = settings.extensions
			.split(',')
			.map((e) => e.trim().toLowerCase())
			.filter((e) => e.length > 0);

		return exts.some((e) => {
			const cleanExt = e.startsWith('.') ? e.slice(1) : e;
			return cleanExt === ext;
		});
	}

	private async processFile(
		file: File,
		editor: Editor,
		_settings: AttachmentCleanPasteSettings,
	): Promise<void> {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const filename = file.name;
			const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

			let attachmentFolder = this.app.vault.getConfig(
				'attachmentFolderPath',
			) as string;
			if (!attachmentFolder) attachmentFolder = 'attachments';

			const folderPath = normalizePath(attachmentFolder);
			if (!(await this.app.vault.adapter.exists(folderPath))) {
				await this.app.vault.createFolder(folderPath);
			}

			const ext = filename.slice(filename.lastIndexOf('.') + 1);
			const basePath = normalizePath(`${folderPath}/${nameWithoutExt}`);

			const availablePath = await this.app.vault.getAvailablePath(
				basePath,
				ext,
			);

			await this.app.vault.createBinary(availablePath, arrayBuffer);

			const link = `[[${availablePath}|${nameWithoutExt}]]`;
			editor.replaceSelection(link);
		} catch (e) {
			new Notice(`Clean Paste error: ${e.message}`);
			console.error('Attachment Clean Paste:', e);
		}
	}
}

class AttachmentCleanPasteSettingTab extends PluginSettingTab {
	private plugin: ZeroQoLModulesPlugin;
	private moduleId: string;

	constructor(app: App, plugin: ZeroQoLModulesPlugin, moduleId: string) {
		super(app, plugin);
		this.plugin = plugin;
		this.moduleId = moduleId;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Attachment Clean Paste' });
		containerEl.createEl('p', {
			text: 'Заменяет ![[вложение]] на [[вложение|имя]] для указанных расширений.',
			attr: { style: 'color: var(--text-muted); margin-bottom: 20px;' },
		});

		const rawSettings = this.plugin.settings.modules[this.moduleId]?.settings as
			| AttachmentCleanPasteSettings
			| undefined;

		new Setting(containerEl)
			.setName('Расширения файлов')
			.setDesc(
				'Расширения через запятую (например: png, jpg, pdf, mp3). Файлы с этими расширениями будут вставляться как [[path/file|name]] вместо ![[path/file]].',
			)
			.addTextArea((textarea) => {
				textarea
					.setPlaceholder('png, jpg, jpeg, gif, svg, webp, pdf')
					.setValue(rawSettings?.extensions ?? '')
					.onChange(async (value) => {
						if (this.plugin.settings.modules[this.moduleId]) {
							this.plugin.settings.modules[this.moduleId].settings = {
								extensions: value,
							};
						}
						await this.plugin.saveSettings();
					});
				textarea.inputEl.rows = 4;
				textarea.inputEl.style.width = '100%';
			});
	}
}
