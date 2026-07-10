# ZeroQ QoL Modules

Модульный плагин для **Obsidian** с набором QoL-функций, которые можно включать и отключать в настройках.

## Установка

1. Скачайте `main.js`, `manifest.json` и `styles.css` из [релизов](https://github.com/your/repo/releases)
2. Поместите их в папку `.obsidian/plugins/zeroq-qol-modules/` вашего хранилища
3. В Obsidian: **Настройки** → **Community plugins** → **Включить**
4. Активируйте плагин **ZeroQ QoL Modules**

## Модули

| Модуль | Описание |
|--------|----------|
| **Attachment Clean Paste** | Заменяет `![[вложение]]` на `[[вложение|имя]]` при вставке/перетаскивании файлов с указанными расширениями |

Каждый модуль включается/отключается в настройках плагина.

## Разработка

### Добавление нового модуля

1. Создайте папку `src/modules/my-module/`
2. Создайте класс, унаследованный от `BaseModule`:

```typescript
import { BaseModule } from '../base-module';

export class MyModule extends BaseModule {
  id = 'my-module';
  name = 'My Module';
  description = 'Описание модуля';

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

3. Зарегистрируйте модуль в `src/modules/index.ts`:

```typescript
import { MyModule } from './my-module';

export const MODULES: QoLModule[] = [
  new AttachmentCleanPasteModule(),
  new MyModule(),
];
```

4. Если модулю нужна своя вкладка настроек — создайте `PluginSettingTab` и добавьте её через `plugin.addSettingTab()` в `onload`

### Сборка

```bash
npm run build    # production-сборка
npm run dev      # dev-сборка с sourcemap
```

### Архитектура

```
src/
├── main.ts                          # точка входа, Plugin class
├── settings.ts                      # общая панель настроек
├── types.ts                         # базовые типы
└── modules/
    ├── index.ts                     # реестр модулей (статический импорт)
    ├── base-module.ts               # абстрактный класс модуля
    └── attachment-clean-paste/
        └── index.ts                 # реализация модуля
```

**Принцип работы:**
- `main.ts` загружает настройки, итерирует `MODULES` и вызывает `onload()` для включённых
- Каждый модуль через `registerCleanup()` регистрирует функции отчистки, которые вызываются при выключении модуля или выгрузке плагина
- В настройках отображаются все модули с чекбоксами вкл/выкл

## Лицензия

MIT
