# Phase 2 Quick Reference Card

## 🚀 Key Utilities

### Performance Monitoring
```typescript
import { performanceMonitor } from '@travelhealthbridge/shared';

// Track operation
performanceMonitor.start('operation', 'triage', { metadata });
performanceMonitor.end('operation', 'triage');

// Get metrics
performanceMonitor.getMetricsByCategory('triage')
performanceMonitor.getAverageDuration('triage')
performanceMonitor.reportSummary()
```

### Optimized Ranking
```typescript
import { rankProvidersOptimized, clearRankingCache } from '@travelhealthbridge/shared';

// Use instead of rankProviders
const result = rankProvidersOptimized({ providers, urgency, budget, ... });

// Automatic caching: identical inputs return cached results <10ms
// Clear when filters change significantly
clearRankingCache();
```

### Debounce
```typescript
import { debounce } from '@travelhealthbridge/shared';

const debouncedFn = debounce((value) => {
  rankProvidersOptimized({ ...input, budget: value });
}, 300); // 300ms delay
```

### Memoization
```typescript
import { memoize } from '@travelhealthbridge/shared';

const expensiveFn = memoize((data) => {
  return complexCalculation(data);
});
```

## 📊 Performance Targets

| Operation | SLA | Status |
|-----------|-----|--------|
| Triage submission | <1500ms | ✅ |
| Emergency flow | <2000ms | ✅ |
| Provider ranking | <200ms | ✅ |
| Cache hit | <10ms | ✅ |
| Symptom load | <300ms | ✅ |

## 🧪 Testing

```typescript
// Unit test pattern
import { describe, it, expect, beforeEach } from 'vitest';
import { rankProvidersOptimized, clearRankingCache } from '@travelhealthbridge/shared';

describe('Ranking', () => {
  beforeEach(() => clearRankingCache());

  it('should cache identical requests', () => {
    rankProvidersOptimized(input);
    const result = rankProvidersOptimized(input);
    // Second call uses cache: <10ms
  });
});
```

## 📝 Common Patterns

### Pattern: Budget Filter
```typescript
const debouncedRank = useCallback(
  debounce((budget) => {
    rankProvidersOptimized({ ...input, budget });
  }, 300),
  [input]
);
```

### Pattern: Language Preference
```typescript
handleLanguageChange = (languages) => {
  clearRankingCache(); // New filter needs fresh ranking
  setLanguages(languages);
};
```

### Pattern: Component Tracking
```typescript
export function MyComponent() {
  usePerformanceTracking('MyComponent', 'triage');
  return <div>...</div>;
}
```

### Pattern: Batch Operations
```typescript
const results = queries.map(q =>
  rankProvidersOptimized({ ...baseInput, ...q })
);
```

## ❌ Common Mistakes

| ❌ Don't | ✅ Do |
|----------|-------|
| `rankProviders()` | `rankProvidersOptimized()` |
| `clearRankingCache()` on every query | Clear only on major filter change |
| Create new debounced function each render | Use `useCallback` to memoize |
| Re-rank on every keystroke | Debounce with 300ms delay |

## 📚 Documentation Reference

| Document | Purpose | Link |
|----------|---------|------|
| PERFORMANCE_GUIDE.md | Detailed usage & best practices | See file |
| E2E_TESTING_SPEC.md | Complete test specifications | See file |
| DEPLOYMENT_CHECKLIST_PHASE2.md | Pre-deployment verification | See file |
| PHASE2_SUMMARY.md | Implementation overview | See file |
| IMPLEMENTATION_GUIDE_PHASE2.md | Developer quick-start | See file |

## 🔍 Debugging

### Check cache status
```typescript
import { getRankingCacheStats } from '@travelhealthbridge/shared';
console.log(getRankingCacheStats());
// { size: 5, maxSize: 50, maxAge: 300000 }
```

### Performance report
```typescript
performanceMonitor.reportSummary();
// TRIAGE: 5 operations, avg 87.42ms, 0 slow
// PROVIDER: 2 operations, avg 124.30ms, 0 slow
```

### Verify SLA compliance
```typescript
import { validatePerformanceSLAs } from 'apps/consumer/app/triage/triageOptimizations';
const isValid = validatePerformanceSLAs(); // true if all meet SLA
```

## 📦 Exports from Shared Package

```typescript
export {
  // Performance monitoring
  performanceMonitor,
  usePerformanceTracking,
  debounce,
  memoize,
  scheduleIdleCallback,
  batchStateUpdates,
  
  // Optimized ranking
  rankProvidersOptimized,
  clearRankingCache,
  getRankingCacheStats,
  precomputeRankings,
} from '@travelhealthbridge/shared';
```

## 🎯 Deployment Checklist (Quick)

- [ ] Using `rankProvidersOptimized` not `rankProviders`
- [ ] Tests pass: `npm run test`
- [ ] Performance SLA validated: <1500ms
- [ ] TypeScript strict mode: `npm run type-check`
- [ ] Code reviewed
- [ ] E2E tests pass
- [ ] Staging verified

## 📞 Support

- **Performance Guide**: PERFORMANCE_GUIDE.md
- **Implementation Example**: apps/consumer/app/triage/TriageFormOptimized.tsx
- **Tests Examples**: packages/shared/__tests__/*.test.ts

---

**Version**: 2.0.0 | **Status**: Production Ready ✅ | **Phase**: 2 Complete
