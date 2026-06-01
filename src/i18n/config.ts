export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && locales.includes(value as Locale);
}

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist the chosen locale in a cookie (client-side only). */
export function persistLocaleCookie(locale: Locale): void {
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
