import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Switch, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Users, 
  TrendingUp, 
  Star, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react-native';
import { 
  palette, 
  spacing, 
  borderRadius, 
  typography, 
  shadows,
  Card,
  Badge,
  useTheme
} from '@travelhealthbridge/shared/ui';
import { track } from '@travelhealthbridge/shared';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { useAuthStore } from '../../store/authStore';
import { StaleBanner } from '../../components/StaleBanner';
import { StrikeNotice } from '../../components/StrikeNotice';

export default function DashboardScreen() {
  const router = useRouter();
  const { provider, loadProviderProfile } = useAuthStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState({
    referrals_today: 0,
    referrals_week: 0,
    score: 0
  });
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!provider) return;
    
    // 1. Availability
    const { data: avail } = await supabase
      .from('provider_availability')
      .select('status')
      .eq('provider_id', provider.id)
      .single();
    
    if (avail) setIsAvailable(avail.status === 'available');

    // 2. Stats (Primary Only)
    const today = new Date();
    today.setHours(0,0,0,0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [{ count: todayCount }, { count: weekCount }] = await Promise.all([
      supabase
        .from('triage_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('recommended_provider_id', provider.id)
        .gte('created_at', today.toISOString()),
      supabase
        .from('triage_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('recommended_provider_id', provider.id)
        .gte('created_at', weekAgo.toISOString())
    ]);

    setStats({
      referrals_today: todayCount || 0,
      referrals_week: weekCount || 0,
      score: provider.reliability_score || 0
    });

    // 3. Recent 5 Referrals
    const { data: recents } = await supabase
      .from('triage_sessions')
      .select(`
        id,
        created_at,
        symptom,
        feedback (visited_recommended_provider, star_rating)
      `)
      .eq('recommended_provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(5) as any;

    if (recents) setRecentReferrals(recents);

  }, [provider]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (provider?.email) await loadProviderProfile(provider.email);
    await fetchData();
    setIsRefreshing(false);
  };

  const toggleAvailability = async (val: boolean) => {
    if (!provider) return;
    setIsAvailable(val);

    const status = val ? 'available' : 'busy';
    const now = new Date().toISOString();

    // CRITICAL: Update in < 1s
    await Promise.all([
      supabase.from('provider_availability').upsert({
        provider_id: provider.id,
        status,
        updated_at: now
      }),
      supabase.from('providers').update({
        last_activity_at: now
      }).eq('id', provider.id)
    ]);
  };

  if (!provider) return null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <Stack.Screen options={{ title: 'Dashboard', headerTitleStyle: { fontWeight: '800' } }} />

      <StrikeNotice strikeCount={provider.strike_count} />
      <StaleBanner 
        lastActivityAt={provider.last_activity_at} 
        onRefresh={() => toggleAvailability(isAvailable)} 
      />

      {/* Availability Card */}
      <Card style={styles.availabilityCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Live Availability</Text>
            <Text style={styles.cardSubtitle}>Inform travelers if you are currently open for new patients.</Text>
          </View>
          <Switch 
            value={isAvailable} 
            onValueChange={toggleAvailability}
            trackColor={{ false: palette.amber[200], true: palette.teal[600] }}
            thumbColor={isAvailable ? '#fff' : palette.amber[600]}
          />
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: isAvailable ? palette.teal[50] : palette.amber[50] }]}>
          <View style={[styles.dot, { backgroundColor: isAvailable ? palette.teal[600] : palette.amber[600] }]} />
          <Text style={[styles.statusText, { color: isAvailable ? palette.teal[800] : palette.amber[900] }]}>
             Your clinic is currently listed as {isAvailable ? 'AVAILABLE' : 'BUSY'}
          </Text>
        </View>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Users size={20} color={palette.teal[600]} />
          <Text style={styles.statValue}>{stats.referrals_today}</Text>
          <Text style={styles.statLabel}>Referrals Today</Text>
        </View>
        <View style={styles.statBox}>
          <TrendingUp size={20} color={palette.blue[600]} />
          <Text style={styles.statValue}>{stats.referrals_week}</Text>
          <Text style={styles.statLabel}>Referrals This Week</Text>
        </View>
        <View style={styles.statBox}>
          <Star size={20} color={palette.amber[600]} />
          <Text style={styles.statValue}>{stats.score.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Quality Score</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Referrals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/referrals')}>
            <Text style={styles.seeAll}>History</Text>
          </TouchableOpacity>
        </View>
        
        {recentReferrals.length === 0 ? (
          <View style={styles.emptyState}>
             <Calendar size={40} color={palette.navy[100]} />
             <Text style={styles.emptyText}>No referrals recorded yet today.</Text>
          </View>
        ) : (
          recentReferrals.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.referralItem}
              onPress={() => router.push('/(tabs)/referrals')}
            >
              <View style={styles.referralLeft}>
                <View style={styles.iconCircle}>
                   <CheckCircle2 size={16} color={palette.teal[600]} />
                </View>
                <View>
                  <Text style={styles.referralSymptom}>{item.symptom}</Text>
                  <Text style={styles.referralDate}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <View style={styles.referralRight}>
                 {item.feedback?.[0] ? (
                   <Badge 
                     label={item.feedback[0].visited_recommended_provider ? 'Visited' : 'No-show'} 
                     variant={item.feedback[0].visited_recommended_provider ? 'success' : 'neutral'} 
                   />
                 ) : (
                   <Badge label="Awaiting feedback" variant="neutral" />
                 )}
                 <ChevronRight size={16} color={palette.navy[200]} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.md,
  },
  availabilityCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.navy[900],
  },
  cardSubtitle: {
    fontSize: 12,
    color: palette.navy[400],
    marginTop: 2,
    maxWidth: '80%',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: palette.navy[50],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: palette.navy[900],
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.navy[400],
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.navy[800],
  },
  seeAll: {
    fontSize: 14,
    color: palette.teal[700],
    fontWeight: '600',
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
  },
  referralLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: palette.teal[50],
     justifyContent: 'center',
     alignItems: 'center',
  },
  referralSymptom: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.navy[800],
  },
  referralDate: {
    fontSize: 12,
    color: palette.navy[400],
    marginTop: 1,
  },
  referralRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: palette.navy[25],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.navy[100],
  },
  emptyText: {
    color: palette.navy[300],
    marginTop: spacing.md,
    fontSize: 14,
  }
});
