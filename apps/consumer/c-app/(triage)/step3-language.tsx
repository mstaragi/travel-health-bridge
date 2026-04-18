import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui/tokens';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { track } from '@travelhealthbridge/shared';
import { useTriageStore } from 'store/triageStore';
import { LANGUAGES } from '@travelhealthbridge/shared/constants';
import { Check, Globe } from 'lucide-react-native';

export default function Step3Language() {
  const { languages, setLanguages } = useTriageStore();
  const router = useRouter();
  const startTime = useRef(Date.now());

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleNext = () => {
    if (languages.length > 0) {
      const timeOnStep = Math.round((Date.now() - startTime.current) / 1000);
      track('triage_step_completed', { 
        step_number: 3, 
        value: languages.join(','),
        time_on_step_seconds: timeOnStep
      });
      router.push('/(triage)/step4-symptom');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Preferred language?</Text>
          <Text style={styles.subtitle}>We'll prioritize doctors who speak your language. You can select multiple.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {LANGUAGES.map((lang) => {
              const isActive = languages.includes(lang);
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.pill,
                    isActive && styles.pillActive
                  ]}
                  onPress={() => toggleLanguage(lang)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pillContent}>
                    {isActive ? (
                      <Check size={18} color={palette.white} style={styles.icon} />
                    ) : (
                      <Globe size={18} color={palette.navy[300]} style={styles.icon} />
                    )}
                    <Text style={[
                      styles.pillText,
                      isActive && styles.pillTextActive
                    ]}>
                      {lang}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={`Continue (${languages.length} selected)`}
            onPress={handleNext}
            variant="primary"
            size="lg"
            disabled={languages.length === 0}
            fullWidth
          />
          {languages.length === 0 && (
            <Text style={styles.hintText}>Please select at least one language.</Text>
          )}
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
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.navy[50],
    backgroundColor: palette.white,
    minWidth: '45%',
  },
  pillActive: {
    backgroundColor: palette.teal[600],
    borderColor: palette.teal[600],
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  pillText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: palette.navy[700],
  },
  pillTextActive: {
    color: palette.white,
    fontWeight: typography.fontWeight.black,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  hintText: {
    textAlign: 'center',
    color: palette.rose[500],
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.bold,
  },
});


