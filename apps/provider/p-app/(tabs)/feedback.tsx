import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Star, 
  MessageSquarePrimary, 
  TrendingUp, 
  Target, 
  Flag, 
  AlertTriangle,
  MapPin,
  ExternalLink
} from 'lucide-react-native';
import { 
  palette, 
  spacing, 
  borderRadius, 
  typography, 
  Card, 
  Badge,
  useTheme 
} from '@travelhealthbridge/shared/ui';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { useAuthStore } from '../../store/authStore';

export default function FeedbackScreen() {
  const { provider } = useAuthStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    avgRating: 0,
    visitRate: 0,
    costAccuracy: 0,
    reusePercent: 0,
    totalCount: 0
  });
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchFeedback = useCallback(async () => {
    if (!provider) return;

    // Fetch all feedback for this provider's sessions
    const { data: feedbackData, error } = await supabase
      .from('feedback')
      .select(`
        id,
        session_id,
        star_rating,
        cost_accurate,
        visited_recommended_provider,
        reuse_intent,
        notes,
        submitted_at,
        triage_sessions (city_id, symptom)
      `)
      .eq('visited_recommended_provider', true)
      .order('submitted_at', { ascending: false });

    if (error) return;

    if (feedbackData) {
      const count = feedbackData.length;
      const avg = feedbackData.reduce((acc, f) => acc + (f.star_rating || 0), 0) / (count || 1);
      const accurate = (feedbackData.filter(f => f.cost_accurate === 'yes').length / (count || 1)) * 100;
      const reuse = (feedbackData.filter(f => f.reuse_intent === 'yes').length / (count || 1)) * 100;

      setMetrics({
        avgRating: avg,
        visitRate: 0, // Calculated separately from all sessions if needed
        costAccuracy: accurate,
        reusePercent: reuse,
        totalCount: count
      });
      setReviews(feedbackData);
    }
  }, [provider]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeedback();
    setIsRefreshing(false);
  };

  const flagReview = async (reviewId: string, notes: string) => {
    if (!provider) return;
    
    Alert.alert(
      'Flag Review',
      'If you believe this review is fraudulent or inaccurate, it will be flagged for Travel Health Bridge Ops to investigate.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Flag for Review', 
          onPress: async () => {
             const { error } = await supabase.from('review_flags').insert({
               feedback_id: reviewId,
               provider_id: provider.id,
               status: 'Open',
               ops_notes: 'Flagged by provider',
               created_at: new Date().toISOString()
             });
             if (!error) Alert.alert('Success', 'Review flagged for ops investigation.');
          }
        }
      ]
    );
  };

  if (!provider) return null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <Stack.Screen options={{ title: 'Clinic Feedback' }} />

      {/* Primary Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.mainMetric}>
           <Text style={styles.mainMetricValue}>{metrics.avgRating.toFixed(1)}</Text>
           <View style={styles.stars}>
              {[1,2,3,4,5].map(i => (
                <Star 
                  key={i} 
                  size={14} 
                  color={i <= Math.round(metrics.avgRating) ? palette.amber[500] : palette.navy[100]} 
                  fill={i <= Math.round(metrics.avgRating) ? palette.amber[500] : 'transparent'}
                />
              ))}
           </View>
           <Text style={styles.mainMetricLabel}>Average Rating</Text>
        </View>
        <View style={styles.secMetrics}>
           <View style={styles.metricItem}>
              <Target size={14} color={palette.teal[600]} />
              <Text style={styles.metricText}>{Math.round(metrics.costAccuracy)}% Cost Accurate</Text>
           </View>
           <View style={styles.metricItem}>
              <TrendingUp size={14} color={palette.blue[600]} />
              <Text style={styles.metricText}>{Math.round(metrics.reusePercent)}% Reuse Intent</Text>
           </View>
        </View>
      </View>

      {/* Aggregate Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Info size={14} color={palette.navy[400]} />
        <Text style={styles.disclaimerText}>
          Metrics are calculated from the last {metrics.totalCount} verified visits.
        </Text>
      </View>

      {/* Individual Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Reviews</Text>
        
        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
             <MessageSquare size={40} color={palette.navy[100]} />
             <Text style={styles.emptyText}>No verified reviews yet.</Text>
          </View>
        ) : (
          reviews.map((f) => (
            <Card key={f.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                 <View style={styles.reviewStars}>
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        size={12} 
                        color={i <= f.star_rating ? palette.amber[500] : palette.navy[100]} 
                        fill={i <= f.star_rating ? palette.amber[500] : 'transparent'}
                      />
                    ))}
                 </View>
                 <TouchableOpacity onPress={() => flagReview(f.id, f.notes || '')}>
                   <Flag size={16} color={palette.navy[200]} />
                 </TouchableOpacity>
              </View>

              <View style={styles.tagRow}>
                <View style={styles.tag}>
                   <MapPin size={12} color={palette.navy[400]} />
                   <Text style={styles.tagText}>{f.triage_sessions?.city_id}</Text>
                </View>
                <View style={styles.tag}>
                   <Stethoscope size={12} color={palette.navy[400]} />
                   <Text style={styles.tagText}>{f.triage_sessions?.symptom}</Text>
                </View>
              </View>

              {f.notes ? (
                <Text style={styles.reviewNotes}>"{f.notes}"</Text>
              ) : (
                <Text style={styles.noNoteText}>No written feedback provided.</Text>
              )}

              <View style={styles.reviewFooter}>
                 <Text style={styles.reviewDate}>
                   {new Date(f.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                 </Text>
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

// Icons for local use
const Info = (props: any) => <AlertTriangle {...props} />;
const MessageSquare = (props: any) => <Star {...props} />; // Mocking if message-square not in lucide set
const Stethoscope = (props: any) => <TrendingUp {...props} />; // Mocking if stethoscope not in set

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: palette.navy[900],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.xl,
    alignItems: 'center',
  },
  mainMetric: {
    alignItems: 'center',
    paddingRight: spacing.xl,
    borderRightWidth: 1,
    borderRightColor: palette.navy[700],
  },
  mainMetricValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  mainMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.navy[300],
    textTransform: 'uppercase',
  },
  secMetrics: {
    flex: 1,
    gap: spacing.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  disclaimerText: {
    fontSize: 12,
    color: palette.navy[400],
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.navy[900],
    marginBottom: spacing.lg,
  },
  reviewCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.navy[50],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.navy[25],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.navy[500],
    textTransform: 'uppercase',
  },
  reviewNotes: {
    fontSize: 15,
    color: palette.navy[800],
    lineHeight: 22,
    fontStyle: 'italic',
  },
  noNoteText: {
    fontSize: 14,
    color: palette.navy[300],
    fontStyle: 'italic',
  },
  reviewFooter: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.navy[25],
  },
  reviewDate: {
    fontSize: 12,
    color: palette.navy[400],
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: palette.navy[25],
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    color: palette.navy[300],
    marginTop: spacing.md,
    fontSize: 14,
  }
});
