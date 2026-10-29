/**
 * UI i18n: the zh-CN dictionary mirrors the English baseline key-for-key,
 * missing keys fall back to English, "system" resolves from the browser
 * language, and {name} placeholders interpolate.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { en } from "../lib/i18n/en.ts";
import { zhCN } from "../lib/i18n/zh-CN.ts";
import { DICTIONARIES, interpolate, resolveLocale, translate } from "../lib/i18n/index.tsx";
import { FACTORY_SETTINGS, sanitizeUserSettings } from "../src/core/settings.ts";

test("en and zh-CN have identical key sets", () => {
	assert.deepEqual(Object.keys(zhCN).sort(), Object.keys(en).sort());
	for (const [k, v] of Object.entries(zhCN)) assert.ok(v.trim().length > 0, `empty zh-CN string for ${k}`);
});

test("placeholders match between en and zh-CN", () => {
	const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
	for (const k of Object.keys(en) as (keyof typeof en)[]) assert.deepEqual(names(zhCN[k]), names(en[k]), k);
});

test("missing key falls back to English, then to the key", () => {
	const zh = DICTIONARIES["zh-CN"] as Record<string, string | undefined>;
	const saved = zh["common.cancel"] as string;
	delete zh["common.cancel"];
	try {
		assert.equal(translate("zh-CN", "common.cancel"), "Cancel");
	} finally {
		zh["common.cancel"] = saved;
	}
	assert.equal(translate("zh-CN", "common.cancel"), "取消");
	assert.equal(translate("zh-CN", "no.such.key"), "no.such.key");
});

test("system language detection", () => {
	assert.equal(resolveLocale("system", "zh-CN"), "zh-CN");
	assert.equal(resolveLocale("system", "zh-TW"), "zh-CN");
	assert.equal(resolveLocale("system", "zh"), "zh-CN");
	assert.equal(resolveLocale("system", "en-US"), "en");
	assert.equal(resolveLocale("system", "ja-JP"), "en");
	assert.equal(resolveLocale(undefined, "zh-Hans"), "zh-CN");
	assert.equal(resolveLocale("en", "zh-CN"), "en");
	assert.equal(resolveLocale("zh-CN", "en-US"), "zh-CN");
});

test("interpolation", () => {
	assert.equal(interpolate("Hi {name}, {n} left", { name: "Ann", n: 3 }), "Hi Ann, 3 left");
	assert.equal(interpolate("keep {missing}", {}), "keep {missing}");
	assert.equal(translate("en", "home.teachingSessions", { count: 2 }), "2 teaching sessions");
	assert.equal(translate("zh-CN", "home.teachingSessions", { count: 2 }), "2 个教学会话");
});

test("appearance.language: factory default and sanitizer", () => {
	assert.equal(FACTORY_SETTINGS.appearance.language, "system");
	const ok = sanitizeUserSettings({ version: 1, appearance: { language: "zh-CN" } });
	assert.equal(ok?.appearance?.language, "zh-CN");
	const bad = sanitizeUserSettings({ version: 1, appearance: { language: "fr" } });
	assert.equal(bad?.appearance?.language, undefined);
});

test("appearance.language: settings PUT body parser accepts valid values, rejects others", async () => {
	const { parseAppearanceSettingsBody } = await import("../src/server/settings-body.ts");
	const ok = parseAppearanceSettingsBody({ language: "zh-CN" });
	assert.equal(ok.ok, true);
	assert.deepEqual(ok.ok && ok.settings, { language: "zh-CN" });
	assert.equal(parseAppearanceSettingsBody({ language: "fr" }).ok, false);
});
