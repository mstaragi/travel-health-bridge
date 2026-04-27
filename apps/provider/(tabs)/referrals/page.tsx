'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@travelhealthbridge/shared';
import { track } from '@travelhealthbridge/shared';
import styles from './referrals.module.css';
import { TrendingUp, Star, Phone, MapPin, Calendar } from 'lucide-react';

interface Referral {
  id: string;
  user_id: string;
  provider_id: string;
  city_id: string;
  symptom: string;
  urgency: string;
  called_at?: string;
  feedback_provided: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'no_answer';
}

interface ReferralStats {
  total_referrals: number;
  accepted_referrals: number;
  acceptance_rate: number;
  avg_response_time_min: number;
  feedback_received: number;
  avg_rating: number;
}

export default function ReferralsPage() {
  const { session } = useAuthStore();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'accepted' | 'no_answer'>('all');

  useEffect(() => {
    if (session?.user?.id) {
      loadReferralsData();
    }
  }, [session]);

  const loadReferralsData = useCallback(async () => {
    setLoading(true);
    try {
      // Load referrals for this provider
      const { data: referralsData, error: referralsError } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('provider_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (!referralsError && referralsData) {
        // Transform to referral format
        const transformed: Referral[] = referralsData.map((session: any) => ({
          id: session.id,
          user_id: session.user_id,
          provider_id: session.provider_id,
          city_id: session.city_id,
          symptom: session.symptom,
          urgency: session.urgency,
          called_at: session.call_now_tapped_at,
          feedback_provided: !!session.feedback,
          status: session.call_now_tapped_at ? 'accepted' : 'pending',
        }));

        setReferrals(transformed);

        // Calculate statistics
        const accepted = transformed.filter(r => r.status === 'accepted').length;
        const withFeedback = transformed.filter(r => r.feedback_provided).length;

        // Load feedback data for ratings
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('star_rating')
          .eq('provider_id', session?.user?.id);

        const avgRating = feedbackData && feedbackData.length > 0
          ? feedbackData.reduce((sum, f) => sum + (f.star_rating || 0), 0) / feedbackData.length
          : 0;

        setStats({
          total_referrals: transformed.length,
          accepted_referrals: accepted,
          acceptance_rate: transformed.length > 0 ? (accepted / transformed.length) * 100 : 0,
          avg_response_time_min: 2.5, // Placeholder - calculate from data in production
          feedback_received: withFeedback,
          avg_rating: parseFloat(avgRating.toFixed(1)),
        });

        track('provider_referrals_viewed', {
          provider_id: session?.user?.id,
          total_referrals: transformed.length,
          acceptance_rate: (accepted / transformed.length) * 100,
        });
      }
    } catch (err) {
      console.error('Error loading referrals:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const filteredReferrals = referrals.filter(r => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'accepted') return r.status === 'accepted';
    if (selectedFilter === 'no_answer') return r.status === 'no_answer' || r.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading referrals...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Referrals & Performance</h1>
        <p className={styles.subtitle}>Track your referrals and performance metrics</p>
      </div>

      {/* PERFORMANCE CARDS */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Phone size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.total_referrals}</div>
              <div className={styles.statLabel}>Total Referrals</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.acceptance_rate.toFixed(0)}%</div>
              <div className={styles.statLabel}>Acceptance Rate</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Star size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.avg_rating.toFixed(1)}</div>
              <div className={styles.statLabel}>Avg Rating</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.feedback_received}</div>
              <div className={styles.statLabel}>Feedback Received</div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className={styles.tabs}>
        {(['all', 'accepted', 'no_answer'] as const).map(filter => (
          <button
            key={filter}
            className={[styles.tab, selectedFilter === filter && styles.tabActive].join(' ')}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter === 'all' && `All (${referrals.length})`}
            {filter === 'accepted' && `Accepted (${referrals.filter(r => r.status === 'accepted').length})`}
            {filter === 'no_answer' && `No Answer (${referrals.filter(r => r.status === 'no_answer' || r.status === 'pending').length})`}
          </button>
        ))}
      </div>

      {/* REFERRALS LIST */}
      <div className={styles.referralsList}>
        {filteredReferrals.length > 0 ? (
          filteredReferrals.map(referral => (
            <div key={referral.id} className={styles.referralCard}>
              <div className={styles.referralHeader}>
                <div className={styles.referralMeta}>
                  <span className={[styles.urgencyBadge, styles[`urgency_${referral.urgency.toLowerCase()}`]].join(' ')}>
                    {referral.urgency}
                  </span>
                  <span className={styles.symptom}>{referral.symptom}</span>
                </div>
                <span className={[styles.statusBadge, styles[`status_${referral.status}`]].join(' ')}>
                  {referral.status === 'accepted' && '✓ Called'}
                  {referral.status === 'pending' && '⏳ Pending'}
                  {referral.status === 'no_answer' && '✗ No Answer'}
                </span>
              </div>

              <div className={styles.referralBody}>
                <div className={styles.referralDetail}>
                  <MapPin size={16} />
                  <span>{referral.city_id}</span>
                </div>
                {referral.called_at && (
                  <div className={styles.referralDetail}>
                    <Calendar size={16} />
                    <span>{new Date(referral.called_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {referral.feedback_provided && (
                <div className={styles.feedbackIndicator}>
                  <Star size={14} fill="currentColor" />
                  Feedback received
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No referrals in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
