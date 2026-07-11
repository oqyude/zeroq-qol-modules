import { Plugin } from 'obsidian';

export interface ModuleSettings {
	enabled: boolean;
	settings: Record<string, unknown>;
}

export interface ZeroQSettings {
	modules: Record<string, ModuleSettings>;
}

export interface QoLModule {
	id: string;
	name: string;
	description: string;
	defaultSettings: Record<string, unknown>;
	onload(plugin: Plugin, moduleSettings: Record<string, unknown>): void;
	onunload(plugin: Plugin): void;
	renderInlineSettings(
		containerEl: HTMLElement,
		settings: Record<string, unknown>,
		saveSettings: () => Promise<void>,
	): void;
}
