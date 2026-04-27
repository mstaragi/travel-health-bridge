/**
 * apps/consumer/app/triage/triageOptimizations.ts
 * Triage flow optimizations using performance monitoring and memoized ranking
 * Implements best practices for fast, responsive UI during critical medical flow
 */

import { rankProvidersOptimized, clearRankingCache, performanceMonitor } from '@travelhealthbridge/shared';
import { Provider, UrgencyLevel } from '@travelhealthbridge/shared';

/**
 * Configuration for triage performance targets
 */
export const TRIAGE_PERFORMANCE_TARGETS = {
  SYMPTOM_LOAD: 300, // ms - load and render symptom selector
  TRIAGE_SUBMIT: 1500, // ms - submit triage form and get ranking
  RANKING_DISPLAY: 500, // ms - render provider results
  EMERGENCY_RESPONSE: 2000, // ms - emergency flow complete
} as const;

/**
 * Optimized triage submission handler
 * Orchestrates ranking with performance monitoring
 */
export async function submitTriageOptimized({
  symptoms,
  languages,
  urgency,
  budget,
  lat,
  lng,
  providers,
  symptomToSpecialty,
  availabilityStatuses,
}: {
  symptoms: string[];
  languages: string[];
  urgency: UrgencyLevel;
  budget: number;
  lat?: number;
  lng?: number;
  providers: Provider[];
  symptomToSpecialty?: Record<string, string[]>;
  availabilityStatuses?: Record<string, 'available' | 'busy'>;
}) {
  performanceMonitor.start('triageSubmit', 'triage', {
    symptomCount: symptoms.length,
    providersCount: providers.length,
  });

  try {
    // Clear cache if filters significantly changed
    // (This is a heuristic - adjust thresholds based on real data)
    if (languages.length > 0) {
      clearRankingCache();
    }

    // Rank providers using memoized version
    const ranking = rankProvidersOptimized({
      providers,
      userLanguages: languages,
      urgency,
      budget,
      lat,
      lng,
      symptom: symptoms[0], // Primary symptom for specialty matching
      symptomToSpecialty,
      availabilityStatuses,
    });

    performanceMonitor.end('triageSubmit', 'triage', {
      hasResults: !!ranking.primary,
      showHelpline: ranking.showHelplineCTA,
    });

    return ranking;
  } catch (error) {
    console.error('Triage ranking failed:', error);
    performanceMonitor.end('triageSubmit', 'triage', {
      error: String(error),
    });
    throw error;
  }
}

/**
 * Preload providers in background for faster ranking
 * Call during earlier triage steps (e.g., after symptom selection)
 */
export async function preloadProvidersForRanking(
  providers: Provider[],
  symptomToSpecialty?: Record<string, string[]>
): Promise<void> {
  performanceMonitor.start('preloadProviders', 'triage');

  try {
    // Generate common filter combinations
    const commonFilters = [
      { userLanguages: ['English'], urgency: 'can_wait' as const },
      { userLanguages: ['English', 'Hindi'], urgency: 'urgent' as const },
      { userLanguages: [], urgency: 'emergency' as const },
    ];

    // Pre-rank each combination (populates cache)
    commonFilters.forEach(filter => {
      rankProvidersOptimized({
        providers,
        userLanguages: filter.userLanguages,
        urgency: filter.urgency,
        budget: 1000,
        symptomToSpecialty,
      });
    });

    performanceMonitor.end('preloadProviders', 'triage');
  } catch (error) {
    console.error('Provider preloading failed:', error);
  }
}

/**
 * Emergency flow optimization
 * Prioritizes speed over ranking sophistication
 */
export async function submitEmergencyTriageOptimized({
  lat,
  lng,
  providers,
  availabilityStatuses,
}: {
  lat?: number;
  lng?: number;
  providers: Provider[];
  availabilityStatuses?: Record<string, 'available' | 'busy'>;
}) {
  performanceMonitor.start('emergencyTriage', 'triage');

  try {
    // Emergency: use emergency-capable providers only
    const emergencyProviders = providers.filter(p => p.emergency);

    if (emergencyProviders.length === 0) {
      performanceMonitor.end('emergencyTriage', 'triage', {
        result: 'noEmergencyProviders',
      });
      return { primary: null, secondary: null, showHelplineCTA: true };
    }

    // Quick ranking: emergency + distance only
    const ranking = rankProvidersOptimized({
      providers: emergencyProviders,
      userLanguages: [], // Skip language filtering for speed
      urgency: 'emergency',
      budget: 10000, // Generous budget for emergency
      lat,
      lng,
      availabilityStatuses,
    });

    performanceMonitor.end('emergencyTriage', 'triage', {
      result: ranking.primary ? 'success' : 'fallback',
    });

    return ranking;
  } catch (error) {
    console.error('Emergency triage failed:', error);
    throw error;
  }
}

/**
 * Batch triage operations for offline support
 * Optimizes multiple triage submissions with shared provider data
 */
export async function batchTriageOptimized(
  submissions: Array<{
    symptoms: string[];
    languages: string[];
    urgency: UrgencyLevel;
    budget: number;
    lat?: number;
    lng?: number;
  }>,
  providers: Provider[],
  symptomToSpecialty?: Record<string, string[]>,
  availabilityStatuses?: Record<string, 'available' | 'busy'>
): Promise<Array<any>> {
  performanceMonitor.start('batchTriage', 'triage', {
    submissionCount: submissions.length,
  });

  const results = submissions.map(submission =>
    rankProvidersOptimized({
      providers,
      userLanguages: submission.languages,
      urgency: submission.urgency,
      budget: submission.budget,
      lat: submission.lat,
      lng: submission.lng,
      symptom: submission.symptoms[0],
      symptomToSpecialty,
      availabilityStatuses,
    })
  );

  performanceMonitor.end('batchTriage', 'triage', {
    submissionCount: submissions.length,
  });

  return results;
}

/**
 * Get performance report for triage flow
 * Returns metrics and identifies bottlenecks
 */
export function getTriagePerformanceReport() {
  const triageMetrics = performanceMonitor.getMetricsByCategory('triage');

  return {
    totalOperations: triageMetrics.length,
    averageDuration: performanceMonitor.getAverageDuration('triage'),
    slowOperations: triageMetrics.filter(
      m => m.duration && m.duration > TRIAGE_PERFORMANCE_TARGETS.TRIAGE_SUBMIT
    ),
    breakdown: triageMetrics.reduce((acc, m) => {
      acc[m.name] = (acc[m.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Validate performance against SLAs
 * Returns true if all metrics meet targets
 */
export function validatePerformanceSLAs(): boolean {
  const report = getTriagePerformanceReport();

  if (report.slowOperations.length > 0) {
    console.warn(`⚠️ ${report.slowOperations.length} triage operations exceeded SLA`);
    report.slowOperations.forEach(op => {
      console.warn(
        `  - ${op.name}: ${op.duration?.toFixed(2)}ms (target: ${TRIAGE_PERFORMANCE_TARGETS.TRIAGE_SUBMIT}ms)`
      );
    });
    return false;
  }

  return true;
}
