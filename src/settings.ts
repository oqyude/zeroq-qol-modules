import { App, PluginSettingTab, Setting } from 'obsidian';
import type ZeroQoLModulesPlugin from './main';
import { MODULES } from './modules';
import { ZeroQSettings } from './types';
import { locale } from './locales';

const MODULE_DEFAULTS = MODULES.reduce(
	(acc, mod) => {
		acc[mod.id] = {
			enabled: true,
			settings: { ...mod.defaultSettings },
		};
		return acc;
	},
	{} as ZeroQSettings['modules'],
);

export const DEFAULT_SETTINGS: ZeroQSettings = {
	modules: MODULE_DEFAULTS,
};

export function getModuleSettings(
	settings: ZeroQSettings,
	moduleId: string,
): Record<string, unknown> {
	return settings.modules[moduleId]?.settings ?? {};
}

export class ZeroQSettingTab extends PluginSettingTab {
	plugin: ZeroQoLModulesPlugin;

	constructor(app: App, plugin: ZeroQoLModulesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h1', { text: locale.settings.title });
		containerEl.createEl('p', {
			text: locale.settings.description,
			attr: { style: 'color: var(--text-muted); margin-bottom: 20px;' },
		});

		for (const module of MODULES) {
			const moduleCfg = this.plugin.settings.modules[module.id];

			new Setting(containerEl)
				.setName(module.name)
				.setDesc(module.description)
				.addToggle((toggle) =>
					toggle
						.setValue(moduleCfg?.enabled ?? true)
						.onChange(async (value) => {
							if (!this.plugin.settings.modules[module.id]) {
								this.plugin.settings.modules[module.id] = {
									enabled: value,
									settings: { ...module.defaultSettings },
								};
							} else {
								this.plugin.settings.modules[module.id].enabled = value;
							}
							await this.plugin.saveSettings();
							if (value) {
								this.plugin.loadModule(module);
							} else {
								this.plugin.unloadModule(module);
							}
						}),
				);

			if (moduleCfg) {
				module.renderInlineSettings(
					containerEl,
					moduleCfg.settings,
					() => this.plugin.saveSettings(),
				);
			}
		}
	}
}
