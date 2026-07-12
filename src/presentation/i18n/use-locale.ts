import { useSyncExternalStore } from 'react';
import { subscribeLocale, getLocaleSnapshot } from '@presentation/i18n/i18n';

/**
 * Subscribes the calling component to locale changes so its `t()` strings (and
 * any locale-dependent data effects) refresh when the user switches language.
 * Returns the active locale code.
 */
export const useLocale = (): string =>
  useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleSnapshot);
