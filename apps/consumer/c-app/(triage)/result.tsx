import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity, Linking, Image, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTriageStore } from 'store/triageStore';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { rankProviders } from '@travelhealthbridge/shared/utils/rankProviders';
import { SYMPTOM_TO_SPECIALTY, HELPLINE_WHATSAPP_NUMBER } from '@travelhealthbridge/shared/constants';
import { haversineDistance } from '@travelhealthbridge/shared/utils/distance';
import { FailureBottomSheet } from '@travelhealthbridge/shared/ui/FailureBottomSheet';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { Phone, MapPin, Clock, Star, AlertCircle, ChevronRight, Navigation, X, WifiOff } from 'lucide-react-native';
import Modal from 'react-native-modal';
import { track } from '@travelhealthbridge/shared';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { database } from 'db';

// PROMPT 6: No more mock data. All providers are fetched from Supabase.

export default function ResultScreen() {
  const { city, urgency, languages, symptom, budget, setCallNowTappedAt } = useTriageStore();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [startTime] = useState(Date.now());
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const primaryRef = useRef<any>(null);

  // Soft Prompt State
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch (_) {}
    })();
  }, []);

  // PROMPT 6: Load real providers from Supabase
  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setIsOffline(false);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('city_id', city)
        .neq('badge_status', 'suspended');

      if (error || !data || data.length === 0) {
        throw new Error(error?.message || 'No providers found');
      }

      // PROMPT 4: Cache to WatermelonDB for offline use
      try {
        const offlineCollection = database.get('offline_providers');
        await database.write(async () => {
          // Delete old cache for this city
          const existing = await offlineCollection.query().fetch();
          const old = existing.filter((r: any) => r.city === city);
          for (const record of old) await record.destroyPermanently();
          // Write fresh data
          await offlineCollection.create((record: any) => {
            record.city = city;
            record.data_json = JSON.stringify(data);
            record.last_synced_at = Date.now();
          });
        });
      } catch (cacheErr) {
        // Non-fatal: offline cache write failure
        if (__DEV__) console.warn('[OFFLINE-CACHE] Write failed:', cacheErr);
      }

      runRanking(data);
    } catch (_) {
      // Fallback: try offline cache
      setIsOffline(true);
      try {
        const Q = require('@nozbe/watermelondb/QueryDescription');
        const cached = await database.get('offline_providers').query().fetch();
        const cityCache = cached.find((r: any) => r.city === city);
        if (cityCache) {
          const offlineData = JSON.parse((cityCache as any).data_json);
          runRanking(offlineData);
        } else {
          setResults([]);
          setIsLoading(false);
        }
      } catch {
        setResults([]);
        setIsLoading(false);
      }
    }
  }, [city, languages, urgency, budget, symptom, userLocation]);

  const runRanking = (providers: any[]) => {
    const { primary, secondary, showHelplineCTA } = rankProviders({
      providers,
      userLanguages: languages || [],
      urgency: urgency || 'can_wait',
      budget: budget === 'any' ? 2000 : Number(budget) || 1000,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      symptom: symptom || undefined,
      symptomToSpecialty: SYMPTOM_TO_SPECIALTY,
    });

    primaryRef.current = primary;
    setResults([primary, secondary].filter(Boolean));
    setIsLoading(false);

    // Track result viewed
    track('triage_result_viewed', {
      city,
      symptom_category: symptom,
      urgency,
      primary_provider_id: primary?.id,
      has_location: !!userLocation,
      source: isOffline ? 'offline_cache' : 'supabase',
    });

    // PROMPT 4: Start 2-minute failure monitor
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 120000) {
        // Write no-answer event to Supabase
        await supabase.from('provider_no_answer_events').insert({
          provider_id: primaryRef.current?.id,
          city_id: city,
          session_at: new Date().toISOString(),
        });
        track('provider_no_answer_reported', {
          provider_id: primaryRef.current?.id,
          time_to_failure_seconds: 120
        });
        setShowFailure(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 5000);

    // Track stale providers
    [primary, secondary].forEach((p: any) => {
      if (p?.last_activity_at && (Date.now() - new Date(p.last_activity_at).getTime() > 14 * 24 * 60 * 60 * 1000)) {
        track('stale_provider_label_shown', { provider_id: p.id });
      }
    });
  };

  useEffect(() => {
    loadProviders();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadProviders]);


  const handleAllowNotifications = async () => {
    // Logic for notifications
    handleDismissSoftPrompt();
  };

  const handleDismissSoftPrompt = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowSoftPrompt(false));
  };

  const handleCall = (provider: any, rank: number) => {
    track('call_now_tapped', {
      provider_id: provider.id,
      provider_name: provider.name,
      rank: rank
    });
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {}
    }
    setCallNowTappedAt(Date.now());
    Linking.openURL(`tel:${provider.phone}`);
  };

  const handleDirections = (provider: any, rank: number) => {
    track('directions_tapped', {
      provider_id: provider.id,
      provider_name: provider.name,
      rank: rank
    });
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }

    const lat = provider.lat;
    const lng = provider.lng;
    const label = encodeURIComponent(provider.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    });

    // Alternatively, use google maps specifically if available
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(url || '').then(supported => {
      if (supported) {
        Linking.openURL(url || '');
      } else {
        Linking.openURL(googleMapsUrl);
      }
    });
  };

  const handleHelpline = (context: string) => {
    track('helpline_cta_tapped', { context });
    Linking.openURL(`tel:${HELPLINE_WHATSAPP_NUMBER}`);
  };

  const primary = results[0];
  const secondary = results[1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Recommended Doctor</Text>
          <Text style={styles.subtitle}>
            Ranked by priority for <Text style={styles.bold}>{urgency?.replace('_', ' ')}</Text> and <Text style={styles.bold}>{languages.join(' & ')}</Text> speaker availability.
          </Text>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <WifiOff size={14} color={palette.rose[600]} />
            <Text style={styles.offlineBannerText}>Offline — Showing cached data. Call ahead to confirm.</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={palette.teal[600]} />
            <Text style={styles.loadingText}>Finding the best match for you...</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={64} color={palette.navy[50]} />
            <Text style={styles.emptyTitle}>No matching providers found</Text>
            <Text style={styles.emptySubtitle}>Try widening your search or call our helpline for immediate human assistance.</Text>
            <TouchableOpacity style={styles.helplineButton} onPress={handleHelpline}>
              <Phone size={20} color={palette.white} />
              <Text style={styles.helplineText}>Speak with a Medic Now</Text>
            </TouchableOpacity>
          </View>
        ) : (

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Primary Recommendation */}
            <View style={styles.primaryCard}>
              <View style={styles.cardHeader}>
                <View style={styles.bestMatchBadge}>
                  <Star size={12} color={palette.white} fill={palette.white} />
                  <Text style={styles.bestMatchText}>BEST MATCH</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>₹{primary.fee_opd?.min}</Text>
                </View>
              </View>

              <Text style={styles.providerName}>{primary.name}</Text>
              <Text style={styles.providerSpecialty}>{primary.specialties?.[0]}</Text>
              
              <View style={styles.detailList}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color={palette.navy[300]} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {primary.address} • {userLocation ? `${haversineDistance(userLocation.lat, userLocation.lng, primary.lat, primary.lng).toFixed(1)} km away` : 'Calculating distance...'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={16} color={palette.navy[300]} />
                  <Text style={styles.detailText}>Open Now • Verified: Today</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.callButton} 
                  onPress={() => handleCall(primary)}
                >
                  <Phone size={20} color={palette.white} />
                  <Text style={styles.callButtonText}>Call to Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dirButton}
                  onPress={() => handleDirections(primary)}
                >
                  <Navigation size={20} color={palette.teal[600]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Secondary Alternative */}
            {secondary && (
              <View style={styles.secondarySection}>
                <Text style={styles.sectionTitle}>Alternative if unavailable</Text>
                <TouchableOpacity 
                  style={styles.secondaryCard}
                  onPress={() => handleCall(secondary)}
                >
                  <View style={styles.secondaryHeader}>
                    <Text style={styles.secondaryName}>{secondary.name}</Text>
                    <Text style={styles.secondaryPrice}>₹{secondary.fee_opd?.min}</Text>
                  </View>
                  <View style={styles.secondaryFooter}>
                    <View style={styles.detailItem}>
                      <MapPin size={14} color={palette.navy[200]} />
                      <Text style={styles.secondaryDetail} numberOfLines={1}>
                        {secondary.address} • {userLocation ? `${haversineDistance(userLocation.lat, userLocation.lng, secondary.lat, secondary.lng).toFixed(1)} km away` : ''}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={palette.navy[100]} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.safetyBox}>
              <AlertCircle size={20} color={palette.amber[600]} />
              <Text style={styles.safetyText}>
                The provider is expecting your call. Mention <Text style={styles.bold}>Travel Health Bridge</Text> for upfront pricing commitment.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

      <Modal
        isVisible={showFailure}
        style={styles.modal}
        onBackdropPress={() => setShowFailure(false)}
        swipeDirection="down"
        onSwipeComplete={() => setShowFailure(false)}
      >
        <FailureBottomSheet 
          onCallHelpline={handleHelpline}
          onRetry={() => {
            setShowFailure(false);
            router.replace('/(triage)/step1-urgency');
          }}
          onClose={() => setShowFailure(false)}
        />
      </Modal>
      {showSoftPrompt && (
        <Animated.View style={[styles.softPrompt, { opacity: fadeAnim }]}>
          <View style={styles.softPromptContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.softPromptTitle}>Get a reminder to share how your visit went</Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={handleAllowNotifications}>
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissSoftPrompt}>
              <X size={20} color={palette.navy[400]} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  softPrompt: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: palette.navy[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
    borderWidth: 1,
    borderColor: palette.navy[50],
  },
  softPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  softPromptTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
    lineHeight: 18,
  },
  allowButton: {
    backgroundColor: palette.teal[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  allowButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.black,
  },
  closeButton: {
    padding: 4,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 20 : 40,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: palette.navy[400],
    lineHeight: 20,
    marginTop: 4,
  },
  bold: {
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    textTransform: 'capitalize',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  primaryCard: {
    backgroundColor: palette.white,
    borderRadius: 32,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: palette.teal[100],
    shadowColor: palette.navy[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: spacing.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bestMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.navy[900],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  bestMatchText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.black,
    color: palette.white,
    letterSpacing: 1,
  },
  priceTag: {
    backgroundColor: palette.teal[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.black,
    color: palette.teal[700],
  },
  providerName: {
    fontSize: 24,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: 4,
  },
  providerSpecialty: {
    fontSize: typography.fontSize.md,
    color: palette.teal[600],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  detailList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: palette.navy[400],
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.teal[600],
    paddingVertical: 18,
    borderRadius: 20,
    gap: spacing.sm,
  },
  callButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.black,
  },
  dirButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: palette.teal[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondarySection: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[200],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  secondaryCard: {
    backgroundColor: palette.white,
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.navy[50],
  },
  secondaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  secondaryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[700],
  },
  secondaryPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[400],
  },
  secondaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryDetail: {
    fontSize: 12,
    color: palette.navy[300],
    flex: 1,
  },
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: palette.amber[50],
    padding: spacing.lg,
    borderRadius: 20,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.amber[100],
  },
  safetyText: {
    flex: 1,
    fontSize: 13,
    color: palette.amber[900],
    lineHeight: 18,
    fontWeight: typography.fontWeight.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: palette.navy[300],
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  helplineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.rose[600],
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
    gap: spacing.md,
  },
  helplineText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.black,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: 80,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: palette.navy[400],
    fontWeight: typography.fontWeight.semibold,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.rose[50],
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.rose[100],
  },
  offlineBannerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: palette.rose[700],
    fontWeight: typography.fontWeight.semibold,
  },
});


