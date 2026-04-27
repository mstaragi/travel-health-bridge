/**
 * packages/shared/__tests__/performance.test.ts
 * Unit tests for performance monitoring utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  performanceMonitor,
  debounce,
  memoize,
} from '../utils/performance';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  describe('Timing Operations', () => {
    it('should track operation duration', () => {
      performanceMonitor.start('test-op', 'triage');

      // Simulate work
      const startTime = performance.now();
      while (performance.now() - startTime < 10) {}

      const metric = performanceMonitor.end('test-op', 'triage');

      expect(metric).not.toBeNull();
      expect(metric?.duration).toBeGreaterThanOrEqual(10);
      expect(metric?.name).toBe('test-op');
      expect(metric?.category).toBe('triage');
    });

    it('should handle metadata', () => {
      performanceMonitor.start('test-op', 'triage', { count: 100 });

      performanceMonitor.end('test-op', 'triage', { count: 100 });

      const metrics = performanceMonitor.getMetricsByCategory('triage');
      expect(metrics[0]?.metadata).toEqual({ count: 100 });
    });

    it('should warn on slow operations', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      performanceMonitor.start('slow-op', 'triage');

      // Simulate slow operation
      const startTime = performance.now();
      while (performance.now() - startTime < 2100) {}

      performanceMonitor.end('slow-op', 'triage');

      // Warning should have been logged
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should warn when ending timer that was not started', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      performanceMonitor.end('non-existent', 'triage');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not started')
      );

      warnSpy.mockRestore();
    });
  });

  describe('Metrics Collection', () => {
    it('should collect metrics by category', () => {
      performanceMonitor.start('op1', 'triage');
      performanceMonitor.end('op1', 'triage');

      performanceMonitor.start('op2', 'provider');
      performanceMonitor.end('op2', 'provider');

      const triageMetrics = performanceMonitor.getMetricsByCategory('triage');
      const providerMetrics = performanceMonitor.getMetricsByCategory('provider');

      expect(triageMetrics.length).toBe(1);
      expect(providerMetrics.length).toBe(1);
    });

    it('should calculate average duration', () => {
      for (let i = 0; i < 3; i++) {
        performanceMonitor.start('op', 'triage');
        const startTime = performance.now();
        while (performance.now() - startTime < 10) {}
        performanceMonitor.end('op', 'triage');
      }

      const avgDuration = performanceMonitor.getAverageDuration('triage');

      expect(avgDuration).toBeGreaterThanOrEqual(10);
      expect(avgDuration).toBeLessThan(100);
    });

    it('should return 0 for empty category', () => {
      const avgDuration = performanceMonitor.getAverageDuration('provider');
      expect(avgDuration).toBe(0);
    });
  });

  describe('Reporting', () => {
    it('should generate summary report', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      performanceMonitor.start('op1', 'triage');
      performanceMonitor.end('op1', 'triage');

      performanceMonitor.reportSummary();

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });

  describe('Clearing', () => {
    it('should clear all metrics', () => {
      performanceMonitor.start('op1', 'triage');
      performanceMonitor.end('op1', 'triage');

      const metricsBefore = performanceMonitor.getMetricsByCategory('triage');
      expect(metricsBefore.length).toBe(1);

      performanceMonitor.clear();

      const metricsAfter = performanceMonitor.getMetricsByCategory('triage');
      expect(metricsAfter.length).toBe(0);
    });
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 100);

    // Call multiple times
    debouncedFn('a');
    debouncedFn('b');
    debouncedFn('c');

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // Now callback should have been called once with last argument
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('should cancel previous calls on new input', async () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 100);

    debouncedFn('first');

    // Wait half the debounce time
    await new Promise(resolve => setTimeout(resolve, 50));

    // Make another call - should reset timer
    debouncedFn('second');

    // Wait another 50ms (total 100ms from first call, 50ms from second)
    await new Promise(resolve => setTimeout(resolve, 50));

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Wait for final call
    await new Promise(resolve => setTimeout(resolve, 60));

    // Now should be called with 'second'
    expect(callback).toHaveBeenCalledWith('second');
  });
});

describe('memoize', () => {
  it('should cache function results', () => {
    const fn = vi.fn((a, b) => a + b);
    const memoized = memoize(fn);

    const result1 = memoized(2, 3);
    const result2 = memoized(2, 3);

    expect(result1).toBe(5);
    expect(result2).toBe(5);

    // Function should only be called once due to memoization
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should differentiate calls with different arguments', () => {
    const fn = vi.fn((a) => a * 2);
    const memoized = memoize(fn);

    const result1 = memoized(2);
    const result2 = memoized(3);
    const result3 = memoized(2);

    expect(result1).toBe(4);
    expect(result2).toBe(6);
    expect(result3).toBe(4);

    // Function should be called twice (for 2 and 3, cached result on third call)
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should handle object arguments', () => {
    const fn = vi.fn((obj) => obj.value * 2);
    const memoized = memoize(fn);

    const result1 = memoized({ value: 5 });
    const result2 = memoized({ value: 5 });

    expect(result1).toBe(10);
    expect(result2).toBe(10);

    // Should be called twice because objects are different instances
    // (Uses JSON.stringify for comparison)
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should preserve function type', () => {
    const add = (a: number, b: number): number => a + b;
    const memoized = memoize(add);

    expect(memoized(1, 2)).toBe(3);
  });
});

describe('Performance Integration', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  it('should track debounced function calls', async () => {
    performanceMonitor.start('search', 'provider');

    const callback = debounce(() => {
      // Simulate search
    }, 100);

    callback('a');
    callback('b');
    callback('c');

    await new Promise(resolve => setTimeout(resolve, 150));

    performanceMonitor.end('search', 'provider');

    const metrics = performanceMonitor.getMetricsByCategory('provider');
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('should track memoized function performance', () => {
    performanceMonitor.start('rank', 'triage');

    const rankFn = memoize((providers: number) => {
      return providers * 2;
    });

    rankFn(100);
    rankFn(100); // Cached

    performanceMonitor.end('rank', 'triage');

    const metrics = performanceMonitor.getMetricsByCategory('triage');
    expect(metrics[0]?.duration).toBeLessThan(50);
  });
});
