'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@travelhealthbridge/shared';
import { track } from '@travelhealthbridge/shared';
import styles from './dashboard.module.css';

interface ProviderData {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  last_activity_at: string;
  referral_count: number;
  feedback_count: number;
  avg_rating: number;
}

export default function DashboardPage() {
  const { session } = useAuthStore();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timing, setTiming] = useState<number | null>(null);
  const toggleStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadProviderData();
    }
  }, [session]);

  const loadProviderData = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name, phone, available, last_activity_at, referral_count, feedback_count, avg_rating')
        .eq('user_id', session?.user?.id)
        .single();

      if (!error && data) {
        setProvider(data);
        setIsAvailable(data.available || false);
      }
    } catch (err) {
      console.error('Error loading provider data:', err);
    }
  };

  // PERFORMANCE CRITICAL: Must update in <1000ms total
  const handleAvailabilityToggle = async () => {
    if (!provider || isUpdating) return;

    toggleStartTime.current = performance.now();
    setIsUpdating(true);
    const newAvailableState = !isAvailable;
    setIsAvailable(newAvailableState); // Instant UI update

    try {
      // Perform both updates in parallel for faster execution
      const updatePromise = supabase
        .from('providers')
        .update({
          available: newAvailableState,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', provider.id);

      const analyticsPromise = (async () => {
        track('provider_availability_toggled', {
          provider_id: provider.id,
          new_status: newAvailableState ? 'available' : 'unavailable',
          timestamp: new Date().toISOString(),
        });
      })();

      const [updateResult] = await Promise.all([updatePromise, analyticsPromise]);

      if (updateResult.error) throw updateResult.error;

      // Calculate and record timing
      const elapsedTime = performance.now() - (toggleStartTime.current || 0);
      setTiming(Math.round(elapsedTime));

      // Verify update succeeded
      track('provider_availability_toggle_confirmed', {
        provider_id: provider.id,
        toggle_duration_ms: Math.round(elapsedTime),
        success: true,
      });

      // Ensure total time is under 1 second, if not log warning
      if (elapsedTime > 1000) {
        console.warn(`⚠️ Toggle took ${elapsedTime}ms - EXCEEDS 1sec SLA`);
        track('provider_toggle_sla_breach', {
          duration_ms: Math.round(elapsedTime),
        });
      }

      // Update provider state after successful API call
      setProvider({
        ...provider,
        available: newAvailableState,
        last_activity_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error toggling availability:', err);
      // Revert UI on error
      setIsAvailable(!newAvailableState);

      track('provider_availability_toggle_failed', {
        provider_id: provider.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsUpdating(false);
      toggleStartTime.current = null;
    }
  };

  if (!provider) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>{provider.name}</h1>
        <p className={styles.phone}>{provider.phone}</p>
      </div>

      {/* AVAILABILITY TOGGLE - PERFORMANCE CRITICAL */}
      <div className={styles.availabilityCard}>
        <div className={styles.availabilityHeader}>
          <h2>Your Availability</h2>
          {timing !== null && (
            <span className={[styles.timingBadge, timing > 1000 ? styles.timingBadgeWarning : styles.timingBadgeGood].join(' ')}>
              {timing}ms
            </span>
          )}
        </div>

        <button
          className={[styles.availabilityToggle, isAvailable ? styles.availableOn : styles.availableOff].join(' ')}
          onClick={handleAvailabilityToggle}
          disabled={isUpdating}
          aria-label={`Toggle availability - currently ${isAvailable ? 'available' : 'unavailable'}`}
        >
          <div className={styles.toggleSwitch} />
          <span className={styles.toggleLabel}>
            {isAvailable ? '✓ AVAILABLE' : '✗ UNAVAILABLE'}
          </span>
        </button>

        <p className={styles.lastActivity}>
          Last activity: {provider.last_activity_at ? new Date(provider.last_activity_at).toLocaleTimeString() : 'Never'}
        </p>

        {timing && timing <= 1000 && (
          <p className={styles.performanceNote}>
            ✓ Toggle completed in {timing}ms (SLA: &lt;1000ms)
          </p>
        )}
        {timing && timing > 1000 && (
          <p className={styles.performanceWarning}>
            ⚠️ Toggle took {timing}ms (SLA: &lt;1000ms) - Please check your connection
          </p>
        )}
      </div>

      {/* QUICK STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{provider.referral_count}</div>
          <div className={styles.statLabel}>Referrals This Month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{provider.feedback_count}</div>
          <div className={styles.statLabel}>Feedback Received</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{provider.avg_rating?.toFixed(1) || 'N/A'}</div>
          <div className={styles.statLabel}>Avg Rating</div>
        </div>
      </div>
    </div>
  );
}
