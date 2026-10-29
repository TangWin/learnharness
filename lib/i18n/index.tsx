"use client";
/**
 * Minimal UI i18n (no dependency): an English baseline dictionary, a
 * Simplified Chinese overlay, a provider that resolves the appearance
 * section's `language` setting, and `useT()` for components. Missing keys
 * fall back to English, then to the key itself. Outside a provider (SSR
 * render tests) everything stays English.
 */

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useAppearance } from "@/components/settings/appearance";
import { en, type MessageKey } from "./en";
import { zhCN } from "./zh-CN";
import { isSimplifiedChinese, LOCALE_PENDING_CLASS, LOCALE_STORAGE_KEY } from "./boot";

export { LOCALE_BOOT_SCRIPT, LOCALE_PENDING_CLASS, LOCALE_STORAGE_KEY } from "./boot";

export type Locale = "en" | "zh-CN";
export type LanguageSetting = "system" | Locale;
export type { MessageKey };

export const DICTIONARIES: Record<Locale, Partial<Record<MessageKey, string>>> = {
	en,
	"zh-CN": zhCN,
};

/** "system" → navigator.language (Simplified Chinese → zh-CN, else en; see boot.ts). Pure. */
export function resolveLocale(setting: string | undefined | null, systemLanguage?: string): Locale {
	if (setting === "en" || setting === "zh-CN") return setting;
	const sys = systemLanguage ?? (typeof navigator !== "undefined" ? navigator.language : "");
	return isSimplifiedChinese(sys) ? "zh-CN" : "en";
}

export type TParams = Record<string, string | number>;

/** Interpolate `{name}` placeholders; unknown placeholders stay verbatim. */
export function interpolate(template: string, params?: TParams): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (m, name: string) =>
		Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : m,
	);
}

/** Pure translate: locale dictionary → English → the key itself. */
export function translate(locale: Locale, key: MessageKey | string, params?: TParams): string {
	const dict = DICTIONARIES[locale] as Record<string, string | undefined>;
	const base = en as Record<string, string | undefined>;
	return interpolate(dict[key] ?? base[key] ?? key, params);
}

export type TFunction = (key: MessageKey, params?: TParams) => string;

/** English translator for pure helpers called outside a component (tests, defaults). */
export const tEn: TFunction = (key, params) => translate("en", key, params);

const I18nContext = createContext<{ locale: Locale; t: TFunction }>({
	locale: "en",
	t: (key, params) => translate("en", key, params),
});

function readStoredLocale(): Locale | null {
	try {
		const v = localStorage.getItem(LOCALE_STORAGE_KEY);
		return v === "en" || v === "zh-CN" ? v : null;
	} catch {
		return null;
	}
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const { appearance, loaded } = useAppearance();
	// SSR + hydration render English (markup matches, no hydration error).
	// Before the browser paints, the layout effect switches to the cached
	// locale (or the system rule) and lifts the pending class the inline
	// script set; /api/settings then reconciles.
	const [locale, setLocale] = useState<Locale>("en");
	const [booted, setBooted] = useState(false);
	useLayoutEffect(() => {
		setLocale(readStoredLocale() ?? resolveLocale("system"));
		setBooted(true);
	}, []);
	// Unhide only after the boot locale has been committed to the DOM.
	useLayoutEffect(() => {
		if (booted) document.documentElement.classList.remove(LOCALE_PENDING_CLASS);
	}, [booted]);
	useEffect(() => {
		if (loaded) setLocale(resolveLocale(appearance.language));
	}, [loaded, appearance.language]);
	useEffect(() => {
		// Before boot, `locale` is the SSR placeholder; persisting it would clobber the cache.
		if (!booted) return;
		document.documentElement.lang = locale;
		try {
			localStorage.setItem(LOCALE_STORAGE_KEY, locale);
		} catch {
			/* storage unavailable — first paint just falls back to the system rule */
		}
	}, [booted, locale]);
	const value = useMemo(
		() => ({ locale, t: ((key, params) => translate(locale, key, params)) as TFunction }),
		[locale],
	);
	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): TFunction {
	return useContext(I18nContext).t;
}

/** Inline translated text for JSX that has no hook scope (arrow components). */
export function T({ k, params }: { k: MessageKey; params?: TParams }) {
	return <>{useT()(k, params)}</>;
}
