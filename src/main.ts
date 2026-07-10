import { Plugin } from 'obsidian';
import { ZeroQSettings, QoLModule } from './types';
import { MODULES } from './modules';
import { DEFAULT_SETTINGS, ZeroQSettingTab, getModuleSettings } from './settings';

export default class ZeroQoLModulesPlugin extends Plugin {
	settings: ZeroQSettings;
	private loadedModules: Set<string> = new Set();

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ZeroQSettingTab(this.app, this));

		for (const module of MODULES) {
			const moduleCfg = this.settings.modules[module.id];
			if (moduleCfg?.enabled) {
				this.loadModule(module);
			}
		}
	}

	onunload() {
		for (const module of MODULES) {
			this.unloadModule(module);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		) as ZeroQSettings;

		for (const module of MODULES) {
			if (!this.settings.modules[module.id]) {
				this.settings.modules[module.id] = {
					enabled: true,
					settings: { ...module.defaultSettings },
				};
			}
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	loadModule(module: QoLModule) {
		if (this.loadedModules.has(module.id)) return;

		const moduleSettings = getModuleSettings(this.settings, module.id);
		module.onload(this, moduleSettings);
		this.loadedModules.add(module.id);
	}

	unloadModule(module: QoLModule) {
		if (!this.loadedModules.has(module.id)) return;

		module.onunload(this);
		this.loadedModules.delete(module.id);
	}
}
