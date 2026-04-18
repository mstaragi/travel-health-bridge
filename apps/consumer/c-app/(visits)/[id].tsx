import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Tag } from '@travelhealthbridge/shared/ui/Tag';
import { palette, typography, spacing, borderRadius, shadows } from '@travelhealthbridge/shared/ui/tokens';
import { database } from 'db';
import { VisitHistory } from 'db/models/VisitHistory';

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams();
  const [visit, setVisit] = useState<VisitHistory | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadVisit = async () => {
    try {
      const v = await database.get<VisitHistory>('visit_history').find(id as string);
      setVisit(v);
    } catch (e) {
      console.error(e);
    }
  };

  if (!visit) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.teal[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Medical Visit Record' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
           <Text style={styles.date}>{new Date(visit.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
           <Text style={styles.providerName}>{visit.providerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diagnosis & Summary</Text>
          <View style={styles.card}>
            <Text style={styles.diagnosisText}>{visit.diagnosis}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Medical Documents</Text>
          <View style={styles.card}>
            {/* Mock document entries */}
            <TouchableOpacity style={styles.docRow}>
               <Text style={styles.docEmoji}>📄</Text>
               <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>Prescription.pdf</Text>
                  <Text style={styles.docSize}>1.2 MB</Text>
               </View>
               <Text style={styles.download}>View</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.docRow}>
               <Text style={styles.docEmoji}>🖼️</Text>
               <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>Lab_Result.jpg</Text>
                  <Text style={styles.docSize}>840 KB</Text>
               </View>
               <Text style={styles.download}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
           <Text style={styles.label}>Follow-up Instructions</Text>
           <View style={styles.card}>
              <Text style={styles.followupText}>
                Continue prescribed medications for 5 days. Return if fever persists or symptoms worsen.
              </Text>
           </View>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Download Full Report" 
            variant="secondary" 
            onPress={() => {}} 
          />
          <TouchableOpacity style={styles.reportError}>
            <Text style={styles.reportErrorText}>Found an error in this record?</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: palette.teal[700],
    fontWeight: typography.fontWeight.bold,
  },
  providerName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: palette.gray[900],
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: palette.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: palette.gray[0],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  diagnosisText: {
    fontSize: typography.fontSize.md,
    color: palette.gray[800],
    lineHeight: 24,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  docEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  docName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[800],
  },
  docSize: {
    fontSize: 10,
    color: palette.gray[400],
  },
  download: {
    color: palette.teal[700],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray[50],
    marginVertical: spacing.sm,
  },
  followupText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[600],
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
    alignItems: 'center',
  },
  reportError: {
    marginTop: spacing.md,
  },
  reportErrorText: {
    fontSize: typography.fontSize.xs,
    color: palette.gray[400],
    textDecorationLine: 'underline',
  },
});


