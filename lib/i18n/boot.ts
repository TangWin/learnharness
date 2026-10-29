/**
 * Server-safe constants for the pre-hydration locale boot (no "use client":
 * app/layout.tsx inlines LOCALE_BOOT_SCRIPT into <head>).
 */

/** localStorage key caching the last resolved locale (read pre-hydration by
 *  the inline script in app/layout.tsx so the first paint is already right). */
export const LOCALE_STORAGE_KEY = "lh.locale";
/** Class the inline script puts on <html> while a non-English locale waits for
 *  hydration (globals.css hides the body meanwhile — no English flash). */
export const LOCALE_PENDING_CLASS = "lh-i18n-pending";

/** THE system-language rule, shared by resolveLocale and the inline script:
 *  only Simplified Chinese maps to zh-CN — bare `zh`, `zh-CN`, `zh-SG`,
 *  `zh-Hans` / `zh-Hans-*` (case-insensitive). Traditional (`zh-TW`,
 *  `zh-HK`, `zh-MO`, `zh-Hant*`) and everything else → en. */
export const SIMPLIFIED_ZH_PATTERN = "^zh(-(cn|sg|hans)(-.*)?)?$";

export function isSimplifiedChinese(tag: string | null | undefined): boolean {
	return !!tag && new RegExp(SIMPLIFIED_ZH_PATTERN, "i").test(tag);
}

/** The pre-hydration script body (inlined in <head>): stored locale, else the
 *  navigator rule; sets <html lang> and, for non-English, the pending class
 *  (with a safety timeout so a failed hydration never leaves a blank page). */
export const LOCALE_BOOT_SCRIPT = `try{var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});if(l!=="en"&&l!=="zh-CN"){l=new RegExp(${JSON.stringify(SIMPLIFIED_ZH_PATTERN)},"i").test(navigator.language||"")?"zh-CN":"en"}var d=document.documentElement;d.lang=l;if(l!=="en"){d.classList.add(${JSON.stringify(LOCALE_PENDING_CLASS)});setTimeout(function(){d.classList.remove(${JSON.stringify(LOCALE_PENDING_CLASS)})},4000)}}catch(e){}`;

