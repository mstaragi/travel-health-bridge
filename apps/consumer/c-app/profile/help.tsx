import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Shield, Lock, Trash2, Info, ChevronRight, MessageSquare, ExternalLink } from 'lucide-react-native';
import { palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui/tokens';
import { useAnalytics } from '@travelhealthbridge/shared';

export default function HelpPrivacyScreen() {
  const router = useRouter();
  const { posthog } = useAnalytics();
  const distinctId = posthog?.getDistinctId() || 'None';

  const handleOpenPrivacy = () => {
    Linking.openURL('https://travelhealthbridge.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy & Help', headerShadowVisible: false }} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Core Privacy Summary (DPDP Act Style) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy Dashboard</Text>
          <Text style={styles.introText}>
            We prioritize your health data privacy. In compliance with India's DPDP Act, you have full control over your information.
          </Text>
          
          <View style={styles.card}>
            <View style={styles.privacyItem}>
              <View style={styles.iconCircle}>
                <Lock size={20} color={palette.teal[600]} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Encryption First</Text>
                <Text style={styles.itemSub}>Your medical vault is encrypted on your device. We cannot read your medical records.</Text>
              </View>
            </View>

            <View style={[styles.privacyItem, styles.borderTop]}>
              <View style={styles.iconCircle}>
                <Shield size={20} color={palette.teal[600]} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Purpose Limitation</Text>
                <Text style={styles.itemSub}>We only collect data required to recommend providers and assist in emergencies.</Text>
              </View>
            </View>

            <View style={[styles.privacyItem, styles.borderTop]}>
              <View style={styles.iconCircle}>
                <Trash2 size={20} color={palette.rose[600]} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Right to Erasure</Text>
                <Text style={styles.itemSub}>Delete your account anytime in Settings to wipe all personal data from our servers.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Data Subject Identifiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Data Identity</Text>
          <View style={styles.idBox}>
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>Anonymized Analytics ID</Text>
              <Text style={styles.idValue} numberOfLines={1}>{distinctId}</Text>
            </View>
            <Text style={styles.idHint}>Provide this ID if you have specific data requests for our support team.</Text>
          </View>
        </View>

        {/* Deep Links */}
        <View style={styles.linksSection}>
          <TouchableOpacity style={styles.linkRow} onPress={handleOpenPrivacy}>
            <View style={styles.linkLeft}>
              <Info size={20} color={palette.navy[600]} />
              <Text style={styles.linkText}>Full Privacy Policy</Text>
            </View>
            <ExternalLink size={16} color={palette.navy[200]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/profile/settings')}>
            <View style={styles.linkLeft}>
              <Trash2 size={20} color={palette.rose[600]} />
              <Text style={styles.linkText}>Manage Data & Deletion</Text>
            </View>
            <ChevronRight size={16} color={palette.navy[200]} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkRow, styles.noBorder]} onPress={() => Linking.openURL('mailto:privacy@travelhealthbridge.com')}>
            <View style={styles.linkLeft}>
              <MessageSquare size={20} color={palette.teal[600]} />
              <Text style={styles.linkText}>Contact Data Protection Officer</Text>
            </View>
            <ExternalLink size={16} color={palette.navy[200]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerInfo}>
          Version 1.0.0 (Production) · Made for travelers in India.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: 14,
    color: palette.navy[400],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: palette.navy[50],
    overflow: 'hidden',
  },
  privacyItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: palette.navy[50],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.navy[25],
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[800],
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 13,
    color: palette.navy[400],
    lineHeight: 18,
  },
  idBox: {
    backgroundColor: palette.navy[900],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  idLabel: {
    fontSize: 12,
    color: palette.navy[200],
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  idValue: {
    fontSize: 12,
    color: palette.white,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  idHint: {
    fontSize: 11,
    color: palette.navy[300],
    lineHeight: 16,
  },
  linksSection: {
    backgroundColor: palette.navy[25],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: palette.navy[700],
  },
  footerInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: palette.navy[200],
    marginTop: spacing.xl,
  },
});


