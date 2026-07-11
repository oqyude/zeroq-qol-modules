import {
	App,
	Editor,
	MarkdownFileInfo,
	MarkdownView,
	Notice,
	Setting,
	normalizePath,
} from 'obsidian';
import type ZeroQoLModulesPlugin from '../../main';
import { BaseModule } from '../base-module';
import { locale } from '../../locales';

const MODULE_ID = 'attachment-clean-paste';

interface AttachmentCleanPasteSettings {
	extensions: string;
}

export class AttachmentCleanPasteModule extends BaseModule {
	id = MODULE_ID;
	name = locale.modules['attachment-clean-paste'].name;
	description = locale.modules['attachment-clean-paste'].description;

	private app: App;

	get defaultSettings(): Record<string, unknown> {
		return {
			extensions: 'png, jpg, jpeg, gif, svg, webp, bmp, pdf',
		};
	}

	onload(plugin: ZeroQoLModulesPlugin, moduleSettings: Record<string, unknown>): void {
		this.app = plugin.app;
		const rawSettings = moduleSettings as AttachmentCleanPasteSettings;

		const pasteRef = plugin.app.workspace.on(
			'editor-paste',
			this.createPasteHandler(rawSettings),
		);
		this.registerCleanup(() => plugin.app.workspace.offref(pasteRef));

		const dropRef = plugin.app.workspace.on(
			'editor-drop',
			this.createDropHandler(rawSettings),
		);
		this.registerCleanup(() => plugin.app.workspace.offref(dropRef));
	}

	renderInlineSettings(
		containerEl: HTMLElement,
		settings: Record<string, unknown>,
		saveSettings: () => Promise<void>,
	): void {
		const loc = locale.modules['attachment-clean-paste'];
		const extSettings = settings as unknown as AttachmentCleanPasteSettings;

		new Setting(containerEl)
			.setName(loc.extensionsLabel)
			.setDesc(loc.extensionsDesc)
			.addTextArea((textarea) => {
				textarea
					.setPlaceholder(loc.extensionsPlaceholder)
					.setValue(extSettings?.extensions ?? '')
					.onChange(async (value) => {
						settings.extensions = value;
						await saveSettings();
					});
				textarea.inputEl.rows = 4;
				textarea.inputEl.style.width = '100%';
			});
	}

	private async processAll(
		files: FileList,
		editor: Editor,
		settings: AttachmentCleanPasteSettings,
	): Promise<void> {
		const matchingFiles = Array.from(files).filter((f) =>
			this.shouldProcess(f.name, settings),
		);
		if (matchingFiles.length === 0) return;

		const links: string[] = [];
		for (const file of matchingFiles) {
			const link = await this.processFile(file, settings);
			if (link) links.push(link);
		}
		if (links.length === 0) return;

		editor.replaceSelection(links.join('\n\n'));
	}

	private createPasteHandler(settings: AttachmentCleanPasteSettings) {
		return async (
			evt: ClipboardEvent,
			editor: Editor,
			_info: MarkdownView | MarkdownFileInfo,
		): Promise<void> => {
			const files = evt.clipboardData?.files;
			if (!files || files.length === 0) return;

			evt.preventDefault();
			evt.stopPropagation();

			await this.processAll(files, editor, settings);
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

			evt.preventDefault();
			evt.stopPropagation();

			await this.processAll(files, editor, settings);
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
		_settings: AttachmentCleanPasteSettings,
	): Promise<string | null> {
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

			return `[[${availablePath}|${nameWithoutExt}]]`;
		} catch (e) {
			new Notice(`Clean Paste error: ${e.message}`);
			console.error('Attachment Clean Paste:', e);
		}
		return null;
	}
}
