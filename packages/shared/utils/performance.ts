/**
 * packages/shared/utils/performance.ts
 * Performance monitoring and optimization utilities for the consumer app
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
  category: 'triage' | 'provider' | 'location' | 'cache' | 'analytics';
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  /**
   * Start timing a metric
   */
  start(name: string, category: PerformanceMetric['category'], metadata?: Record<string, any>) {
    const key = `${category}_${name}`;
    this.timers.set(key, performance.now());
  }

  /**
   * End timing and record metric
   */
  end(name: string, category: PerformanceMetric['category'], metadata?: Record<string, any>): PerformanceMetric | null {
    const key = `${category}_${name}`;
    const startTime = this.timers.get(key);

    if (!startTime) {
      console.warn(`Performance timer "${key}" was not started`);
      return null;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      startTime,
      duration,
      category,
      metadata,
    };

    this.metrics.push(metric);
    this.timers.delete(key);

    // Log slow operations
    if (this.isSlowOperation(category, duration)) {
      console.warn(`⚠️ Slow operation detected: ${category}/${name} took ${duration.toFixed(2)}ms`);
    }

    return metric;
  }

  /**
   * Check if operation exceeded performance threshold
   */
  private isSlowOperation(category: string, duration: number): boolean {
    const thresholds: Record<string, number> = {
      triage: 2000, // 2 seconds
      provider: 3000, // 3 seconds
      location: 5000, // 5 seconds
      cache: 500, // 0.5 seconds
      analytics: 1000, // 1 second
    };

    return duration > (thresholds[category] || 5000);
  }

  /**
   * Get all metrics for a category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get average duration for metrics
   */
  getAverageDuration(category: PerformanceMetric['category']): number {
    const categoryMetrics = this.getMetricsByCategory(category);
    if (categoryMetrics.length === 0) return 0;

    const total = categoryMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / categoryMetrics.length;
  }

  /**
   * Report performance summary
   */
  reportSummary(): void {
    console.group('📊 Performance Summary');

    const categories = Array.from(new Set(this.metrics.map(m => m.category)));

    categories.forEach(category => {
      const metrics = this.getMetricsByCategory(category);
      const avgDuration = this.getAverageDuration(category);
      const slowCount = metrics.filter(m => this.isSlowOperation(category, m.duration || 0)).length;

      console.log(
        `${category.toUpperCase()}: ${metrics.length} operations, avg ${avgDuration.toFixed(2)}ms, ${slowCount} slow`
      );
    });

    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance tracking
 */
import { useEffect, useRef } from 'react';

export const usePerformanceTracking = (name: string, category: PerformanceMetric['category']) => {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const duration = performance.now() - startTimeRef.current;
      performanceMonitor.end(name, category, { component: name });
    };
  }, [name, category]);
};

/**
 * Debounced function for API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Memoize expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Request idle callback polyfill
 */
export const scheduleIdleCallback = (callback: () => void, timeout?: number) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    // Fallback to setTimeout
    setTimeout(callback, timeout || 0);
  }
};

/**
 * Batch state updates for React 18+
 */
import { flushSync } from 'react-dom';

export const batchStateUpdates = (updates: (() => void)[]) => {
  updates.forEach(update => {
    if (typeof flushSync !== 'undefined') {
      flushSync(update);
    } else {
      update();
    }
  });
};
