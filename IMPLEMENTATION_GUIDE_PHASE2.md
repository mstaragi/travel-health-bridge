# Phase 2 Implementation Guide for Developers

## Quick Start: Using Performance Optimizations

### 1. Import the Utilities

```typescript
import {
  rankProvidersOptimized,
  clearRankingCache,
  performanceMonitor,
  debounce,
  memoize,
  usePerformanceTracking,
} from '@travelhealthbridge/shared';
```

### 2. Replace rankProviders with rankProvidersOptimized

**Before (Phase 1):**
```typescript
import { rankProviders } from '@travelhealthbridge/shared';

const result = rankProviders({
  providers,
  userLanguages: ['English'],
  urgency: 'urgent',
  budget: 500,
  lat, lng,
});
```

**After (Phase 2):**
```typescript
import { rankProvidersOptimized } from '@travelhealthbridge/shared';

const result = rankProvidersOptimized({
  providers,
  userLanguages: ['English'],
  urgency: 'urgent',
  budget: 500,
  lat, lng,
});

// That's it! Caching happens automatically.
// Second call with same inputs will be <10ms instead of 50-200ms
```

### 3. Monitor Performance (Optional but Recommended)

```typescript
// Track performance automatically
usePerformanceTracking('MyComponent', 'triage');

// Or manually for specific operations
performanceMonitor.start('myOperation', 'triage');
// ... do work ...
performanceMonitor.end('myOperation', 'triage');

// Get report
const report = performanceMonitor.getMetricsByCategory('triage');
console.log(`Average duration: ${report.reduce((sum, m) => sum + (m.duration || 0), 0) / report.length}ms`);
```

### 4. Debounce Expensive Operations

```typescript
import { debounce } from '@travelhealthbridge/shared';

// Debounce search input (300ms wait after user stops typing)
const debouncedSearch = debounce((query: string) => {
  rankProvidersOptimized({ ...input, budget: parseInt(query) });
}, 300);

// In your input handler
const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  debouncedSearch(e.target.value);
};
```

### 5. Memoize Expensive Computations

```typescript
import { memoize } from '@travelhealthbridge/shared';

// Memoize expensive calculation
const calculateMetrics = memoize((providers: Provider[]) => {
  return {
    totalReferrals: providers.reduce((sum, p) => sum + p.referral_count, 0),
    avgRating: providers.reduce((sum, p) => sum + p.avg_rating, 0) / providers.length,
    // ... other metrics
  };
});

// First call: computes metrics
const metrics1 = calculateMetrics(providers);

// Second call with identical input: returns cached result instantly
const metrics2 = calculateMetrics(providers);
```

### 6. Clear Cache When Needed

```typescript
import { clearRankingCache } from '@travelhealthbridge/shared';

// Clear cache when significant data changes
handleLanguageFilterChange = (newLanguages: string[]) => {
  clearRankingCache(); // New language filter requires fresh ranking
  setLanguages(newLanguages);
};
```

## Pattern: Debounce + Optimize Example

```typescript
'use client';

import React, { useState, useCallback } from 'react';
import { rankProvidersOptimized, debounce, clearRankingCache } from '@travelhealthbridge/shared';

export function BudgetFilter({ providers }) {
  const [budget, setBudget] = useState(500);
  const [results, setResults] = useState(null);

  // Debounce budget changes to avoid re-ranking on every keystroke
  const debouncedRank = useCallback(
    debounce((newBudget: number) => {
      const ranked = rankProvidersOptimized({
        providers,
        urgency: 'can_wait',
        budget: newBudget,
        userLanguages: [],
      });
      setResults(ranked);
    }, 300),
    [providers]
  );

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBudget = Number(e.target.value);
    setBudget(newBudget);
    debouncedRank(newBudget); // Automatically debounced
  };

  return (
    <div>
      <input
        type="range"
        min="100"
        max="2000"
        value={budget}
        onChange={handleBudgetChange}
      />
      <p>Budget: ₹{budget}</p>
      {results && (
        <div>
          <p>Primary: {results.primary?.name}</p>
          <p>Secondary: {results.secondary?.name}</p>
        </div>
      )}
    </div>
  );
}
```

## Pattern: Batch Operations Example

```typescript
import { rankProvidersOptimized } from '@travelhealthbridge/shared';

// Process multiple triage requests efficiently
async function handleMultipleTriages(queries: TriageQuery[], providers: Provider[]) {
  // Load provider data once
  const rankedResults = queries.map(query =>
    rankProvidersOptimized({
      providers,
      userLanguages: query.languages,
      urgency: query.urgency,
      budget: query.budget,
      // ... other params
    })
  );

  // All results use same provider dataset and benefit from caching
  return rankedResults;
}
```

## Testing Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { rankProvidersOptimized, clearRankingCache, performanceMonitor } from '@travelhealthbridge/shared';

