import en from "./en.json";
import vi from "./vi.json";

export type Locale = "en" | "vi";

export const locales: Locale[] = ["en", "vi"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, vi };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export type { Translations };

/** Resolve a LocalizedString to a plain string for the given locale (fallback: "en") */
export function localize(
  value: string | Record<string, string> | undefined,
  locale: Locale,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value[locale] ?? value["en"];
}
