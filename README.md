# ZeroQ QoL Modules

Модульный плагин для **Obsidian** с набором QoL-функций, которые можно включать и отключать в настройках.

Modular **Obsidian** plugin with toggleable QoL modules in settings.

## Установка / Installation

1. Скачайте `main.js`, `manifest.json` и `styles.css` из [релизов](https://github.com/your/repo/releases)
2. Поместите их в папку `.obsidian/plugins/zeroq-qol-modules/` вашего хранилища
3. В Obsidian: **Настройки** → **Community plugins** → **Включить**
4. Активируйте плагин **ZeroQ QoL Modules**

## Язык / Language

Язык плагина синхронизируется с **языком интерфейса Obsidian** (Settings → About → Language).

- Obsidian на русском → плагин на русском
- Obsidian на другом языке → плагин на английском

The plugin language syncs with **Obsidian's UI language** setting.

- Obsidian in English → plugin in English
- Obsidian in any other language → falls back to English

## Модули / Modules

- **Attachment Clean Paste** — Заменяет `![[embed]]` на `[[path/file|name]]` для файлов с указанными расширениями при вставке/перетаскивании

Каждый модуль включается/отключается в настройках плагина.

## Разработка / Development

### Архитектура / Architecture

```
src/
├── main.ts                          # точка входа, Plugin class
├── settings.ts                      # общая панель настроек
├── types.ts                         # базовые типы
├── locales/
│   ├── en.ts                        # тип Locale + EN-словарь
│   ├── ru.ts                        # RU-словарь
│   └── index.ts                     # авто-определение языка
└── modules/
    ├── index.ts                     # реестр модулей (статический импорт)
    ├── base-module.ts               # абстрактный класс модуля
    └── attachment-clean-paste/
        └── index.ts                 # реализация модуля
```

**Принцип работы:**
- `main.ts` загружает настройки, итерирует `MODULES` и вызывает `onload()` для включённых
- Каждый модуль через `registerCleanup()` регистрирует функции очистки, которые вызываются при выключении модуля или выгрузке плагина
- В настройках отображаются все модули с чекбоксами вкл/выкл

### Добавление нового модуля / Adding a module

1. Создайте папку `src/modules/my-module/`
2. Создайте класс, унаследованный от `BaseModule`:

```typescript
import { BaseModule } from '../base-module';
import { locale } from '../../locales';

export class MyModule extends BaseModule {
  id = 'my-module';
  name = locale.modules['my-module'].name;
  description = locale.modules['my-module'].description;

  get defaultSettings() {
    return { /* настройки по умолчанию */ };
  }

  onload(plugin, moduleSettings) {
    // инициализация: регистрация событий, команд, настроек
  }

  onunload(plugin) {
    // очистка (cleanup происходит автоматически через registerCleanup)
  }
}
```

3. Добавьте переводы в `src/locales/en.ts` и `src/locales/ru.ts`
4. Зарегистрируйте модуль в `src/modules/index.ts`:

```typescript
import { MyModule } from './my-module';

export const MODULES: QoLModule[] = [
  new AttachmentCleanPasteModule(),
  new MyModule(),
];
```

### Добавление нового языка / Adding a language

1. Создайте `src/locales/de.ts` со структурой `Locale`
2. Импортируйте и добавьте в словарь в `src/locales/index.ts`:
```typescript
import { de } from './de';
const locales: Record<string, Locale> = { en, ru, de };
```

### Сборка / Build

```bash
npm run build    # production-сборка
npm run dev      # dev-сборка с sourcemap
```

## Лицензия / License

MIT
