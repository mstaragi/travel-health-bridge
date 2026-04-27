'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@travelhealthbridge/shared';
import { track } from '@travelhealthbridge/shared';
import styles from './feedback.module.css';
import { Star, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  user_id: string;
  provider_id: string;
  star_rating: number;
  language_comfort: string;
  cost_accurate: string;
  visited_recommended_provider: boolean;
  notes: string;
  created_at: string;
}

interface FeedbackStats {
  total_feedback: number;
  avg_rating: number;
  rating_distribution: Record<number, number>;
  language_comfort_scores: { positive: number; neutral: number; negative: number };
  cost_accurate_scores: { accurate: number; inaccurate: number };
  reuse_rate: number;
}

export default function FeedbackPage() {
  const { session } = useAuthStore();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  useEffect(() => {
    if (session?.user?.id) {
      loadFeedback();
    }
  }, [session]);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      // Load feedback for this provider
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('provider_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (!feedbackError && feedbackData) {
        setFeedbackItems(feedbackData);

        // Calculate statistics
        const ratings = feedbackData.map(f => f.star_rating).filter(Boolean) as number[];
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0;

        // Distribution
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(r => {
          if (distribution[r] !== undefined) distribution[r]++;
        });

        // Language comfort
        const languageComforts = feedbackData.map(f => f.language_comfort).filter(Boolean);
        const languageStats = {
          positive: languageComforts.filter(l => l === 'Very Comfortable' || l === 'Comfortable').length,
          neutral: languageComforts.filter(l => l === 'Neutral').length,
          negative: languageComforts.filter(l => l === 'Uncomfortable' || l === 'Very Uncomfortable').length,
        };

        // Cost accuracy
        const costAccuracies = feedbackData.map(f => f.cost_accurate).filter(Boolean);
        const costStats = {
          accurate: costAccuracies.filter(c => c === 'Accurate').length,
          inaccurate: costAccuracies.filter(c => c === 'Inaccurate').length,
        };

        // Reuse rate
        const withVisitedProvider = feedbackData.filter(f => f.visited_recommended_provider).length;
        const reuseRate = feedbackData.length > 0 ? (withVisitedProvider / feedbackData.length) * 100 : 0;

        setStats({
          total_feedback: feedbackData.length,
          avg_rating: parseFloat(avgRating.toFixed(1)),
          rating_distribution: distribution,
          language_comfort_scores: languageStats,
          cost_accurate_scores: costStats,
          reuse_rate: parseFloat(reuseRate.toFixed(1)),
        });

        track('provider_feedback_viewed', {
          provider_id: session?.user?.id,
          total_feedback: feedbackData.length,
          avg_rating: avgRating,
        });
      }
    } catch (err) {
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const sortedFeedback = [...feedbackItems].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return (b.star_rating || 0) - (a.star_rating || 0);
  });

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < count ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading feedback...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Feedback & Reviews</h1>
        <p className={styles.subtitle}>See what travelers are saying about you</p>
      </div>

      {/* RATING OVERVIEW */}
      {stats && (
        <div className={styles.ratingOverview}>
          <div className={styles.ratingCircle}>
            <div className={styles.ratingNumber}>{stats.avg_rating.toFixed(1)}</div>
            <div className={styles.ratingStars}>
              {renderStars(Math.round(stats.avg_rating))}
            </div>
            <div className={styles.ratingCount}>Based on {stats.total_feedback} reviews</div>
          </div>

          {/* RATING DISTRIBUTION */}
          <div className={styles.distributions}>
            <div className={styles.distributionGroup}>
              <h3 className={styles.distributionTitle}>Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className={styles.ratingRow}>
                  <span className={styles.ratingLabel}>{rating} ★</span>
                  <div className={styles.ratingBar}>
                    <div
                      className={styles.ratingFill}
                      style={{
                        width: `${stats.total_feedback > 0 ? (stats.rating_distribution[rating] / stats.total_feedback) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className={styles.ratingCount}>{stats.rating_distribution[rating]}</span>
                </div>
              ))}
            </div>

            {/* QUALITY METRICS */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>✓</div>
                <div className={styles.metricLabel}>Cost Accurate</div>
                <div className={styles.metricValue}>
                  {stats.total_feedback > 0 ? ((stats.cost_accurate_scores.accurate / stats.total_feedback) * 100).toFixed(0) : 0}%
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🗣</div>
                <div className={styles.metricLabel}>Language OK</div>
                <div className={styles.metricValue}>
                  {stats.total_feedback > 0 ? ((stats.language_comfort_scores.positive / stats.total_feedback) * 100).toFixed(0) : 0}%
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🔄</div>
                <div className={styles.metricLabel}>Would Reuse</div>
                <div className={styles.metricValue}>
                  {stats.reuse_rate.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SORT OPTIONS */}
      <div className={styles.controls}>
        <label className={styles.sortLabel}>Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
          className={styles.sortSelect}
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* FEEDBACK LIST */}
      <div className={styles.feedbackList}>
        {sortedFeedback.length > 0 ? (
          sortedFeedback.map(feedback => (
            <div key={feedback.id} className={styles.feedbackCard}>
              <div className={styles.cardHeader}>
                <div className={styles.stars}>
                  {renderStars(feedback.star_rating)}
                </div>
                <time className={styles.timestamp}>
                  {new Date(feedback.created_at).toLocaleDateString()}
                </time>
              </div>

              {feedback.notes && (
                <div className={styles.cardBody}>
                  <p className={styles.notes}>{feedback.notes}</p>
                </div>
              )}

              <div className={styles.feedbackMetadata}>
                {feedback.language_comfort && (
                  <span className={styles.tag}>
                    🗣 {feedback.language_comfort}
                  </span>
                )}
                {feedback.cost_accurate && (
                  <span className={styles.tag}>
                    💰 Cost: {feedback.cost_accurate}
                  </span>
                )}
                {feedback.visited_recommended_provider && (
                  <span className={[styles.tag, styles.tagPositive].join(' ')}>
                    ✓ Visited & Used
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <MessageSquare size={48} />
            <p>No feedback received yet</p>
            <p className={styles.emptySubtext}>Feedback will appear here after travelers visit you</p>
          </div>
        )}
      </div>
    </div>
  );
}
