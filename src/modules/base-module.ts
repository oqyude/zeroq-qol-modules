import { Plugin } from 'obsidian';
import { QoLModule } from '../types';

export abstract class BaseModule implements QoLModule {
	abstract id: string;
	abstract name: string;
	abstract description: string;

	private cleanupFns: (() => void)[] = [];

	get defaultSettings(): Record<string, unknown> {
		return {};
	}

	abstract onload(plugin: Plugin, moduleSettings: Record<string, unknown>): void;

	onunload(_plugin: Plugin): void {
		for (const fn of this.cleanupFns) {
			fn();
		}
		this.cleanupFns = [];
	}

	renderInlineSettings(
		_containerEl: HTMLElement,
		_settings: Record<string, unknown>,
		_saveSettings: () => Promise<void>,
	): void {}

	protected registerCleanup(fn: () => void): void {
		this.cleanupFns.push(fn);
	}
}
