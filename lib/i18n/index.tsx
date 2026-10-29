"use client";
/**
 * Minimal UI i18n (no dependency): an English baseline dictionary, a
 * Simplified Chinese overlay, a provider that resolves the appearance
 * section's `language` setting, and `useT()` for components. Missing keys
 * fall back to English, then to the key itself. Outside a provider (SSR
 * render tests) everything stays English.
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAppearance } from "@/components/settings/appearance";
import { en, type MessageKey } from "./en";
import { zhCN } from "./zh-CN";

export type Locale = "en" | "zh-CN";
export type LanguageSetting = "system" | Locale;
export type { MessageKey };

export const DICTIONARIES: Record<Locale, Partial<Record<MessageKey, string>>> = {
	en,
	"zh-CN": zhCN,
};

/** "system" → navigator.language ('zh*' → zh-CN, else en). Pure. */
export function resolveLocale(setting: string | undefined | null, systemLanguage?: string): Locale {
	if (setting === "en" || setting === "zh-CN") return setting;
	const sys = systemLanguage ?? (typeof navigator !== "undefined" ? navigator.language : "");
	return sys && sys.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
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

const I18nContext = createContext<{ locale: Locale; t: TFunction }>({
	locale: "en",
	t: (key, params) => translate("en", key, params),
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const { appearance } = useAppearance();
	// SSR/first paint renders English (no hydration mismatch); the client
	// resolves the setting (incl. "system" via navigator.language) after mount.
	const [locale, setLocale] = useState<Locale>("en");
	useEffect(() => {
		const next = resolveLocale(appearance.language);
		setLocale(next);
		document.documentElement.lang = next;
	}, [appearance.language]);
	const value = useMemo(
		() => ({ locale, t: ((key, params) => translate(locale, key, params)) as TFunction }),
		[locale],
	);
	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): TFunction {
	return useContext(I18nContext).t;
}

export function useLocale(): Locale {
	return useContext(I18nContext).locale;
}
