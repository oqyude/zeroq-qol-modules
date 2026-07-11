import { Plugin, TFile, Vault, Setting } from 'obsidian';
import type ZeroQoLModulesPlugin from '../../main';
import { BaseModule } from '../base-module';
import { locale } from '../../locales';

const MODULE_ID = 'preserve-link-aliases';

interface PreserveLinkAliasesSettings {
	processEmbeds: boolean;
	processCanvas: boolean;
}

export class PreserveLinkAliasesModule extends BaseModule {
	id = MODULE_ID;
	name = locale.modules['preserve-link-aliases'].name;
	description = locale.modules['preserve-link-aliases'].description;

	private vault: Vault;

	get defaultSettings(): Record<string, unknown> {
		return {
			processEmbeds: false,
			processCanvas: false,
		};
	}

	onload(plugin: ZeroQoLModulesPlugin, moduleSettings: Record<string, unknown>): void {
		this.vault = plugin.app.vault;
		const rawSettings = moduleSettings as PreserveLinkAliasesSettings;

		const renameRef = plugin.app.vault.on(
			'rename',
			(file: TFile, oldPath: string) => this.handleRename(file, oldPath, rawSettings),
		);
		this.registerCleanup(() => plugin.app.vault.offref(renameRef));
	}

	renderInlineSettings(
		containerEl: HTMLElement,
		settings: Record<string, unknown>,
		saveSettings: () => Promise<void>,
	): void {
		const loc = locale.modules['preserve-link-aliases'];
		const s = settings as unknown as PreserveLinkAliasesSettings;

		new Setting(containerEl)
			.setName(loc.processEmbedsLabel)
			.setDesc(loc.processEmbedsDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(s.processEmbeds)
					.onChange(async (value) => {
						s.processEmbeds = value;
						await saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(loc.processCanvasLabel)
			.setDesc(loc.processCanvasDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(s.processCanvas)
					.onChange(async (value) => {
						s.processCanvas = value;
						await saveSettings();
					}),
			);
	}

	private async handleRename(
		file: TFile,
		oldPath: string,
		settings: PreserveLinkAliasesSettings,
	): Promise<void> {
		const oldName = oldPath.split('/').pop() ?? '';
		const newName = file.name;

		const oldBasename = oldName.replace(/\.[^/.]+$/, '');
		const newBasename = newName.replace(/\.[^/.]+$/, '');

		if (oldBasename === newBasename) return;

		const files = this.getFilesToProcess(settings);

		for (const f of files) {
			const content = await this.vault.read(f);
			const updated = this.processContent(content, newName, newBasename, oldBasename, settings);

			if (updated !== content) {
				await this.vault.modify(f, updated);
			}
		}
	}

	private getFilesToProcess(settings: PreserveLinkAliasesSettings): TFile[] {
		const files: TFile[] = [];

		for (const file of this.vault.getMarkdownFiles()) {
			files.push(file);
		}

		if (settings.processCanvas) {
			const abstractFiles = this.vault.getFiles();
			for (const file of abstractFiles) {
				if (file.extension === 'canvas') {
					files.push(file as TFile);
				}
			}
		}

		return files;
	}

	private processContent(
		content: string,
		newFileName: string,
		newBasename: string,
		oldBasename: string,
		settings: PreserveLinkAliasesSettings,
	): string {
		const wikiLinkRe = /(!?)\[\[([^\]]*?)]]/g;

		return content.replace(wikiLinkRe, (fullMatch, prefix, inner) => {
			if (prefix === '!' && !settings.processEmbeds) {
				return fullMatch;
			}

			const pipeIndex = inner.indexOf('|');
			if (pipeIndex === -1) return fullMatch;

			const linkPath = inner.slice(0, pipeIndex);
			const alias = inner.slice(pipeIndex + 1);

			if (alias !== newBasename) return fullMatch;

			const linkFilename = linkPath.split('/').pop();
			if (linkFilename !== newFileName) return fullMatch;

			return `${prefix}[[${linkPath}|${oldBasename}]]`;
		});
	}
}
