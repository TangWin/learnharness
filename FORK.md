# TangWin/learnharness — fork notes

This fork tracks [amosblomqvist/learnharness](https://github.com/amosblomqvist/learnharness) (AGPL-3.0). The fork-specific changes are listed below; upstream's LICENSE and copyright notices are unchanged.

## Languages / 多语言

The interface is available in **English** and **Simplified Chinese (简体中文)**. Open **Settings → Appearance → Language / 语言** and pick `System`, `English`, or `简体中文`. The change applies immediately and persists across restarts (`appearance.language` in `settings.json`). `System` follows your OS/browser language: only Simplified Chinese tags (`zh`, `zh-CN`, `zh-SG`, `zh-Hans`, `zh-Hans-*`, case-insensitive) → 简体中文; Traditional Chinese (`zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant*`) and everything else → English. The last resolved locale is cached in `localStorage` (`lh.locale`) so the first paint after a reload is already in the right language. Agent output, prompts, model/provider names, and server error messages are not translated.

界面支持英文和简体中文。在 **设置 → 外观 → Language / 语言** 中选择“跟随系统”、English 或“简体中文”，立即生效并在重启后保留。“跟随系统”会根据系统/浏览器语言自动选择（仅简体中文标签 `zh`/`zh-CN`/`zh-SG`/`zh-Hans*` → 简体中文；繁体 `zh-TW`/`zh-HK`/`zh-MO`/`zh-Hant*` 及其他 → 英文）。智能体输出、提示词、模型/服务商名称和服务器错误信息不做翻译。

For contributors: strings live in `lib/i18n/en.ts` (baseline) and `lib/i18n/zh-CN.ts`; components call `useT()` → `t("key", { param })`. Missing keys fall back to English. `tests/i18n.test.ts` checks key parity, placeholders, fallback, and dynamically built keys.

## Changelog (fork)

### Unreleased

#### Added

- UI internationalization: English (baseline) and Simplified Chinese (zh-CN) via a dependency-free `lib/i18n` (`I18nProvider`, `useT()`, `{name}` interpolation, English fallback). ~570 UI strings covered across settings, sidebar, home/graph, chat chrome, docks and cards, plan, activity dock, chain table, stats, extraction coverage, dictation, model menus, connection panels, keyboard shortcuts, and dialogs.
- `appearance.language` setting (`system` | `en` | `zh-CN`, default `system`) with a "Language / 语言" row in Settings → Appearance; persisted through the settings API; `<html lang>` follows the active locale; no English flash on first paint (localStorage cache + inline boot script).
- `tests/i18n.test.ts`.

#### Changed

- `electron-builder.yml`: the GitHub publish provider now points at `TangWin/learnharness`, so the desktop auto-update feed follows this fork instead of upstream.
