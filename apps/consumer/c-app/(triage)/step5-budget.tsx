import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { useTriageStore } from 'store/triageStore';
import { useAuthStore } from 'store/authStore';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Input } from '@travelhealthbridge/shared/ui/Input';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { Banknote, MessageCircle, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { track } from '@travelhealthbridge/shared';

const BUDGET_OPTIONS = [
  { label: 'Minimal', value: 500 },
  { label: 'Mid-range', value: 1500 },
  { label: 'Premium', value: 3000 },
  { label: 'Any', value: 10000 },
];

export default function Step5Budget() {
  const { budget, setBudget, whatsappNumber, setWhatsappNumber, urgency, city, symptom } = useTriageStore();
  const { session } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const startTime = useRef(Date.now());

  // Pre-fill WhatsApp if authed
  useEffect(() => {
    if (session?.user?.phone && !whatsappNumber) {
      setWhatsappNumber(session.user.phone);
    }
  }, [session]);

  const handleFinish = async () => {
    setIsLoading(true);
    setError('');

    const timeOnStep = Math.round((Date.now() - startTime.current) / 1000);
    track('triage_step_completed', { 
      step_number: 5, 
      value: budget,
      time_on_step_seconds: timeOnStep
    });
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }

    try {
      const state = await NetInfo.fetch();
      const isOffline = !state.isConnected;

      if (isOffline) {
        track('triage_offline_hit', {
          city,
          symptom_category: symptom,
          urgency
        });

        if (urgency === 'emergency') {
          router.replace('/(tabs)/emergency');
        } else {
          router.push('/(triage)/offline_result');
        }
      } else {
        router.push('/(triage)/result');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.title}>Budget & Contact</Text>
                <Text style={styles.subtitle}>Final details to refine your recommendations.</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Banknote size={20} color={palette.navy[900]} />
                  <Text style={styles.sectionTitle}>Maximum Consultation Fee</Text>
                </View>
                <View style={styles.budgetGrid}>
                  {BUDGET_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.chip,
                        budget === opt.value.toString() && styles.chipActive
                      ]}
                      onPress={() => {
                        setBudget(opt.value.toString());
                        if (Platform.OS === 'ios' || Platform.OS === 'android') {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch (e) {}
                        }
                      }}
                    >
                      <Text style={[
                        styles.chipText,
                        budget === opt.value.toString() && styles.chipTextActive
                      ]}>
                        {opt.label === 'Any' ? 'Any Price' : `₹${opt.value}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MessageCircle size={20} color={palette.navy[900]} />
                  <Text style={styles.sectionTitle}>WhatsApp Number (Optional)</Text>
                </View>
                <Text style={styles.fieldHint}>We'll send your recommendation via WhatsApp for easy access.</Text>
                <Input
                  value={whatsappNumber || ''}
                  onChangeText={setWhatsappNumber}
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  wrapperStyle={styles.inputWrapper}
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                title="Find My Doctor"
                onPress={handleFinish}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!budget}
                fullWidth
                icon={<Search size={20} color={palette.white} />}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 20 : 40,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: palette.navy[400],
    lineHeight: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  fieldHint: {
    fontSize: typography.fontSize.sm,
    color: palette.navy[400],
    marginBottom: spacing.md,
  },
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    minWidth: '45%',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
  chipActive: {
    borderColor: palette.teal[600],
    backgroundColor: palette.teal[0],
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: palette.navy[700],
  },
  chipTextActive: {
    color: palette.teal[600],
    fontWeight: typography.fontWeight.black,
  },
  inputWrapper: {
    borderRadius: 16,
    backgroundColor: palette.navy[50],
    borderWidth: 0,
  },
  footer: {
    paddingVertical: spacing.xl,
    backgroundColor: palette.white,
  },
  errorText: {
    color: palette.rose[600],
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.bold,
  },
});


