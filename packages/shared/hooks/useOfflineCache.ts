/**
 * packages/shared/hooks/useOfflineCache.ts
 * Hook for managing offline provider cache with WatermelonDB
 */

import { useEffect, useState } from 'react';
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
 * Manages local offline cache of providers for specific city/symptom/urgency combinations
 */
export const useOfflineCache = () => {
  const [cacheReady, setCacheReady] = useState(false);

  // Get cached providers for a specific query
  const getCachedProviders = async (
    cityId: string,
    symptom: string,
    urgency: string
  ): Promise<Provider[] | null> => {
    try {
      // In production, this would query WatermelonDB
      // For now, return null to use live API
      return null;
    } catch (err) {
      console.error('Error getting cached providers:', err);
      return null;
    }
  };

  // Save providers to offline cache
  const cacheProviders = async (
    cityId: string,
    symptom: string,
    urgency: string,
    providers: Provider[]
  ): Promise<boolean> => {
    try {
      // In production, save to WatermelonDB with metadata
      // For MVP, use localStorage with expiration
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
    } catch (err) {
      console.error('Error caching providers:', err);
      return false;
    }
  };

  // Check if cache is still valid (within 24 hours)
  const isCacheValid = (timestamp: number): boolean => {
    const cacheAge = Date.now() - timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return cacheAge < twentyFourHours;
  };

  // Clear old caches
  const clearExpiredCache = async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('thb_cache_')) {
            const cache = JSON.parse(localStorage.getItem(key) || '{}') as OfflineCache;
            if (!isCacheValid(cache.timestamp)) {
              localStorage.removeItem(key);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error clearing expired cache:', err);
    }
  };

  useEffect(() => {
    // Clear expired caches on app load
    clearExpiredCache().then(() => setCacheReady(true));
  }, []);

  return {
    cacheReady,
    getCachedProviders,
    cacheProviders,
    clearExpiredCache,
  };
};
