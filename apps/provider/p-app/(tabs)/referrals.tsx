import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Filter, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronRight 
} from 'lucide-react-native';
import { 
  palette, 
  spacing, 
  borderRadius, 
  typography, 
  Card, 
  Badge,
  Input 
} from '@travelhealthbridge/shared/ui';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { useAuthStore } from '../../store/authStore';

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

export default function ReferralsScreen() {
  const { provider } = useAuthStore();
  
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReferrals = useCallback(async (currentPeriod: FilterPeriod) => {
    if (!provider) return;
    setIsLoading(true);

    let query = supabase
      .from('triage_sessions')
      .select(`
        id,
        created_at,
        symptom,
        urgency,
        feedback (
          visited,
          visited_recommended_provider,
          star_rating,
          notes
        )
      `)
      .eq('recommended_provider_id', provider.id)
      .order('created_at', { ascending: false });

    if (currentPeriod !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (currentPeriod === 'today') startDate.setHours(0,0,0,0);
      if (currentPeriod === 'week') startDate.setDate(now.getDate() - 7);
      if (currentPeriod === 'month') startDate.setMonth(now.getMonth() - 1);
      
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (data) setReferrals(data);
    setIsLoading(false);
  }, [provider]);

  useEffect(() => {
    fetchReferrals(period);
  }, [fetchReferrals, period]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchReferrals(period);
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const feedback = item.feedback?.[0];
    const visited = feedback?.visited_recommended_provider;
    const date = new Date(item.created_at);

    return (
      <Card style={styles.referralCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateInfo}>
            <Calendar size={14} color={palette.navy[400]} />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Badge 
            label={item.urgency.toUpperCase()} 
            variant={item.urgency === 'emergency' ? 'danger' : item.urgency === 'urgent' ? 'warning' : 'neutral'} 
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.symptomBox}>
            <Text style={styles.symptomLabel}>Reason for visit</Text>
            <Text style={styles.symptomValue}>{item.symptom}</Text>
          </View>
          
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Visit Status</Text>
            {feedback ? (
              <View style={styles.statusBadge}>
                {visited ? (
                  <CheckCircle2 size={16} color={palette.teal[600]} />
                ) : (
                  <XCircle size={16} color={palette.navy[300]} />
                )}
                <Text style={[styles.statusValue, { color: visited ? palette.teal[700] : palette.navy[500] }]}>
                  {visited ? 'Patient Visited' : 'No-show / Other'}
                </Text>
              </View>
            ) : (
              <View style={styles.statusBadge}>
                <Clock size={16} color={palette.amber[600]} />
                <Text style={[styles.statusValue, { color: palette.amber[700] }]}>Awaiting Feedback</Text>
              </View>
            )}
          </View>
        </View>

        {feedback?.notes && (
          <View style={styles.noteBox}>
             <Text style={styles.noteLabel}>Traveler Note:</Text>
             <Text style={styles.noteText}>"{feedback.notes}"</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Referral History' }} />
      
      <View style={styles.filterBar}>
        {(['today', 'week', 'month', 'all'] as FilterPeriod[]).map((p) => (
          <TouchableOpacity 
            key={p} 
            onPress={() => setPeriod(p)}
            style={[styles.filterBtn, period === p && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, period === p && styles.filterTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.teal[600]} />
        </View>
      ) : (
        <FlatList
          data={referrals}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Search size={48} color={palette.navy[100]} />
              <Text style={styles.emptyTitle}>No referrals found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters or time period.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: palette.navy[25],
    borderWidth: 1,
    borderColor: palette.navy[50],
  },
  filterBtnActive: {
    backgroundColor: palette.teal[600],
    borderColor: palette.teal[600],
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.navy[500],
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: spacing.md,
  },
  referralCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: palette.navy[500],
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  symptomBox: {
    flex: 2,
  },
  statusBox: {
    flex: 3,
    alignItems: 'flex-end',
  },
  symptomLabel: {
    fontSize: 11,
    color: palette.navy[300],
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  symptomValue: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.navy[900],
  },
  statusLabel: {
    fontSize: 11,
    color: palette.navy[300],
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  noteBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.navy[25],
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: palette.navy[100],
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: palette.navy[400],
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 13,
    color: palette.navy[700],
    fontStyle: 'italic',
    lineHeight: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.navy[800],
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: palette.navy[400],
    marginTop: 4,
  }
});
