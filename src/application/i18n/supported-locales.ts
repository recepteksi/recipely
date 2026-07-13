/** Language codes the app ships translations for. Keep in sync with `@presentation/i18n`. */
export const SUPPORTED_LOCALES: readonly string[] = ['en', 'tr'];

/** Locale used when neither a stored preference nor the device language is supported. */
export const DEFAULT_LOCALE = 'en';

/**
 * Narrows an arbitrary language code (a device locale, a stored value) to a
 * supported one, falling back to {@link DEFAULT_LOCALE}. Region subtags are
 * dropped, so `tr-TR` resolves to `tr`.
 */
export const toSupportedLocale = (locale: string | null | undefined): string => {
  const languageCode = (locale ?? '').trim().toLowerCase().split('-')[0] ?? '';
  return SUPPORTED_LOCALES.includes(languageCode) ? languageCode : DEFAULT_LOCALE;
};
