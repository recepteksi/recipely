import { en, type Translations } from './en';
import { tr } from './tr';
import { getLocales } from 'expo-localization';

const translations: Record<string, Translations> = { en, tr };

let currentLang: string = 'en';

export const initLocale = (): void => {
  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'en';
  currentLang = deviceLang in translations ? deviceLang : 'en';
};

export const t = (): Translations => {
  return translations[currentLang] ?? en;
};

export const setLocale = (lang: string): void => {
  if (lang in translations) {
    currentLang = lang;
  }
};

export const getLocale = (): string => currentLang;
