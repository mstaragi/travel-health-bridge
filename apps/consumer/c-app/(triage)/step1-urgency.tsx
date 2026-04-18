import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTriageStore } from 'store/triageStore';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { AlertTriangle, Clock, Calendar } from 'lucide-react-native';
import { track } from '@travelhealthbridge/shared';

const URGENCY_OPTIONS = [
  {
    level: 'emergency' as const,
    title: 'Emergency',
    subtitle: 'Life-threatening or severe injury',
    icon: <AlertTriangle size={32} color={palette.rose[600]} />,
    color: palette.rose[600],
    bgColor: palette.rose[50],
  },
  {
    level: 'urgent' as const,
    title: 'Urgent Today',
    subtitle: 'Unwell but stable; need care now',
    icon: <Clock size={32} color={palette.amber[600]} />,
    color: palette.amber[600],
    bgColor: palette.amber[50],
  },
  {
    level: 'can_wait' as const,
    title: 'Can Wait',
    subtitle: 'Minor issue; care in 24-48 hours',
    icon: <Calendar size={32} color={palette.teal[600]} />,
    color: palette.teal[600],
    bgColor: palette.teal[50],
  },
];

export default function Step1Urgency() {
  const { setUrgency, resetSession } = useTriageStore();
  const router = useRouter();
  const startTime = useRef(Date.now());

  useEffect(() => {
    track('triage_started', { source: 'search' });
  }, []);

  const handleSelect = (level: 'emergency' | 'urgent' | 'can_wait') => {
    const timeOnStep = Math.round((Date.now() - startTime.current) / 1000);
    
    // Track completion
    track('triage_step_completed', { 
      step_number: 1, 
      value: level,
      time_on_step_seconds: timeOnStep
    });

    // Reset any previous triage session data when starting fresh
    resetSession();
    setUrgency(level);

    if (level === 'emergency') {
      router.replace('/(tabs)/emergency');
    } else {
      router.push('/(triage)/step2-city');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>How urgent is it?</Text>
          <Text style={styles.subtitle}>Select the level that best describes your current situation.</Text>
        </View>

        <View style={styles.optionsContainer}>
          {URGENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.level}
              style={[
                styles.card,
                { borderColor: option.color, backgroundColor: option.bgColor }
              ]}
              onPress={() => handleSelect(option.level)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: palette.white }]}>
                  {option.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.cardTitle, { color: option.color }]}>{option.title}</Text>
                  <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.helpText}>
            Unsure? Select <Text style={{ fontWeight: 'bold' }}>Urgent Today</Text> and we'll help you decide.
          </Text>
        </View>
      </View>
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
    padding: spacing.xl,
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
  optionsContainer: {
    gap: spacing.lg,
  },
  card: {
    minHeight: 100,
    borderWidth: 2,
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: palette.navy[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.black,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: palette.navy[500],
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  helpText: {
    textAlign: 'center',
    color: palette.navy[300],
    fontSize: typography.fontSize.sm,
  },
});


