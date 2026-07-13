import type { IDeviceLocaleProvider } from '@domain/i18n/i-device-locale-provider';
import type { IKeyValueStore } from '@domain/storage/i-key-value-store';
import { toSupportedLocale } from '@application/i18n/supported-locales';
import { LANGUAGE_STORAGE_KEY } from '@infrastructure/constants/storage';

/**
 * The single source of truth for the app's active language.
 *
 * Everything that needs a locale reads it from here: the UI translations, the
 * localized create/update payloads, and — through the HTTP client's
 * `localeProvider` — the `Accept-Language` header on every request. Nothing
 * else may read the device language or keep its own copy, otherwise a language
 * switch can leave one of them stale (the bug this class exists to prevent).
 *
 * Precedence is strictly: stored user choice > device language > default. The
 * device language is a synchronous seed for the first render only; {@link hydrate}
 * must be awaited during bootstrap, before the app issues its first request, so
 * a saved preference can never lose to the device language.
 */
export class LocaleService {
  private current: string;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly store: IKeyValueStore,
    deviceLocaleProvider: IDeviceLocaleProvider,
  ) {
    this.current = toSupportedLocale(deviceLocaleProvider.getDeviceLocale());
  }

  getLocale(): string {
    return this.current;
  }

  /**
   * Restores the persisted language choice, overriding the device seed. Await
   * this before the first network request: until it resolves, the active locale
   * is still the device language.
   */
  async hydrate(): Promise<void> {
    const stored = await this.store.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === null) return;
    this.apply(toSupportedLocale(stored));
  }

  /** Switches the active language and persists it across restarts. */
  setLocale(locale: string): void {
    const next = toSupportedLocale(locale);
    if (!this.apply(next)) return;
    void this.store.setItem(LANGUAGE_STORAGE_KEY, next);
  }

  /** Subscribes to language changes (backs `useSyncExternalStore` in presentation). */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Returns false when the locale is unchanged, so callers can skip persisting. */
  private apply(locale: string): boolean {
    if (locale === this.current) return false;
    this.current = locale;
    for (const listener of this.listeners) listener();
    return true;
  }
}
