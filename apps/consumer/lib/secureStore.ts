import * as SecureStore from 'expo-secure-store';

export const secureStore = {
  /**
   * Set a value in secure storage
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (e) {
      console.error(`SecureStore error setting ${key}:`, e);
    }
  },

  /**
   * Get a value from secure storage
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (e) {
      console.error(`SecureStore error getting ${key}:`, e);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error(`SecureStore error removing ${key}:`, e);
    }
  },

  /**
   * Clear multiple specific keys (e.g. for account deletion)
   */
  async clear(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.removeItem(key);
    }
  }
};
