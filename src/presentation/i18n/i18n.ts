import { en } from '@presentation/i18n/en';
import type { Translations } from '@presentation/i18n/translations';
import { tr } from '@presentation/i18n/tr';
import { getLocales } from 'expo-localization';
import { getKeyValueStore } from '@application/storage/get-key-value-store';
import { LANGUAGE_STORAGE_KEY } from '@infrastructure/constants/storage';

const translations: Record<string, Translations> = { en, tr };

let currentLang: string = 'en';

const listeners = new Set<() => void>();

const notify = (): void => {
  for (const listener of listeners) listener();
};

/** Applies a locale to the in-memory state and (optionally) persists it. */
const applyLocale = (lang: string, persist: boolean): void => {
  if (!(lang in translations) || lang === currentLang) return;
  currentLang = lang;
  if (persist) {
    void getKeyValueStore().setItem(LANGUAGE_STORAGE_KEY, lang);
  }
  notify();
};

/** Seeds the locale from the device language for the first synchronous render. */
export const initLocale = (): void => {
  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'en';
  currentLang = deviceLang in translations ? deviceLang : 'en';
};

/**
 * Restores the persisted locale (if any). Async so it can read storage; call
 * once during bootstrap after {@link initLocale}. Falls back to the device
 * default already seeded by {@link initLocale} when nothing is stored.
 */
export const hydrateLocale = async (): Promise<void> => {
  const stored = await getKeyValueStore().getItem(LANGUAGE_STORAGE_KEY);
  if (stored && stored in translations) {
    applyLocale(stored, false);
  }
};

export const t = (): Translations => {
  return translations[currentLang] ?? en;
};

/** Switches the active locale and persists the choice across app restarts. */
export const setLocale = (lang: string): void => {
  applyLocale(lang, true);
};

export const getLocale = (): string => currentLang;

/** Subscribes to locale changes (for `useSyncExternalStore`). */
export const subscribeLocale = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Current locale snapshot (for `useSyncExternalStore`). */
export const getLocaleSnapshot = (): string => currentLang;
