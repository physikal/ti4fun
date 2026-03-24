import type { TranslationKey, TranslationStrings } from "src/i18n/types";
import { en } from "src/i18n/locales/en";

const strings: TranslationStrings = en;

export function t(key: TranslationKey): string {
  return strings[key];
}
