import type { Locale } from "src/store/types";
import type { TranslationKey, TranslationStrings } from "src/i18n/types";
import { en } from "src/i18n/locales/en";

const locales: Record<Locale, TranslationStrings> = {
  en,
  fr: en,
  de: en,
  ru: en,
  es: en,
  zh: en,
  pl: en,
};

export function t(key: TranslationKey, locale: Locale = "en"): string {
  return locales[locale][key];
}

export function registerLocale(
  locale: Locale,
  strings: TranslationStrings,
): void {
  locales[locale] = strings;
}
