# Analysis Report

## Session

- **Session ID:** a1b2c3d4-e5f6-7890-abcd-ef1234567890
- **Target repo:** S:\Git\zeroq-qol-modules
- **Date:** 2026-07-22
- **Project type:** existing

## 1. Общая информация

- **README:** Obsidian-плагин с модульной архитектурой. Каждая QoL-функция — отдельный модуль, включаемый/отключаемый в настройках. Сборка: `npm run build`.
- **Лицензия:** MIT
- **CI/CD:** GitHub Actions — `release.yml` (сборка и релиз при пуше тега v*)
- **Точка входа:** `src/main.ts` → компилируется в `main.js` через esbuild
- **Система сборки:** npm + esbuild (0.17.x), TypeScript 5.x

## 2. Стек технологий

| Компонент | Значение |
|---|---|
| Язык | TypeScript (5.x) |
| Фреймворк | Obsidian API (plugin) |
| База данных | — |
| Тестовый раннер | нет |
| Пакетный менеджер | npm |
| Линтер/форматтер | нет (не настроен) |

## 3. Архитектура

```
src/
├── main.ts                          # Plugin class onload/onunload
├── settings.ts                      # ZeroQSettingTab — единая панель настроек
├── types.ts                         # QoLModule, ZeroQSettings, ModuleSettings
├── locales/
│   ├── en.ts                        # Locale interface + English
│   ├── ru.ts                        # Russian translation
│   └── index.ts                     # Language auto-detect + export locale
└── modules/
    ├── index.ts                     # MODULES registry (static array)
    ├── base-module.ts               # BaseModule abstract class
    ├── attachment-clean-paste/
    │   └── index.ts                 # Paste/drop handler — ![[embed]] → [[path|name]]
    └── preserve-link-aliases/
        └── index.ts                 # Rename handler — preserves aliases in links
```

**Паттерн:** Модульный монолит (Plugin → Module Registry → Modules)

**Ключевые модули:**

| Модуль | Описание |
|---|---|
| `main.ts` | Жизненный цикл плагина: загрузка настроек, bootstrap модулей |
| `settings.ts` | Единая панель настроек: рендерит toggle + inline-настройки для каждого модуля |
| `types.ts` | Интерфейсы: `QoLModule`, `ZeroQSettings`, `ModuleSettings` |
| `locales/` | Локализация: автоопределение языка из `<html lang>`, fallback на en |
| `base-module.ts` | Абстрактный класс с `registerCleanup()` для автоматической очистки |
| `attachment-clean-paste` | Обработка paste/drop: копирует файл в attachments, вставляет `[[path|name]]` |
| `preserve-link-aliases` | Обработка rename: сохраняет алиасы `[[path|oldname]]` при переименовании |

## 4. Конвенции

- **Стиль:** tabs для отступов, kebab-case для файлов, PascalCase для классов
- **Импорты:** `import type` для type-only импортов; абсолютные пути из Obsidian, относительные внутри проекта
- **Типизация:** строгая — `noImplicitAny: true`, `strictNullChecks: true`; интерфейсы для настроек модулей
- **Обработка ошибок:** try/catch в асинхронных операциях, `new Notice()` для user-facing ошибок, `console.error` для логирования
- **Логирование:** `console.error` в исключениях, без отдельного логгера

## 5. Тесты

- **Команда запуска:** нет
- **Всего тестов:** 0
- Тесты отсутствуют в проекте.

## 6. Базовая проверка

- **Сборка:** успешно (`npm run build` — main.js 17.1kb)
- **Запуск:** невозможно (Obsidian-плагин, требуется среда Obsidian)
- **Git status:** чисто (ветка dev, untracked только .agent/)

## 8. Примечания

Существующий проект с 2 модулями. Все модули следуют единому паттерну: BaseModule → onload/onunload/renderInlineSettings. Архитектура спроектирована для лёгкого добавления новых модулей через регистрацию в `MODULES` и добавление переводов. Есть подробная документация по добавлению модуля в `review.md` (197 строк). Проект не имеет тестов, линтера, CI (кроме релизного workflow).
