import * as SecureStore from 'expo-secure-store';
import type { IKeyValueStore } from '@domain/storage/i-key-value-store';

export const kvStore: IKeyValueStore = {
  getItem: (key: string): Promise<string | null> =>
    SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> =>
    SecureStore.deleteItemAsync(key),
};
