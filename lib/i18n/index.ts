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
