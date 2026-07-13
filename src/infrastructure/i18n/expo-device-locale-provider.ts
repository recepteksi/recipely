import { getLocales } from 'expo-localization';
import type { IDeviceLocaleProvider } from '@domain/i18n/i-device-locale-provider';

/**
 * Reads the device's preferred language via `expo-localization`. The value is
 * returned raw (empty string when the platform reports none) — narrowing it to
 * a language the app actually ships is `LocaleService`'s job, so the supported
 * set stays defined in exactly one place.
 */
export class ExpoDeviceLocaleProvider implements IDeviceLocaleProvider {
  getDeviceLocale(): string {
    return getLocales()[0]?.languageCode ?? '';
  }
}