describe('Ranking Performance', () => {
  beforeEach(() => {
    clearRankingCache();
    performanceMonitor.clear();
  });

  it('should rank within SLA', async () => {
    const start = performance.now();

    rankProvidersOptimized({
      providers: mockProviders,
      userLanguages: ['English'],
      urgency: 'urgent',
      budget: 500,
      lat, lng,
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1500); // Triage SLA
  });

  it('should cache identical requests', () => {
    const input = {
      providers: mockProviders,
      userLanguages: ['English'],
      urgency: 'urgent',
      budget: 500,
    };

    rankProvidersOptimized(input);
    const metrics1 = performanceMonitor.getMetricsByCategory('triage');

    const result = rankProvidersOptimized(input);
    const metrics2 = performanceMonitor.getMetricsByCategory('triage');

    // Should have 2 operations (one computed, one cached)
    expect(metrics2.length).toBe(2);
    expect(metrics2[1].duration).toBeLessThan(10); // Cache hit
  });
});
```

## Common Mistakes to Avoid

### ❌ Don't: Call rankProviders (non-cached version)
```typescript
// BAD - no caching
const result = rankProviders(input);
const result = rankProviders(input); // Recomputed again
```

### ✅ Do: Use rankProvidersOptimized
```typescript
// GOOD - automatically cached
const result1 = rankProvidersOptimized(input);
const result2 = rankProvidersOptimized(input); // Returns cached instantly
```

---

### ❌ Don't: Repeatedly clear cache
```typescript
// BAD - defeats caching benefits
clearRankingCache();
rankProvidersOptimized(input1);
clearRankingCache();
rankProvidersOptimized(input2);
```

### ✅ Do: Clear cache only on significant changes
```typescript
// GOOD - keep cache between similar queries
rankProvidersOptimized(input1); // Cached
rankProvidersOptimized(input2); // Uses cache for similar data
clearRankingCache(); // Only on major filter change
rankProvidersOptimized(input3); // Fresh ranking
```

---

### ❌ Don't: Debounce without cleanup
```typescript
// BAD - creates new debounced function each render
const MyComponent = ({ providers }) => {
  const debouncedRank = debounce((budget) => {
    rankProvidersOptimized({ providers, budget });
  }, 300);

  return <input onChange={(e) => debouncedRank(e.target.value)} />;
};
```

### ✅ Do: Memoize debounced function
```typescript
// GOOD - debounced function persists across renders
const MyComponent = ({ providers }) => {
  const debouncedRank = useCallback(
    debounce((budget) => {
      rankProvidersOptimized({ providers, budget });
    }, 300),
    [providers]
  );

  return <input onChange={(e) => debouncedRank(e.target.value)} />;
};
```

## Performance Checklist for Triage Flow

- [ ] Using `rankProvidersOptimized` instead of `rankProviders`
- [ ] Location acquisition doesn't block UI (done in background)
- [ ] Budget changes debounced (300ms)
- [ ] Cache cleared only when filters significantly change
- [ ] Performance tracked with `usePerformanceTracking` hook
- [ ] Error handling for location permission denial
- [ ] Loading UI shown while ranking in progress
- [ ] Results persist across page navigation (session storage)

## Debugging Performance Issues

### Check if caching is working

```typescript
import { getRankingCacheStats } from '@travelhealthbridge/shared';

// Should show cache size > 0
console.log(getRankingCacheStats());
// Output: { size: 3, maxSize: 50, maxAge: 300000 }
```

### Profile specific operations

```typescript
performanceMonitor.reportSummary();
// Output:
// TRIAGE: 5 operations, avg 87.42ms, 0 slow
// PROVIDER: 2 operations, avg 124.30ms, 0 slow
// LOCATION: 1 operations, avg 182.50ms, 0 slow
```

### Identify slow operations

```typescript
const slowTriages = performanceMonitor
  .getMetricsByCategory('triage')
  .filter(m => m.duration > 1500);

console.log(`${slowTriages.length} triages exceeded SLA`);
slowTriages.forEach(m => {
  console.log(`${m.name}: ${m.duration?.toFixed(2)}ms`);
});
```

## Integration Checklist

Before merging triage changes:

- [ ] Tests pass: `npm run test`
- [ ] Performance tests pass: <1500ms triage SLA
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passes: `npm run type-check`
- [ ] Code reviewed with performance focus
- [ ] E2E tests run successfully
- [ ] Staging deployment verified
- [ ] Performance dashboard shows improvement

## Support & Questions

- **Performance Guide**: See PERFORMANCE_GUIDE.md for detailed documentation
- **Testing Examples**: See E2E_TESTING_SPEC.md for test patterns
- **Implementation Examples**: See apps/consumer/app/triage/TriageFormOptimized.tsx
- **API Reference**: See packages/shared/utils/rankProvidersOptimized.ts source

---

**Last Updated**: Phase 2 Completion
**Version**: 2.0.0
**Status**: Production Ready ✅
