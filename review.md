# Project Review: zeroq-qol-modules

## Overview

Obsidian plugin with a **modular architecture**. Each feature is a separate module that can be toggled on/off in settings.

**Plugin ID:** `zeroq-qol-modules`  
**Entry point:** `src/main.ts` → compiles to `main.js` (esbuild)  
**Version source:** `package.json` → auto-synced to `manifest.json` on build

## Stack

- **Language:** TypeScript (5.x)
- **Bundler:** esbuild (0.17.x)
- **Obsidian API:** `obsidian` latest (type defs only, excluded from bundle)
- **Format:** CommonJS (`format: 'cjs'`), target ES2018

## Directory Structure

```
src/
├── main.ts                          # Plugin class — loads settings, bootstraps modules
├── settings.ts                      # ZeroQSettingTab — single settings pane, renders all modules
├── types.ts                         # QoLModule interface, ZeroQSettings, ModuleSettings
├── locales/
│   ├── en.ts                        # Locale type definition + English dictionary
│   ├── ru.ts                        # Russian dictionary (same Locale shape)
│   └── index.ts                     # Auto-detects language from <html lang>, exports locale
└── modules/
    ├── index.ts                     # Static registry: array of all module instances
    ├── base-module.ts               # BaseModule abstract class
    └── attachment-clean-paste/
        └── index.ts                 # Concrete module implementation
```

## Architecture

### Plugin Lifecycle (`main.ts`)

```
onload()
  → loadSettings()          # merge DEFAULT_SETTINGS + saved data
  → addSettingTab()         # register ZeroQSettingTab
  → for each module:
      if enabled → loadModule(module)
                       → module.onload(this, moduleSettings)

onunload()
  → for each module:
      unloadModule(module)
        → module.onunload(this)
```

### Module Lifecycle

Each module is a **singleton** implementing `QoLModule` (or extending `BaseModule`):

| Method | Purpose |
|--------|---------|
| `onload(plugin, moduleSettings)` | Initialize: register events, commands, setting tab |
| `onunload(plugin)` | Cleanup (auto-runs `registerCleanup` callbacks) |
| `renderInlineSettings(containerEl, settings, saveSettings)` | Render module-specific settings inline (no separate tab) |
| `defaultSettings` | Default module settings object |

### Cleanup pattern

Modules use `this.registerCleanup(fn)` to queue cleanup callbacks. They auto-run in `onunload()`. Example:

```ts
const ref = plugin.app.workspace.on('editor-paste', handler);
this.registerCleanup(() => plugin.app.workspace.offref(ref));
```

### Settings architecture

- **ZeroQSettingTab** (`settings.ts`) — single Obsidian settings pane
- Iterates `MODULES`, renders each with:
  1. Toggle (enable/disable) — toggling calls `loadModule` / `unloadModule` at runtime
  2. `module.renderInlineSettings()` — module-specific controls rendered directly below the toggle
- **No separate PluginSettingTab per module** — all in one block

### Settings data shape

```ts
interface ZeroQSettings {
  modules: Record<string, {
    enabled: boolean;
    settings: Record<string, unknown>;  // module-specific, typed per module
  }>;
}
```

### Localization (`locales/`)

- **Locale type** defined in `en.ts` as the interface `Locale`
- **Language detection:** reads `<html lang>` attribute (set by Obsidian per its own language setting)
- Fallback to `'en'` if language is not in the dictionary
- Usage: `import { locale } from '../../locales'` → `locale.settings.title`, `locale.modules['xxx'].name`

**To add a language:**
1. Create `src/locales/de.ts` with `Locale` shape
2. Import it in `src/locales/index.ts` and add to `locales` record

## Adding a New Module

### Step 1: Create the module class

Extend `BaseModule` in `src/modules/my-module/index.ts`:

```ts
import { Plugin } from 'obsidian';
import { BaseModule } from '../base-module';
import { locale } from '../../locales';

export class MyModule extends BaseModule {
  id = 'my-module';
  name = locale.modules['my-module'].name;
  description = locale.modules['my-module'].description;

  get defaultSettings(): Record<string, unknown> {
    return { myOption: 'default' };
  }

  onload(plugin: Plugin, moduleSettings: Record<string, unknown>): void {
    // register events/commands via plugin.registerEvent / plugin.addCommand
    // use this.registerCleanup(fn) for teardown
  }

  renderInlineSettings(
    containerEl: HTMLElement,
    settings: Record<string, unknown>,
    saveSettings: () => Promise<void>,
  ): void {
    // render controls into containerEl
    // mutate settings object directly, then call saveSettings()
    new Setting(containerEl)
      .setName('My option')
      .addText(text => text
        .setValue(String(settings.myOption ?? ''))
        .onChange(async v => {
          settings.myOption = v;
          await saveSettings();
        }));
  }
}
```

### Step 2: Add translations

In `src/locales/en.ts`, add to the `Locale` interface and the `en` object:

```ts
'modules': {
  'my-module': {
    name: string;
    description: string;
    // any other strings this module needs
  };
}
```

Do the same in `src/locales/ru.ts`.

### Step 3: Register in the registry

In `src/modules/index.ts`:

```ts
import { MyModule } from './my-module';

export const MODULES: QoLModule[] = [
  new AttachmentCleanPasteModule(),
  new MyModule(),
];
```

## Build

```bash
npm run build    # production build (minified, no sourcemaps)
npm run dev      # dev build (inline sourcemaps)
```

`esbuild.config.mjs` also syncs `version` from `package.json` to `manifest.json` before building.

## Conventions

- **No comments** in source code
- **No emojis** in code or UI
- **Indentation:** tabs (Obsidian convention)
- **Imports:** `import type` for type-only imports to avoid circular dependencies
- **File naming:** `kebab-case` for files, `PascalCase` for classes
- **Russian labels** for Russian locale, **English labels** for all other locales
- Module `id` is `kebab-case` and matches the key in the locales `modules` object
