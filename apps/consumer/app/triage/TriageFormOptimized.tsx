/**
 * apps/consumer/app/triage/TriageFormOptimized.tsx
 * Example implementation of triage form with performance optimizations
 * Demonstrates best practices for using memoized ranking and performance monitoring
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  rankProvidersOptimized,
  clearRankingCache,
  performanceMonitor,
  debounce,
  usePerformanceTracking,
  Provider,
  UrgencyLevel,
} from '@travelhealthbridge/shared';
import { supabase } from '@travelhealthbridge/shared';
import { track } from '@travelhealthbridge/shared';
import styles from './triageForm.module.css';

interface TriageFormState {
  symptoms: string[];
  languages: string[];
  urgency: UrgencyLevel;
  budget: number;
  lat?: number;
  lng?: number;
}

const SYMPTOMS = [
  'Fever',
  'Cough',
  'Headache',
  'Body Ache',
  'Sore Throat',
  'Nausea',
  'Chest Pain',
  'Shortness of Breath',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Marathi',
  'Bengali',
  'Gujarati',
];

const SYMPTOM_TO_SPECIALTY: Record<string, string[]> = {
  'Fever': ['General Physician', 'Infectious Diseases'],
  'Cough': ['General Physician', 'Pulmonology'],
  'Chest Pain': ['Cardiology', 'General Physician'],
  'Shortness of Breath': ['Pulmonology', 'Cardiology'],
};

export default function TriageFormOptimized() {
  usePerformanceTracking('TriageForm', 'triage');

  const router = useRouter();

  const [formState, setFormState] = useState<TriageFormState>({
    symptoms: [],
    languages: [],
    urgency: 'can_wait',
    budget: 500,
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = useCallback(async () => {
    try {
      performanceMonitor.start('loadProviders', 'provider');

      const { data, error: queryError } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'active')
        .limit(200);

      if (queryError) throw queryError;

      setProviders(data || []);

      performanceMonitor.end('loadProviders', 'provider', {
        count: data?.length,
      });

      // Preload common ranking combinations for faster response
      preloadRankings(data || []);
    } catch (err) {
      console.error('Error loading providers:', err);
      setError('Failed to load provider data');
    }
  }, []);

  const preloadRankings = useCallback((providerList: Provider[]) => {
    // Precompute rankings for common language/urgency combinations
    // This populates the ranking cache during idle time
    const commonCombinations = [
      { languages: ['English'], urgency: 'can_wait' as const },
      { languages: ['English', 'Hindi'], urgency: 'urgent' as const },
      { languages: [], urgency: 'emergency' as const },
    ];

    commonCombinations.forEach(combo => {
      rankProvidersOptimized({
        providers: providerList,
        userLanguages: combo.languages,
        urgency: combo.urgency,
        budget: formState.budget,
        symptomToSpecialty: SYMPTOM_TO_SPECIALTY,
      });
    });
  }, [formState.budget]);

  // Debounced budget update to avoid re-ranking on every keystroke
  const debouncedBudgetChange = useCallback(
    debounce((newBudget: number) => {
      setFormState(prev => ({ ...prev, budget: newBudget }));
      clearRankingCache(); // Clear cache when filter changes
    }, 300),
    []
  );

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    debouncedBudgetChange(value);
  };

  const handleSymptomChange = (symptom: string) => {
    setFormState(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormState(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));

    // Clear cache when language preferences change
    clearRankingCache();
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      performanceMonitor.start('triageSubmit', 'triage', {
        symptomCount: formState.symptoms.length,
        languageCount: formState.languages.length,
      });

      try {
        // Get user's location if available
        const location = await getUserLocation();

        // Rank providers using optimized memoized function
        const ranking = rankProvidersOptimized({
          providers,
          userLanguages: formState.languages,
          urgency: formState.urgency,
          budget: formState.budget,
          lat: location?.lat,
          lng: location?.lng,
          symptom: formState.symptoms[0],
          symptomToSpecialty: SYMPTOM_TO_SPECIALTY,
        });

        performanceMonitor.end('triageSubmit', 'triage', {
          hasResults: !!ranking.primary,
        });

        // Track triage completion
        track('triageStepCompleted', {
          step: 'ranking_completed',
          symptom_count: formState.symptoms.length,
          language_count: formState.languages.length,
          urgency: formState.urgency,
          has_primary: !!ranking.primary,
          ranking_available: !ranking.showHelplineCTA,
        });

        // Save triage session
        const { data: session, error: saveError } = await supabase
          .from('triage_sessions')
          .insert({
            user_id: 'current_user_id', // Replace with actual user
            symptoms: formState.symptoms,
            urgency: formState.urgency,
            budget: formState.budget,
            primary_provider_id: ranking.primary?.id,
            secondary_provider_id: ranking.secondary?.id,
          })
          .select()
          .single();

        if (saveError) throw saveError;

        // Navigate to results page
        router.push(`/triage/results?sessionId=${session.id}`);
      } catch (err) {
        console.error('Triage submission failed:', err);
        setError(String(err) || 'Failed to rank providers');
        performanceMonitor.end('triageSubmit', 'triage', {
          error: String(err),
        });
      } finally {
        setLoading(false);
      }
    },
    [formState, providers, router]
  );

  const getUserLocation = useCallback(async () => {
    return new Promise<{ lat: number; lng: number } | undefined>(resolve => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      performanceMonitor.start('getUserLocation', 'location');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          performanceMonitor.end('getUserLocation', 'location', {
            accuracy: position.coords.accuracy,
          });

          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          performanceMonitor.end('getUserLocation', 'location', {
            error: 'denied',
          });
          resolve(undefined);
        }
      );
    });
  }, []);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.section}>
        <h2>What are your symptoms?</h2>
        <div className={styles.symptomGrid}>
          {SYMPTOMS.map(symptom => (
            <button
              key={symptom}
              type="button"
              className={[
                styles.symptomButton,
                formState.symptoms.includes(symptom) ? styles.selected : '',
              ].join(' ')}
              onClick={() => handleSymptomChange(symptom)}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Preferred Languages</h2>
        <div className={styles.languageGrid}>
          {LANGUAGES.map(language => (
            <button
              key={language}
              type="button"
              className={[
                styles.languageButton,
                formState.languages.includes(language) ? styles.selected : '',
              ].join(' ')}
              onClick={() => handleLanguageChange(language)}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2>How urgent is your condition?</h2>
        <div className={styles.urgencyGroup}>
          <label>
            <input
              type="radio"
              value="can_wait"
              checked={formState.urgency === 'can_wait'}
              onChange={(e) =>
                setFormState(prev => ({
                  ...prev,
                  urgency: e.target.value as UrgencyLevel,
                }))
              }
            />
            Can Wait (non-urgent)
          </label>
          <label>
            <input
              type="radio"
              value="urgent"
              checked={formState.urgency === 'urgent'}
              onChange={(e) =>
                setFormState(prev => ({
                  ...prev,
                  urgency: e.target.value as UrgencyLevel,
                }))
              }
            />
            Urgent (need soon)
          </label>
          <label>
            <input
              type="radio"
              value="emergency"
              checked={formState.urgency === 'emergency'}
              onChange={(e) =>
                setFormState(prev => ({
                  ...prev,
                  urgency: e.target.value as UrgencyLevel,
                }))
              }
            />
            Emergency (life-threatening)
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <label>
          Maximum Budget (₹): {formState.budget}
          <input
            type="range"
            min="100"
            max="2000"
            value={formState.budget}
            onChange={handleBudgetChange}
            className={styles.slider}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || formState.symptoms.length === 0}
        className={styles.submitButton}
      >
        {loading ? 'Finding Providers...' : 'Find Providers'}
      </button>

      {loading && <div className={styles.loadingSpinner} />}
    </form>
  );
}
