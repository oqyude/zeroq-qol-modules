# MetaAgent Request
# Auto-generated from user interview on 2026-07-22

## Параметры сессии

| Функция | Вкл | Аргументы |
|---|---|---|
| ANALYSIS | ✓ | — |
| DESIGN | ✗ | (existing project) |
| RED_TEAM | ✗ | — |
| RISK_REGISTER | ✗ | — |
| DECOMPOSITION | ✓ | invariant_tests=no |
| SETUP | ✓ | — |
| HANDOFF | ✓ | layer_structure=no |

## Глубина проработки

**Значение:** 4 (Light)

| Уровень | Название | Описание |
|---|---|---|
| 1-2 | Scaffold | Только структура проекта + пустые модули |
| 3-4 | Light | (default) Быстрый дизайн + задачи без расширений |
| 5-6 | Standard | Полный ANALYSIS→DESIGN→DECOMP→SETUP→HANDOFF |
| 7-8 | Deep | Standard + ADR, Risk Register, Alternative Architecture |
| 9-10 | Maximum | Deep + Red Team Review, Executable Invariants |

## Цель

Проанализировать существующий Obsidian-плагин `zeroq-qol-modules` (v1.1.4) и подготовить манифест задач для исполнительного агента.
