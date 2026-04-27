# Performance Optimization Guide

## Overview

This guide explains the performance optimization utilities and best practices for the Travel Health Bridge application.

## Key Components

### 1. Performance Monitor (`packages/shared/utils/performance.ts`)

Provides real-time performance tracking and bottleneck detection.

```typescript
import { performanceMonitor } from '@travelhealthbridge/shared';

// Track a operation
performanceMonitor.start('rankProviders', 'triage', { providersCount: 50 });
// ... do work ...
performanceMonitor.end('rankProviders', 'triage');

// Get metrics
const triageMetrics = performanceMonitor.getMetricsByCategory('triage');
const avgDuration = performanceMonitor.getAverageDuration('triage');

// Report summary
performanceMonitor.reportSummary();
```

**Categories:**
- `triage`: Symptom collection and provider ranking
- `provider`: Provider operations (availability, profile updates)
- `location`: GPS and location services
- `cache`: Cache operations and invalidation
- `analytics`: Analytics event tracking

### 2. Optimized Provider Ranking (`rankProvidersOptimized`)

Memoized version of the 17-factor ranking algorithm with automatic caching.

```typescript
import { rankProvidersOptimized, clearRankingCache } from '@travelhealthbridge/shared';

// First call: computes ranking, caches result
const result1 = rankProvidersOptimized({
  providers,
  userLanguages: ['English'],
  urgency: 'urgent',
  budget: 500,
  lat, lng,
});

// Second call with identical inputs: returns cached result instantly
const result2 = rankProvidersOptimized({
  providers,
  userLanguages: ['English'],
  urgency: 'urgent',
  budget: 500,
  lat, lng,
});

// Clear cache when filters significantly change
clearRankingCache();
```

**Cache Behavior:**
- 5-minute cache TTL (time to live)
- LRU eviction when cache reaches 50 entries
- Automatic cleanup on cache miss

### 3. Triage Optimizations (`triageOptimizations.ts`)

High-level orchestration of triage flow with performance SLA validation.

```typescript
import { submitTriageOptimized, getTriagePerformanceReport } from 'apps/consumer/app/triage/triageOptimizations';

// Submit triage with automatic ranking and timing
const ranking = await submitTriageOptimized({
  symptoms,
  languages,
  urgency,
  budget,
  lat, lng,
  providers,
});

// Get performance report
const report = getTriagePerformanceReport();
console.log(`Average triage: ${report.averageDuration.toFixed(2)}ms`);
```

**Performance Targets:**
- Symptom load: 300ms
- Triage submit: 1500ms
- Ranking display: 500ms
- Emergency flow: 2000ms

## Best Practices

### 1. Use Memoized Ranking in Triage

Always use `rankProvidersOptimized` instead of `rankProviders` in the triage flow:

```typescript
// ✅ Good - uses cache
const result = rankProvidersOptimized(input);

// ❌ Avoid - no caching
const result = rankProviders(input);
```

### 2. Preload Data During Idle Time

Use `scheduleIdleCallback` to preload common ranking combinations:

```typescript
import { scheduleIdleCallback, precomputeRankings } from '@travelhealthbridge/shared';

// Schedule preload during idle time
scheduleIdleCallback(() => {
  precomputeRankings([
    { providers, userLanguages: ['English'], urgency: 'can_wait', budget: 500 },
    { providers, userLanguages: ['Hindi'], urgency: 'urgent', budget: 1000 },
  ]);
});
```

### 3. Batch Similar Operations

When processing multiple requests, batch them together:

```typescript
import { batchTriageOptimized } from 'apps/consumer/app/triage/triageOptimizations';

// Process multiple triages efficiently
const results = await batchTriageOptimized(
  [
    { symptoms: ['fever'], languages: ['English'], urgency: 'urgent', budget: 500 },
    { symptoms: ['cough'], languages: ['Hindi'], urgency: 'can_wait', budget: 300 },
  ],
  providers
);
```

### 4. Debounce User Input

Use `debounce` for frequently-triggered operations like search:

```typescript
import { debounce } from '@travelhealthbridge/shared';

const debouncedSearch = debounce((query) => {
  rankProvidersOptimized({ ...input, /* search-specific filters */ });
}, 300); // Wait 300ms after user stops typing

input.addEventListener('change', (e) => debouncedSearch(e.target.value));
```

### 5. Monitor Performance in Components

Use `usePerformanceTracking` hook for component-level insights:

```typescript
import { usePerformanceTracking } from '@travelhealthbridge/shared';

export function TriageForm() {
  usePerformanceTracking('TriageForm', 'triage');
  
  return <form>{/* form UI */}</form>;
}
```

### 6. Validate SLAs in Tests

Include performance validation in your test suite:

```typescript
import { validatePerformanceSLAs, getTriagePerformanceReport } from 'apps/consumer/app/triage/triageOptimizations';

test('triage meets performance SLA', () => {
  submitTriageOptimized(input);
  
  const isValid = validatePerformanceSLAs();
  expect(isValid).toBe(true);
  
  const report = getTriagePerformanceReport();
  console.log(report); // Debug slow operations
});
```

## Performance Metrics

### Current Baselines (from Phase 1)

- **Provider ranking**: ~50-200ms (with 100-200 providers)
- **Emergency triage**: <1 second
- **Provider PWA toggle**: <1 second
- **Feedback aggregation**: ~1-2 seconds

### Target SLAs

- **Triage submission**: <1.5 seconds
- **Emergency response**: <2 seconds
- **Symptom rendering**: <300ms
- **Cache operations**: <500ms

## Troubleshooting

### Performance Regression

1. Enable performance reporting:
```typescript
performanceMonitor.reportSummary();
```

2. Check for cache invalidation issues:
```typescript
const stats = getRankingCacheStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
```

3. Profile specific operations:
```typescript
const metrics = performanceMonitor.getMetricsByCategory('triage');
const slow = metrics.filter(m => m.duration > 1000);
slow.forEach(m => console.log(`${m.name}: ${m.duration}ms`));
```

### Memory Issues

- Clear cache periodically: `clearRankingCache()`
- Monitor cache growth: `getRankingCacheStats()`
- Use batch operations to reduce allocations

## Future Improvements

1. **Service Worker Caching**: Cache rankings in SW for offline support
2. **IndexedDB**: Store rankings in IndexedDB for larger datasets
3. **Web Workers**: Move ranking computation to worker thread
4. **Server-Side Caching**: Cache rankings on backend
5. **Incremental Ranking**: Update scores incrementally instead of full recomputation

## References

- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- [React Performance](https://react.dev/reference/react/useMemo)
