import { en } from '@presentation/i18n/en';
import type { Translations } from '@presentation/i18n/translations';
import { tr } from '@presentation/i18n/tr';
import { getLocaleService } from '@application/i18n/get-locale-service';

const translations: Record<string, Translations> = { en, tr };

/**
 * Presentation-side view of the app's language. The state itself lives in the
 * application-layer `LocaleService` — the single source of truth it shares with
 * the `Accept-Language` header — so what the user reads and what the backend is
 * asked for can never drift apart.
 */
export const t = (): Translations => {
  return translations[getLocaleService().getLocale()] ?? en;
};

/**
 * Restores the persisted language choice. Awaited during bootstrap before the
 * first request goes out, so a saved preference always beats the device
 * language seed.
 */
export const hydrateLocale = (): Promise<void> => getLocaleService().hydrate();

/** Switches the active locale and persists the choice across app restarts. */
export const setLocale = (lang: string): void => {
  getLocaleService().setLocale(lang);
};

export const getLocale = (): string => getLocaleService().getLocale();

/** Subscribes to locale changes (for `useSyncExternalStore`). */
export const subscribeLocale = (listener: () => void): (() => void) =>
  getLocaleService().subscribe(listener);

/** Current locale snapshot (for `useSyncExternalStore`). */
export const getLocaleSnapshot = (): string => getLocaleService().getLocale();
