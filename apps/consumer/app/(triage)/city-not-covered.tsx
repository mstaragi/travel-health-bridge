import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { ShieldCheck, MapPinOff, ArrowLeft, Mail, ExternalLink } from 'lucide-react-native';

export default function CityNotCovered() {
  const router = useRouter();

  const handleJoinWaitlist = () => {
    // In a real app, this would be a form or API call
    Linking.openURL('https://travelhealthbridge.com/waitlist');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={palette.navy[900]} />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <MapPinOff size={32} color={palette.navy[400]} />
          </View>
          <Text style={styles.title}>City not covered yet</Text>
          <Text style={styles.subtitle}>
            We're expanding fast across India. While we don't have verified providers here yet, your safety is still our priority.
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.safetyCard}>
            <View style={styles.cardHeader}>
              <ShieldCheck size={20} color={palette.teal[600]} />
              <Text style={styles.cardTitle}>Traveler Safety Checklist</Text>
            </View>
            
            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <View style={styles.dot} />
                <Text style={styles.checkText}>Consult your hotel reception/host for their trusted local doctor.</Text>
              </View>
              <View style={styles.checkItem}>
                <View style={styles.dot} />
                <Text style={styles.checkText}>Always confirm consultation fees before the doctor arrives.</Text>
              </View>
              <View style={styles.checkItem}>
                <View style={styles.dot} />
                <Text style={styles.checkText}>Request a digital or paper receipt for insurance claims.</Text>
              </View>
              <View style={styles.checkItem}>
                <View style={styles.dot} />
                <Text style={styles.checkText}>Keep your embassy's emergency number saved.</Text>
              </View>
            </View>
          </View>

          <View style={styles.waitlistCard}>
            <Mail size={24} color={palette.navy[900]} />
            <Text style={styles.waitlistTitle}>Notify me when you launch here</Text>
            <Button
              title="Join Waitlist"
              onPress={handleJoinWaitlist}
              variant="secondary"
              size="md"
              icon={<ExternalLink size={16} color={palette.navy[900]} />}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Back to City Selection"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
          />
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
    marginTop: Platform.OS === 'ios' ? 10 : 20,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: palette.navy[400],
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  safetyCard: {
    backgroundColor: palette.teal[50],
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.black,
    color: palette.teal[900],
  },
  checklist: {
    gap: spacing.md,
  },
  checkItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.teal[600],
    marginTop: 8,
  },
  checkText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: palette.teal[900],
    lineHeight: 20,
    fontWeight: typography.fontWeight.medium,
  },
  waitlistCard: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: palette.navy[50],
    alignItems: 'center',
    gap: spacing.md,
  },
  waitlistTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.xl,
  },
});
