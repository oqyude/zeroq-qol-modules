# Task Manifest

**Session:** a1b2c3d4-e5f6-7890-abcd-ef1234567890
**Goal:** Проанализировать существующий Obsidian-плагин zeroq-qol-modules (v1.1.4) и подготовить манифест задач для исполнительного агента.
**Date:** 2026-07-22T00:00:00.000Z

---

## Task Overview

| ID | Title | Type | Depends On | Status |
|---|---|---|---|---|
| T1 | Настроить ESLint и Prettier | config | — | pending |
| T2 | Написать тесты для BaseModule | test | — | pending |
| T3 | Написать тесты для Attachment Clean Paste модуля | test | T2 | pending |
| T4 | Написать тесты для Preserve Link Aliases модуля | test | T2 | pending |
| T5 | Добавить CI workflow для тестов и линтинга | config | T1, T3, T4 | pending |

**Total tasks:** 5

---

## Task Details

### T1: Настроить ESLint и Prettier

**Type:** config
**Description:** Добавить конфигурацию ESLint (typescript-eslint) и Prettier для единого стиля кода. Настроить скрипты lint/format в package.json.

**Files:**
- `package.json`
- `.eslintrc.json`
- `.prettierrc.json`

**Depends on:** —

**Acceptance Criteria:**
- [ ] ESLint настроен с typescript-eslint, проходит без ошибок на src/
- [ ] Prettier настроен с tabs, проходит без ошибок на src/
- [ ] Скрипты lint и format добавлены в package.json

**Context:** В проекте используются tabs для отступов (см. review.md). Линтер/форматтер отсутствует.

---

### T2: Написать тесты для BaseModule

**Type:** test
**Description:** Добавить unit-тесты для BaseModule: проверка registerCleanup, onunload (очистка всех функций), defaultSettings.

**Files:**
- `src/modules/base-module.ts`
- `tests/modules/base-module.test.ts`
- `package.json`
- `tsconfig.json`

**Depends on:** —

**Acceptance Criteria:**
- [ ] Тест проверяет, что registerCleanup добавляет функцию в очередь
- [ ] Тест проверяет, что onunload вызывает все зарегистрированные cleanup-функции
- [ ] Тест проверяет, что onunload очищает очередь после выполнения
- [ ] Тест проверяет, что defaultSettings возвращает пустой объект
- [ ] Все тесты проходят (npm test)

**Context:** BaseModule — абстрактный класс-основа для всех модулей. Находится в src/modules/base-module.ts. Для тестов нужно настроить тестовый раннер (jest или vitest) и mock-объект Plugin из obsidian.

---

### T3: Написать тесты для Attachment Clean Paste модуля

**Type:** test
**Description:** Добавить unit-тесты для AttachmentCleanPasteModule: проверка shouldProcess (фильтрация расширений), обработка paste/drop событий.

**Files:**
- `src/modules/attachment-clean-paste/index.ts`
- `tests/modules/attachment-clean-paste.test.ts`

**Depends on:** T2

**Acceptance Criteria:**
- [ ] Тест проверяет shouldProcess с разными расширениями и настройками
- [ ] Тест проверяет, что обработчик paste вызывает preventDefault для файлов с подходящими расширениями
- [ ] Тест проверяет, что модуль корректно создаёт ссылку [[path|name]]
- [ ] Все тесты проходят (npm test)

**Context:** Attachment Clean Paste обрабатывает editor-paste и editor-drop события. Основная логика: shouldProcess (фильтрация по extensions) и processFile (копирование + создание ссылки).

---

### T4: Написать тесты для Preserve Link Aliases модуля

**Type:** test
**Description:** Добавить unit-тесты для PreserveLinkAliasesModule: проверка processContent (замена алиасов), getFilesToProcess (фильтрация файлов), обработка rename.

**Files:**
- `src/modules/preserve-link-aliases/index.ts`
- `tests/modules/preserve-link-aliases.test.ts`

**Depends on:** T2

**Acceptance Criteria:**
- [ ] Тест проверяет processContent: замена алиаса при переименовании
- [ ] Тест проверяет processContent: игнорирование ссылок без алиаса
- [ ] Тест проверяет processContent: учёт флага processEmbeds
- [ ] Тест проверяет getFilesToProcess: включение canvas-файлов при processCanvas=true
- [ ] Все тесты проходят (npm test)

**Context:** Preserve Link Aliases обрабатывает vault rename. Основная логика: processContent (регулярное выражение для вики-ссылок) и getFilesToProcess (сбор markdown + опционально canvas).

---

### T5: Добавить CI workflow для тестов и линтинга

**Type:** config
**Description:** Добавить GitHub Actions workflow для автоматического запуска тестов и ESLint на push/PR в main/dev.

**Files:**
- `.github/workflows/ci.yml`

**Depends on:** T1, T3, T4

**Acceptance Criteria:**
- [ ] Workflow запускается на push и pull_request в main и dev
- [ ] Workflow выполняет npm ci, npm run lint, npm test
- [ ] Workflow завершается с ошибкой при падении тестов или линтера

**Context:** Существующий release.yml в .github/workflows/ — можно использовать как шаблон. Node 20, ubuntu-latest.
