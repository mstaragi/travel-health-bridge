import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity, Linking, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTriageStore } from 'store/triageStore';
import { rankProviders } from '@travelhealthbridge/shared/utils/rankProviders';
import { HELPLINE_WHATSAPP_NUMBER, HELPLINE_OPERATING_HOURS } from '@travelhealthbridge/shared/constants';
import { FailureBottomSheet } from '@travelhealthbridge/shared/ui/FailureBottomSheet';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { Phone, MapPin, Clock, Star, AlertCircle, ChevronRight, Navigation, X } from 'lucide-react-native';
import Modal from 'react-native-modal';
import { track } from '@travelhealthbridge/shared';

// Mock data for ranking verification until real DB is active
const MOCK_DATA: any[] = [
  {
    id: 'p1',
    name: 'Apollo Spectra Hospital',
    address: 'Koramangala 5th Block, Bengaluru',
    phone: '9100000001',
    fee_opd: { min: 1200, max: 1500 },
    languages: ['English', 'Hindi', 'Kannada'],
    emergency: true,
    reliability_score: 2,
    specialties: ['General Physician', 'Surgery'],
    badge_status: 'active',
    staleness_tier: 'fresh',
    badge_date: new Date().toISOString(),
    opd_hours: { monday: { open: true, from: '09:00', to: '21:00' } }
  },
  {
    id: 'p2',
    name: 'Sanjeevini Medical Center',
    address: 'Indiranagar 100ft Rd, Bengaluru',
    phone: '9100000002',
    fee_opd: { min: 600, max: 800 },
    languages: ['English', 'Hindi'],
    emergency: false,
    reliability_score: 1.5,
    specialties: ['Pediatrics', 'General Physician'],
    badge_status: 'active',
    staleness_tier: 'fresh',
    badge_date: new Date().toISOString(),
    opd_hours: { monday: { open: true, from: '09:00', to: '18:00' } }
  }
];

export default function ResultScreen() {
  const { city, urgency, languages, symptom, budget, setCallNowTappedAt } = useTriageStore();
  const [results, setResults] = useState<any[]>([]);
  const [showFailure, setShowFailure] = useState(false);
  const [startTime] = useState(Date.now());
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Soft Prompt State
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Perform ranking
    const { primary, secondary, showHelplineCTA } = rankProviders({
      providers: MOCK_DATA as any,
      userLanguages: languages || [],
      urgency: urgency || 'can_wait',
      budget: budget === 'any' ? 2000 : Number(budget) || 1000,
      lat: undefined,
      lng: undefined,
      symptom,
    });

    setResults([primary, secondary].filter(Boolean));
    if (showHelplineCTA) {
      // In a real app we might show a different UI state here
    }

    // Track result viewed
    track('triage_result_viewed', {
      city,
      symptom_category: symptom,
      urgency,
      primary_provider_id: primary?.id,
    });

    // Start 2-minute failure monitor
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 120000) { // 2 minutes
        track('provider_no_answer_reported', {
          provider_id: ranked[0]?.id,
          time_to_failure_seconds: 120
        });
        setShowFailure(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 5000);

    // Track if any providers are stale
    ranked.forEach((p: any) => {
      if (p.last_activity_at && (Date.now() - new Date(p.last_activity_at).getTime() > 14 * 24 * 60 * 60 * 1000)) {
        track('stale_provider_label_shown', { provider_id: p.id });
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    setCallNowTappedAt(Date.now());
    Linking.openURL(`tel:${provider.phone}`);
  };

  const handleDirections = (provider: any, rank: number) => {
    track('directions_tapped', {
      provider_id: provider.id,
      provider_name: provider.name,
      rank: rank
    });
    const url = Platform.select({
      ios: `maps:0,0?q=${provider.name}@${provider.address}`,
      android: `geo:0,0?q=${provider.address}(${provider.name})`
    });
    if (url) Linking.openURL(url);
  };

  const handleHelpline = (context: string) => {
    track('helpline_cta_tapped', { context });
    Linking.openURL(`tel:${HELPLINE_NUMBER}`);
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

        {results.length === 0 ? (
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
                  <Text style={styles.detailText} numberOfLines={1}>{primary.address}</Text>
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
                      <Text style={styles.secondaryDetail} numberOfLines={1}>{secondary.address}</Text>
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
});


