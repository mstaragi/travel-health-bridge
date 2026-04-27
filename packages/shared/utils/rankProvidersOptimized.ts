/**
 * packages/shared/utils/rankProvidersOptimized.ts
 * Memoized and optimized version of rankProviders with caching
 * Reduces unnecessary recalculations during triage flow
 */

import { rankProviders } from './rankProviders';
import { Provider, UrgencyLevel, RankProvidersResult } from '../types';
import { performanceMonitor } from './performance';

interface RankInput {
  providers: Provider[];
  userLanguages: string[];
  urgency: UrgencyLevel;
  budget: number;
  lat?: number;
  lng?: number;
  symptom?: string;
  symptomToSpecialty?: Record<string, string[]>;
  availabilityStatuses?: Record<string, 'available' | 'busy'>;
  currentTime?: Date;
}

/**
 * Create cache key from rank input
 * Optimized to avoid JSON.stringify for performance
 */
const createCacheKey = (input: RankInput): string => {
  const components = [
    input.providers.map(p => p.id).join(','),
    input.userLanguages.sort().join(','),
    input.urgency,
    input.budget,
    input.lat?.toFixed(4),
    input.lng?.toFixed(4),
    input.symptom,
  ];
  return components.join('|');
};

class RankingCache {
  private cache = new Map<string, { result: RankProvidersResult; timestamp: number }>();
  private maxAge = 5 * 60 * 1000; // 5 minutes
  private maxSize = 50; // Maximum cached entries

  get(key: string): RankProvidersResult | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  set(key: string, result: RankProvidersResult): void {
    // Simple LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    };
  }
}

const rankingCache = new RankingCache();

/**
 * rankProvidersOptimized
 * Wrapped version of rankProviders with memoization and performance tracking
 */
export function rankProvidersOptimized(input: RankInput): RankProvidersResult {
  performanceMonitor.start('rankProviders', 'triage');

  const cacheKey = createCacheKey(input);
  const cached = rankingCache.get(cacheKey);

  if (cached) {
    const metric = performanceMonitor.end('rankProviders', 'triage', {
      source: 'cache',
      cacheSize: rankingCache.getStats().size,
    });
    return cached;
  }

  // Cache miss - compute ranking
  const result = rankProviders(input);

  rankingCache.set(cacheKey, result);

  performanceMonitor.end('rankProviders', 'triage', {
    source: 'computed',
    providersCount: input.providers.length,
  });

  return result;
}

/**
 * Clear the ranking cache
 * Call this when significant data changes (e.g., user filters changed)
 */
export function clearRankingCache(): void {
  rankingCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getRankingCacheStats() {
  return rankingCache.getStats();
}

/**
 * Precompute rankings for a batch of inputs
 * Useful for background population of cache
 */
export function precomputeRankings(inputs: RankInput[]): Map<string, RankProvidersResult> {
  const results = new Map<string, RankProvidersResult>();

  inputs.forEach(input => {
    const key = createCacheKey(input);
    const result = rankProvidersOptimized(input);
    results.set(key, result);
  });

  return results;
}
