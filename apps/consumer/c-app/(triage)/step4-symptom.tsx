import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTriageStore } from 'store/triageStore';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { track } from '@travelhealthbridge/shared';

const SYMPTOMS = [
  { id: 'fever', label: 'Fever', emoji: '🤒' },
  { id: 'stomach_pain', label: 'Stomach', emoji: '🤢' },
  { id: 'cough', label: 'Cough', emoji: '😷' },
  { id: 'rash', label: 'Rash', emoji: '🩹' },
  { id: 'chest_pain', label: 'Chest Pain', emoji: '🫀' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'injury_pain', label: 'Injury', emoji: '🦴' },
  { id: 'dizziness', label: 'Dizzy', emoji: '🌀' },
  { id: 'other', label: 'Other', emoji: '❓' },
];

export default function Step4Symptom() {
  const { symptom, setSymptom } = useTriageStore();
  const router = useRouter();

  const handleSelect = (symptomId: string) => {
    setSymptom(symptomId);
    // Auto-advance
    setTimeout(() => {
      router.push('/(triage)/step5-budget');
    }, 200);
  };

  const renderItem = ({ item }: { item: typeof SYMPTOMS[0] }) => {
    const isActive = symptom === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isActive && styles.cardActive
        ]}
        onPress={() => handleSelect(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={[
          styles.label,
          isActive && styles.labelActive
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>What's wrong?</Text>
          <Text style={styles.subtitle}>Select the symptom that best describes your main concern.</Text>
        </View>

        <FlatList
          data={SYMPTOMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.footer}>
          <Text style={styles.helpText}>Tapping a symptom will advance you to the next step.</Text>
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
    paddingHorizontal: spacing.xl,
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
  listContent: {
    paddingBottom: spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: palette.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: palette.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  cardActive: {
    borderColor: palette.teal[600],
    backgroundColor: palette.teal[0],
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[700],
    textAlign: 'center',
  },
  labelActive: {
    color: palette.teal[600],
  },
  footer: {
    paddingVertical: spacing.xl,
  },
  helpText: {
    textAlign: 'center',
    color: palette.navy[200],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});


