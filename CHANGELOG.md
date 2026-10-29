# Changelog

## Unreleased

### Added

- UI internationalization: English (baseline) and Simplified Chinese (zh-CN) via a dependency-free `lib/i18n` (`I18nProvider`, `useT()`, `{name}` interpolation, English fallback for missing keys).
- `appearance.language` setting (`system` | `en` | `zh-CN`, default `system`) with a "Language / 语言" row in Settings → Appearance; `system` follows `navigator.language`. `<html lang>` follows the active locale.
- `tests/i18n.test.ts` covering key parity, fallback, system-language detection, interpolation, and settings sanitization.
