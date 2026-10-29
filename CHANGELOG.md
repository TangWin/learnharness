# Changelog

## Unreleased

### Added

- UI internationalization: English (baseline) and Simplified Chinese (zh-CN) via a dependency-free `lib/i18n` (`I18nProvider`, `useT()`, `<T>`, `{name}` interpolation, English fallback for missing keys). ~570 UI strings covered: settings, sidebar, home/graph, chat transcript chrome, question/practice docks and cards, plan, activity dock, chain table, stats, extraction coverage, dictation, model menus, connection panels, keyboard shortcuts, dialogs.
- `appearance.language` setting (`system` | `en` | `zh-CN`, default `system`) with a "Language / 语言" row in Settings → Appearance; `system` follows `navigator.language`. Applies immediately, persists in `settings.json`, and `<html lang>` follows the active locale.
- `tests/i18n.test.ts` covering key parity, fallback, system-language detection, interpolation, settings sanitization and the settings PUT parser.

### Changed

- `electron-builder.yml`: the GitHub publish provider now points at `TangWin/learnharness`, so the auto-update feed follows the TangWin fork.
