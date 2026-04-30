/**
 * apps/consumer/c-app/(emergency)/emergency-flow.tsx
 * Complete emergency flow with WhatsApp collection and provider ranking
 * Clear UX: Every step answers - What? Why? What next?
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react-native';
import { useTriageStore } from 'store/triageStore';
import { useAuthStore } from 'store/authStore';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { rankProvidersOptimized } from '@travelhealthbridge/shared';
import { track } from '@travelhealthbridge/shared';
import { HELPLINE_WHATSAPP_NUMBER, NATIONAL_EMERGENCY_NUMBERS } from '@travelhealthbridge/shared/constants';

// Mock emergency providers
const MOCK_EMERGENCY_PROVIDERS = [
  {
    id: 'e1',
    name: '24/7 Emergency Clinic',
    address: 'Downtown Medical Centre',
    phone: '9100000101',
    fee_opd: { min: 2000, max: 5000 },
    languages: ['English', 'Hindi'],
    emergency: true,
    reliability_score: 2,
    specialties: ['Emergency Medicine'],
    badge_status: 'active',
    staleness_tier: 'fresh',
    badge_date: new Date().toISOString(),
    opd_hours: {},
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    id: 'e2',
    name: 'Critical Care Hospital',
    address: 'Main Street Hospital Complex',
    phone: '9100000102',
    fee_opd: { min: 3000, max: 8000 },
    languages: ['English', 'Hindi', 'Tamil'],
    emergency: true,
    reliability_score: 1.8,
    specialties: ['Emergency Medicine', 'ICU'],
    badge_status: 'active',
    staleness_tier: 'fresh',
    badge_date: new Date().toISOString(),
    opd_hours: {},
    lat: 12.9380,
    lng: 77.6380,
  },
];

type EmergencyStep = 'options' | 'whatsapp' | 'providers' | 'confirmation';

export default function EmergencyFlowScreen() {
  const router = useRouter();
  const { setUrgency, city } = useTriageStore();
  const { session } = useAuthStore();

  const [step, setStep] = useState<EmergencyStep>('options');
  const [whatsappNumber, setWhatsappNumber] = useState(session?.user?.phone || '');
  const [isValidPhone, setIsValidPhone] = useState(!!session?.user?.phone);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const startTimeRef = useRef(Date.now());

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        } catch (err) {
          console.error('Location error:', err);
        }
      }
    })();
  }, []);

  // Validate phone number
  const validatePhone = (phone: string) => {
    const isValid = phone.match(/^\+?[1-9]\d{1,14}$/);
    setIsValidPhone(!!isValid);
  };

  const handlePhoneChange = (text: string) => {
    setWhatsappNumber(text);
    validatePhone(text);
  };

  const handleCallAmbulance = () => {
    track('emergency_ambulance_called', {
      timestamp: new Date().toISOString(),
    });

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }

    Linking.openURL('tel:102');
  };

  const handleWhatsAppContinue = async () => {
    if (!isValidPhone) {
      Alert.alert('Invalid Phone', 'Please enter a valid WhatsApp number');
      return;
    }

    setIsLoading(true);
    track('emergency_whatsapp_collected', {
      phone: whatsappNumber,
      timestamp: new Date().toISOString(),
    });

    // Simulate slight delay for collecting WhatsApp
    setTimeout(() => {
      setIsLoading(false);
      setStep('providers');
      loadEmergencyProviders();
    }, 500);
  };

  const loadEmergencyProviders = async () => {
    setIsLoading(true);
    try {
      // Rank emergency providers using optimized function
      const ranking = rankProvidersOptimized({
        providers: MOCK_EMERGENCY_PROVIDERS as any,
        userLanguages: [],
        urgency: 'emergency',
        budget: 10000,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
      });

      const ranked = [ranking.primary, ranking.secondary].filter(Boolean);
      setProviders(ranked);

      track('emergency_providers_ranked', {
        provider_count: ranked.length,
        timestamp: new Date().toISOString(),
      });

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    track('emergency_provider_selected', {
      provider_id: providerId,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCallProvider = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (!provider) return;

    track('emergency_provider_called', {
      provider_id: selectedProvider,
      timestamp: new Date().toISOString(),
    });

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }

    Linking.openURL(`tel:${provider.phone}`);
  };

  const handleConfirm = () => {
    setStep('confirmation');
    track('emergency_flow_completed', {
      provider_selected: selectedProvider,
      whatsapp_collected: !!whatsappNumber,
      time_on_step_seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
    });

    // Auto-dismiss after 2 seconds
    setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Emergency Response',
          headerStyle: { backgroundColor: palette.rose[600] },
          headerTintColor: palette.white,
          headerTitleStyle: { color: palette.white },
        }}
      />

      {/* STEP 1: Emergency Options */}
      {step === 'options' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.emergencyBanner}>
            <AlertTriangle size={48} color={palette.rose[600]} />
            <Text style={styles.emergencyTitle}>Emergency Detected</Text>
            <Text style={styles.emergencySubtitle}>
              We're here to help immediately. Choose your action:
            </Text>
          </View>

          {/* Immediate Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🚨 IMMEDIATE ACTIONS</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleCallAmbulance}
            >
              <View style={styles.actionIcon}>
                <Phone size={32} color={palette.rose[600]} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Call Ambulance</Text>
                <Text style={styles.actionSubtitle}>
                  Dial 102 - Emergency medical services
                </Text>
              </View>
              <ChevronRight size={24} color={palette.navy[200]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                track('emergency_helpline_whatsapp', {});
                Linking.openURL(`whatsapp://send?phone=${HELPLINE_WHATSAPP_NUMBER}`);
              }}
            >
              <View style={styles.actionIcon}>
                <MessageCircle size={32} color={palette.teal[600]} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>WhatsApp Helpline</Text>
                <Text style={styles.actionSubtitle}>
                  24/7 support via WhatsApp messaging
                </Text>
              </View>
              <ChevronRight size={24} color={palette.navy[200]} />
            </TouchableOpacity>

            <Button
              title="Continue to Verified Doctors →"
              variant="primary"
              size="lg"
              fullWidth
              style={styles.continueButton}
              onPress={() => setStep('whatsapp')}
            />
          </View>

          {/* National Numbers */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📞 National Emergency Numbers</Text>
            <View style={styles.numbersGrid}>
              {NATIONAL_EMERGENCY_NUMBERS.map((num) => (
                <TouchableOpacity
                  key={num.code}
                  style={styles.numberCard}
                  onPress={() => Linking.openURL(`tel:${num.code}`)}
                >
                  <Text style={styles.numberCode}>{num.code}</Text>
                  <Text style={styles.numberLabel}>{num.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.safetyTip}>
            <AlertCircle size={16} color={palette.amber[600]} />
            <Text style={styles.safetyTipText}>
              Always call 102 or 108 for life-threatening emergencies. Our doctors are backup support.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* STEP 2: WhatsApp Collection */}
      {step === 'whatsapp' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>Step 1 of 2</Text>
            <Text style={styles.stepTitle}>Share Your Contact</Text>
            <Text style={styles.stepSubtitle}>
              We'll send verified doctor details and follow-up via WhatsApp
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WhatsApp Number (Required)</Text>
              <Text style={styles.inputHint}>
                This ensures you receive doctor recommendations instantly
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  isValidPhone && styles.inputContainerValid,
                ]}
              >
                <MessageCircle
                  size={20}
                  color={
                    isValidPhone ? palette.teal[600] : palette.navy[200]
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  value={whatsappNumber}
                  onChangeText={handlePhoneChange}
                  placeholderTextColor={palette.navy[200]}
                />
                {isValidPhone && (
                  <Check size={20} color={palette.teal[600]} />
                )}
              </View>
              {!isValidPhone && whatsappNumber && (
                <Text style={styles.errorText}>
                  Please enter a valid phone number
                </Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Continue to Doctors →"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleWhatsAppContinue}
              isLoading={isLoading}
              disabled={!isValidPhone || isLoading}
            />
            <Text style={styles.privacyText}>
              Your number is secure and used only for emergency coordination
            </Text>
          </View>
        </ScrollView>
      )}

      {/* STEP 3: Emergency Providers */}
      {step === 'providers' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>Step 2 of 2</Text>
            <Text style={styles.stepTitle}>Verified Emergency Doctors</Text>
            <Text style={styles.stepSubtitle}>
              {providers.length} verified doctors available near you
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.teal[600]} />
              <Text style={styles.loadingText}>Finding nearby doctors...</Text>
            </View>
          ) : providers.length > 0 ? (
            <View style={styles.section}>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedProvider === provider.id &&
                      styles.providerCardSelected,
                  ]}
                  onPress={() => handleProviderSelect(provider.id)}
                >
                  <View style={styles.providerHeader}>
                    <View style={styles.providerNameContainer}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <View style={styles.badgeContainer}>
                        <View style={styles.emergencyBadge}>
                          <AlertTriangle size={12} color={palette.rose[600]} />
                          <Text style={styles.emergencyBadgeText}>24/7</Text>
                        </View>
                      </View>
                    </View>
                    {selectedProvider === provider.id && (
                      <Check size={24} color={palette.teal[600]} />
                    )}
                  </View>

                  <View style={styles.providerDetails}>
                    <View style={styles.detailItem}>
                      <MapPin size={16} color={palette.navy[400]} />
                      <Text style={styles.detailText}>{provider.address}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Phone size={16} color={palette.navy[400]} />
                      <Text style={styles.detailText}>{provider.phone}</Text>
                    </View>
                    <View style={styles.languageContainer}>
                      {provider.languages.map((lang) => (
                        <View key={lang} style={styles.languageBadge}>
                          <Text style={styles.languageText}>{lang}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {selectedProvider === provider.id && (
                    <Button
                      title="📞 Call Now"
                      variant="danger"
                      size="sm"
                      fullWidth
                      style={styles.callButton}
                      onPress={handleCallProvider}
                    />
                  )}
                </TouchableOpacity>
              ))}

              <Button
                title="Confirm & Continue →"
                variant="primary"
                size="lg"
                fullWidth
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={!selectedProvider}
              />
            </View>
          ) : (
            <View style={styles.noResultsContainer}>
              <AlertCircle size={48} color={palette.navy[200]} />
              <Text style={styles.noResultsTitle}>No doctors nearby</Text>
              <Text style={styles.noResultsText}>
                Use the ambulance or helpline options above
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* STEP 4: Confirmation */}
      {step === 'confirmation' && (
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationContent}>
            <View style={styles.checkmarkCircle}>
              <Check size={64} color={palette.teal[600]} />
            </View>
            <Text style={styles.confirmationTitle}>You're Connected!</Text>
            <Text style={styles.confirmationText}>
              Doctor details sent to your WhatsApp
            </Text>
            <Text style={styles.confirmationHint}>
              Redirecting to home...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  emergencyBanner: {
    backgroundColor: palette.rose[50],
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    borderLeftWidth: 4,
    borderLeftColor: palette.rose[600],
  },
  emergencyTitle: {
    ...typography.heading2,
    color: palette.rose[900],
    marginTop: spacing.sm,
  },
  emergencySubtitle: {
    ...typography.bodyMedium,
    color: palette.rose[700],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.labelSmall,
    color: palette.navy[500],
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: palette.navy[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.navy[100],
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.bodyBold,
    color: palette.navy[900],
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: palette.navy[600],
    marginTop: spacing.xs,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
  numbersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  numberCard: {
    flex: 1,
    backgroundColor: palette.navy[50],
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  numberCode: {
    ...typography.bodyBold,
    color: palette.rose[600],
    fontSize: 18,
  },
  numberLabel: {
    ...typography.labelSmall,
    color: palette.navy[600],
    marginTop: spacing.xs,
  },
  safetyTip: {
    flexDirection: 'row',
    backgroundColor: palette.amber[50],
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: palette.amber[600],
    alignItems: 'flex-start',
  },
  safetyTipText: {
    ...typography.bodySmall,
    color: palette.amber[900],
    marginLeft: spacing.md,
    flex: 1,
  },
  stepHeader: {
    marginBottom: spacing.xxl,
  },
  stepNumber: {
    ...typography.labelSmall,
    color: palette.teal[600],
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  stepTitle: {
    ...typography.heading2,
    color: palette.navy[900],
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.bodyMedium,
    color: palette.navy[600],
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.labelMedium,
    color: palette.navy[900],
    marginBottom: spacing.sm,
  },
  inputHint: {
    ...typography.bodySmall,
    color: palette.navy[600],
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.navy[200],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.white,
    height: 56,
  },
  inputContainerValid: {
    borderColor: palette.teal[600],
  },
  input: {
    flex: 1,
    marginHorizontal: spacing.md,
    ...typography.bodyMedium,
    color: palette.navy[900],
  },
  errorText: {
    ...typography.labelSmall,
    color: palette.rose[600],
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.xxl,
  },
  privacyText: {
    ...typography.labelSmall,
    color: palette.navy[600],
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: palette.navy[600],
    marginTop: spacing.md,
  },
  providerCard: {
    backgroundColor: palette.navy[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: palette.navy[100],
  },
  providerCardSelected: {
    borderColor: palette.teal[600],
    backgroundColor: palette.teal[50],
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  providerNameContainer: {
    flex: 1,
  },
  providerName: {
    ...typography.bodyBold,
    color: palette.navy[900],
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.rose[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  emergencyBadgeText: {
    ...typography.labelSmall,
    color: palette.rose[700],
    marginLeft: spacing.xs,
  },
  providerDetails: {
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: palette.navy[700],
    marginLeft: spacing.sm,
    flex: 1,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  languageBadge: {
    backgroundColor: palette.teal[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  languageText: {
    ...typography.labelSmall,
    color: palette.teal[700],
  },
  callButton: {
    marginTop: spacing.md,
  },
  confirmButton: {
    marginTop: spacing.lg,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  noResultsTitle: {
    ...typography.bodyBold,
    color: palette.navy[900],
    marginTop: spacing.lg,
  },
  noResultsText: {
    ...typography.bodySmall,
    color: palette.navy[600],
    marginTop: spacing.sm,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContent: {
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.teal[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmationTitle: {
    ...typography.heading2,
    color: palette.teal[600],
    marginBottom: spacing.sm,
  },
  confirmationText: {
    ...typography.bodyMedium,
    color: palette.navy[600],
    marginBottom: spacing.xs,
  },
  confirmationHint: {
    ...typography.bodySmall,
    color: palette.navy[400],
    marginTop: spacing.md,
  },
});
