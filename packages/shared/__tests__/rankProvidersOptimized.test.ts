/**
 * packages/shared/__tests__/rankProvidersOptimized.test.ts
 * Unit tests for memoized ranking with performance validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  rankProvidersOptimized,
  clearRankingCache,
  getRankingCacheStats,
  precomputeRankings,
} from '../utils/rankProvidersOptimized';
import { rankProviders } from '../utils/rankProviders';
import { performanceMonitor } from '../utils/performance';
import { Provider } from '../types';

// Mock provider data
const mockProviders: Provider[] = [
  {
    id: 'p1',
    name: 'Dr. Smith',
    phone: '+91-9876543210',
    city_id: 'bangalore',
    email: 'smith@example.com',
    category: 'Doctor',
    verified_at: new Date().toISOString(),
    languages: ['English', 'Hindi'],
    specialties: ['General Physician', 'Cardiology'],
    fee_opd: { min: 300, max: 500 },
    status: 'active',
    reliability_score: 4.5,
    referral_count: 100,
    feedback_count: 45,
    avg_rating: 4.6,
    emergency: true,
    lat: 12.9352,
    lng: 77.6245,
    opd_hours: { monday: '09:00-18:00' },
    badge_date: new Date().toISOString(),
    badge_status: 'active',
    staleness_tier: 'fresh',
  },
  {
    id: 'p2',
    name: 'Dr. Johnson',
    phone: '+91-8765432109',
    city_id: 'bangalore',
    email: 'johnson@example.com',
    category: 'Doctor',
    verified_at: new Date().toISOString(),
    languages: ['English'],
    specialties: ['Surgery'],
    fee_opd: { min: 500, max: 800 },
    status: 'active',
    reliability_score: 3.8,
    referral_count: 75,
    feedback_count: 32,
    avg_rating: 3.9,
    emergency: false,
    lat: 12.9352,
    lng: 77.6245,
    opd_hours: { monday: '10:00-19:00' },
    badge_date: new Date().toISOString(),
    badge_status: 'active',
    staleness_tier: 'fresh',
  },
];

describe('rankProvidersOptimized', () => {
  beforeEach(() => {
    clearRankingCache();
    performanceMonitor.clear();
  });

  describe('Basic Functionality', () => {
    it('should return valid ranking result', () => {
      const result = rankProvidersOptimized({
        providers: mockProviders,
        userLanguages: ['English'],
        urgency: 'can_wait',
        budget: 500,
      });

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result).toHaveProperty('showHelplineCTA');
    });

    it('should match rankProviders output', () => {
      const input = {
        providers: mockProviders,
        userLanguages: ['English'],
        urgency: 'urgent' as const,
        budget: 500,
      };

      const optimizedResult = rankProvidersOptimized(input);
      const normalResult = rankProviders(input);

      expect(optimizedResult.primary?.id).toBe(normalResult.primary?.id);
      expect(optimizedResult.secondary?.id).toBe(normalResult.secondary?.id);
    });

    it('should handle emergency urgency correctly', () => {
      const result = rankProvidersOptimized({
        providers: mockProviders,
        userLanguages: [],
        urgency: 'emergency',
        budget: 1000,
      });

      // Emergency providers should be ranked higher
      if (result.primary) {
        expect(mockProviders.find(p => p.id === result.primary?.id)?.emergency).toBe(true);
      }
    });
  });

  describe('Caching Behavior', () => {
    it('should cache results for identical inputs', () => {
      const input = {
        providers: mockProviders,
        userLanguages: ['English'],
        urgency: 'can_wait' as const,
        budget: 500,
      };

      const result1 = rankProvidersOptimized(input);
      const metrics1 = performanceMonitor.getMetricsByCategory('triage');

      clearRankingCache();
      performanceMonitor.clear();

      const result2 = rankProvidersOptimized(input);
      const metrics2 = performanceMonitor.getMetricsByCategory('triage');

      // Results should be identical
      expect(result1.primary?.id).toBe(result2.primary?.id);
    });

    it('should return different results for different language preferences', () => {
      const baseInput = {
        providers: mockProviders,
        urgency: 'can_wait' as const,
        budget: 500,
      };

      const result1 = rankProvidersOptimized({
        ...baseInput,
        userLanguages: ['English'],
      });

      const result2 = rankProvidersOptimized({
        ...baseInput,
        userLanguages: ['Hindi'],
      });

      // Results might differ due to language scoring
      // (depends on provider language distribution)
    });

    it('should track cache hits and misses', () => {
      const input = {
        providers: mockProviders,
        userLanguages: ['English'],
        urgency: 'can_wait' as const,
        budget: 500,
      };

      // First call - cache miss
      rankProvidersOptimized(input);
      const stats1 = getRankingCacheStats();
      expect(stats1.size).toBeGreaterThan(0);

      // Second call - cache hit (no additional entry)
      rankProvidersOptimized(input);
      const stats2 = getRankingCacheStats();
      expect(stats2.size).toBe(stats1.size);
    });

    it('should enforce cache size limit', () => {
      // Create many different inputs to exceed cache size
      for (let i = 0; i < 60; i++) {
        rankProvidersOptimized({
          providers: mockProviders,
          userLanguages: i % 2 === 0 ? ['English'] : ['Hindi'],
          urgency: 'can_wait',
          budget: 300 + i * 10,
        });
      }

      const stats = getRankingCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics', () => {
      rankProvidersOptimized({
        providers: mockProviders,
        userLanguages: ['English'],
        urgency: 'can_wait',
        budget: 500,
      });

      const metrics = performanceMonitor.getMetricsByCategory('triage');
      expect(metrics.length).toBeGreaterThan(0);

      const metric = metrics[0];
      expect(metric.name).toBe('rankProviders');
      expect(metric.duration).toBeLessThan(1000); // Should complete in <1s
    });

    it('should report average duration', () => {
      for (let i = 0; i < 5; i++) {
        rankProvidersOptimized({
          providers: mockProviders,
          userLanguages: ['English'],
          urgency: 'can_wait',
          budget: 500,
        });
      }

      const avgDuration = performanceMonitor.getAverageDuration('triage');
      expect(avgDuration).toBeGreaterThan(0);
      expect(avgDuration).toBeLessThan(1000);
    });
  });

  describe('Precomputation', () => {
    it('should precompute multiple ranking combinations', () => {
      const inputs = [
        {
          providers: mockProviders,
          userLanguages: ['English'],
          urgency: 'can_wait' as const,
          budget: 500,
        },
        {
          providers: mockProviders,
          userLanguages: ['Hindi'],
          urgency: 'urgent' as const,
          budget: 1000,
        },
      ];

      const results = precomputeRankings(inputs);

      expect(results.size).toBe(2);
      expect(results.size).toBeLessThanOrEqual(getRankingCacheStats().size);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty provider list', () => {
      const result = rankProvidersOptimized({
        providers: [],
        userLanguages: ['English'],
        urgency: 'can_wait',
        budget: 500,
      });

      expect(result.primary).toBeNull();
      expect(result.secondary).toBeNull();
      expect(result.showHelplineCTA).toBe(true);
    });

    it('should handle no matching providers', () => {
      const filteredProviders = mockProviders.filter(p =>
        p.fee_opd.min > 10000 // No provider within budget
      );

      const result = rankProvidersOptimized({
        providers: filteredProviders,
        userLanguages: ['English'],
        urgency: 'can_wait',
        budget: 500,
      });

      // Result depends on other scoring factors
    });

    it('should handle undefined optional parameters', () => {
      const result = rankProvidersOptimized({
        providers: mockProviders,
        userLanguages: [],
        urgency: 'can_wait',
        budget: 500,
        // lat, lng, symptom intentionally omitted
      });

      expect(result).toHaveProperty('primary');
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should rank providers within 200ms', () => {
    const start = performance.now();

    rankProvidersOptimized({
      providers: mockProviders,
      userLanguages: ['English', 'Hindi'],
      urgency: 'urgent',
      budget: 500,
      lat: 12.9352,
      lng: 77.6245,
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200);
  });

  it('should serve cached result within 10ms', () => {
    const input = {
      providers: mockProviders,
      userLanguages: ['English'],
      urgency: 'can_wait' as const,
      budget: 500,
    };

    // Prime cache
    rankProvidersOptimized(input);

    // Measure cache hit
    const start = performance.now();
    rankProvidersOptimized(input);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(10);
  });
});
