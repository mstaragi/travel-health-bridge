/**
 * packages/shared/hooks/useOfflineCache.ts
 * Hook for managing offline provider cache with WatermelonDB (native) and localStorage (web)
 * Implements proper 24-hour cache expiry and platform-specific persistence
 */

import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Provider } from '@travelhealthbridge/shared/types';

interface OfflineCache {
  city: string;
  symptom: string;
  urgency: string;
  providers: Provider[];
  timestamp: number;
}

/**
 * useOfflineCache
 * Manages local offline cache of providers with intelligent fallback
 * - Native (iOS/Android): Uses WatermelonDB for efficient local persistence
 * - Web: Uses localStorage as fallback
 * - Automatic 24-hour cache expiry and cleanup
 */
export const useOfflineCache = () => {
  const [cacheReady, setCacheReady] = useState(false);
  const [database, setDatabase] = useState<any>(null);

  // Initialize WatermelonDB on native platforms
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initializeDatabase();
    } else {
      setCacheReady(true);
    }
  }, []);

  const initializeDatabase = async () => {
    try {
      // Dynamically import WatermelonDB for native platforms only
      if (Platform.OS !== 'web') {
        const { database } = await import('../../db');
        setDatabase(database);
      }
      setCacheReady(true);
    } catch (err) {
      console.warn('WatermelonDB initialization failed, falling back to localStorage:', err);
      setCacheReady(true);
    }
  };

  // Get cached providers for a specific query
  const getCachedProviders = useCallback(
    async (cityId: string, symptom: string, urgency: string): Promise<Provider[] | null> => {
      try {
        if (Platform.OS !== 'web' && database) {
          // Try WatermelonDB first (native platforms)
          const cacheKey = `${cityId}_${symptom}_${urgency}`;
          const offlineProviderRecords = await database.collections
            .get('offline_providers')
            .query()
            .fetch();

          for (const record of offlineProviderRecords) {
            if (
              record.city === cityId &&
              isCacheValid(record.lastSyncedAt)
            ) {
              try {
                const providers = JSON.parse(record.dataJson);
                return providers;
              } catch (err) {
                console.error('Error parsing WatermelonDB cache:', err);
              }
            }
          }
        } else {
          // Fallback to localStorage (web or if WatermelonDB unavailable)
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(`thb_cache_${cityId}_${symptom}_${urgency}`);
            if (cached) {
              const cache = JSON.parse(cached) as OfflineCache;
              if (isCacheValid(cache.timestamp)) {
                return cache.providers;
              }
            }
          }
        }
        return null;
      } catch (err) {
        console.error('Error getting cached providers:', err);
        return null;
      }
    },
    [database]
  );

  // Save providers to offline cache
  const cacheProviders = useCallback(
    async (
      cityId: string,
      symptom: string,
      urgency: string,
      providers: Provider[]
    ): Promise<boolean> => {
      try {
        if (Platform.OS !== 'web' && database) {
          // Use WatermelonDB for native platforms
          const collection = database.collections.get('offline_providers');
          await database.write(async () => {
            await collection.create((record: any) => {
              record.city = cityId;
              record.dataJson = JSON.stringify(providers);
              record.lastSyncedAt = Date.now();
            });
          });
          return true;
        } else {
          // Fallback to localStorage
          const cache: OfflineCache = {
            city: cityId,
            symptom,
            urgency,
            providers,
            timestamp: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `thb_cache_${cityId}_${symptom}_${urgency}`,
              JSON.stringify(cache)
            );
          }
          return true;
        }
      } catch (err) {
        console.error('Error caching providers:', err);
        return false;
      }
    },
    [database]
  );

  // Check if cache is still valid (within 24 hours)
  const isCacheValid = (timestamp: number): boolean => {
    const cacheAge = Date.now() - timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return cacheAge < twentyFourHours;
  };

  // Clear old caches (24-hour expiry)
  const clearExpiredCache = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS !== 'web' && database) {
        // Clear expired entries from WatermelonDB
        const collection = database.collections.get('offline_providers');
        const allRecords = await collection.query().fetch();

        await database.write(async () => {
          for (const record of allRecords) {
            if (!isCacheValid(record.lastSyncedAt)) {
              await record.destroyPermanently();
            }
          }
        });
      } else {
        // Clear expired entries from localStorage
        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage);
          keys.forEach((key) => {
            if (key.startsWith('thb_cache_')) {
              try {
                const cache = JSON.parse(localStorage.getItem(key) || '{}') as OfflineCache;
                if (!isCacheValid(cache.timestamp)) {
                  localStorage.removeItem(key);
                }
              } catch (err) {
                // Invalid cache entry, remove it
                localStorage.removeItem(key);
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('Error clearing expired cache:', err);
    }
  }, [database]);

  return {
    cacheReady,
    getCachedProviders,
    cacheProviders,
    clearExpiredCache,
  };
};
