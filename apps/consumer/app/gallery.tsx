/**
 * Component Gallery — Prompt 2 Verification Screen
 *
 * Shows all shared UI components in all states.
 * Verifies:
 *  - HelplineCTA plain text number visible without tapping
 *  - Dark mode on all components
 *  - ConsentMessageModal correct message preview
 *  - Emergency button 72px min-height
 *  - All OpenStatusBadge variants
 *
 * Access via: Navigate to /gallery in consumer app (development only).
 */
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  useColorScheme,
  Switch,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  Button,
  Card,
  Tag,
  LanguagePill,
  Badge,
  OpenStatusBadge,
  Input,
  OTPInput,
  Skeleton,
  ProviderCardSkeleton,
  Toast,
  ToastProvider,
  HelplineCTA,
  ProviderCard,
  OfflineProviderCard,
  FailureBottomSheet,
  ConsentMessageModal,
  QuickCaseModal,
  DailySummaryCard,
  spacing,
  typography,
  useTheme,
  palette,
} from '@travelhealthbridge/shared/ui';

// -- Mock data -------------------------------------------------

const MOCK_PROVIDER = {
  id: 'p1',
  slug: 'apollo-cp',
  name: 'Apollo Clinic Connaught Place',
  city_id: 'delhi',
  area: 'Connaught Place',
  address: 'N-110, Connaught Place, New Delhi',
  phone: '011-47600000',
  languages: ['English', 'Hindi'],
  specialties: ['General Physician', 'Travel Medicine'],
  doctors: [{ name: 'Dr. Rajan Mehta', qualification: 'MBBS, MD', specialty: 'General Physician' }],
  opd_hours: {},
  fee_opd: { min: 400, max: 600 },
  emergency: true,
  badge_status: 'active' as const,
  badge_date: '2025-12-01',
  badge_expiry: '2026-12-01',
  last_activity_at: new Date().toISOString(),
  staleness_tier: 'fresh' as const,
  strike_count: 0,
  verified: true,
};

const MOCK_STALE_PROVIDER = {
  ...MOCK_PROVIDER,
  id: 'p2',
  name: 'Paharganj Health Hub',
  area: 'Paharganj',
  staleness_tier: 'stale' as const,
};

const MOCK_OFFLINE_PROVIDER = {
  id: 'op1',
  provider_id: 'p1',
  city: 'Delhi',
  symptom_cluster: 'fever_infection',
  provider_name: 'Apollo Clinic (Offline Cache)',
  provider_phone: '011-47600000',
  provider_address: 'N-110, Connaught Place',
  provider_open_status: 'unconfirmed' as const,
  languages: ['English', 'Hindi'],
  fee_opd_min: 400,
  fee_opd_max: 600,
  emergency: true,
  last_synced_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

// -- Section header ---------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: spacing['2xl'] }}>
      <View
        style={{
          backgroundColor: theme.primary,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.xs,
          borderRadius: 4,
          marginBottom: spacing.base,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: typography.fontSize.sm, fontWeight: '700', letterSpacing: 1 }}>
          {title.toUpperCase()}
        </Text>
      </View>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

// -- Gallery Screen ---------------------------------------------

export default function GalleryScreen() {
  const { theme, isDark } = useTheme();

  // Modal states
  const [failureVisible, setFailureVisible] = useState(false);
  const [consentVisible, setConsentVisible] = useState(false);
  const [quickCaseVisible, setQuickCaseVisible] = useState(false);

  // OTP state
  const [otpValue, setOTPValue] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Imperative toast provider — mounted once */}
      <ToastProvider />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.base,
          paddingBottom: spacing['5xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: '800',
            color: theme.textPrimary,
            marginBottom: 4,
          }}
        >
          TravelMedix
        </Text>
        <Text style={{ fontSize: typography.fontSize.base, color: theme.textSecondary, marginBottom: spacing['2xl'] }}>
          Component Gallery · {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>

        {/* -- BUTTONS -- */}
        <Section title="Button — All Variants">
          <Button label="Primary Button" onPress={() => {}} variant="primary" />
          <Button label="Secondary Button" onPress={() => {}} variant="secondary" />
          <Button label="Danger Button" onPress={() => {}} variant="danger" />
          <Button label="Ghost Button" onPress={() => {}} variant="ghost" />
          {/* Emergency: min 72px, 24pt, full-width, red */}
          <Button label="?? Emergency — WhatsApp Now" onPress={() => {}} variant="emergency" />
          <Button label="Loading..." onPress={() => {}} loading />
          <Button label="Disabled" onPress={() => {}} disabled />
        </Section>

        {/* -- CARD -- */}
        <Section title="Card">
          <Card padding="md"><Text style={{ color: theme.textPrimary }}>Default card with medium padding</Text></Card>
          <Card padding="lg" elevated><Text style={{ color: theme.textPrimary }}>Elevated card — large padding</Text></Card>
        </Section>

        {/* -- TAG + LANGUAGE PILLS -- */}
        <Section title="Tag + LanguagePill">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Tag label="Custom Tag" backgroundColor={palette.blue[100]} textColor={palette.blue[800]} />
            <Tag label="With Icon" icon="?" backgroundColor={palette.amber[100]} textColor={palette.amber[900]} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {['English', 'Hindi', 'Tamil', 'Bengali', 'Other'].map((lang) => (
              <LanguagePill key={lang} language={lang} />
            ))}
          </View>
        </Section>

        {/* -- BADGE -- */}
        <Section title="Badge">
          <Badge date="2025-12-01" />
          <Badge date="2025-10-01" compact />
        </Section>

        {/* -- OPEN STATUS BADGE -- */}
        <Section title="OpenStatusBadge — All 4 Variants">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <OpenStatusBadge status="open" />
            <OpenStatusBadge status="opening_soon" opensAt="11:00" />
            <OpenStatusBadge status="closed" />
            <OpenStatusBadge status="unconfirmed" />
          </View>
        </Section>

        {/* -- INPUT -- */}
        <Section title="Input">
          <Input label="Default Input" placeholder="Type something..." />
          <Input label="With Error" placeholder="Type something..." error="This field is required" required />
          <Input label="With Helper Text" placeholder="Search..." helper="Search by name or area" />
        </Section>

        {/* -- OTP INPUT -- */}
        <Section title="OTPInput — 6-digit auto-advance">
          <OTPInput
            onComplete={(otp) => setOTPValue(otp)}
            onChangeText={setOTPValue}
          />
          {otpValue.length === 6 ? (
            <Text style={{ color: theme.success, textAlign: 'center', fontSize: typography.fontSize.sm }}>
              ? OTP: {otpValue}
            </Text>
          ) : null}
        </Section>

        {/* -- SKELETON -- */}
        <Section title="Skeleton — Shimmer Loading">
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={14} />
          <Skeleton width={80} height={80} borderRadiusSize="full" />
          <ProviderCardSkeleton />
        </Section>

        {/* -- TOAST -- */}
        <Section title="Toast — Imperative API">
          <Button
            label="Show Success Toast"
            onPress={() => Toast.show({ type: 'success', message: 'Provider saved!' })}
            variant="primary"
          />
          <Button
            label="Show Error Toast"
            onPress={() => Toast.show({ type: 'error', message: 'Something went wrong.' })}
            variant="danger"
          />
          <Button
            label="Show Info Toast"
            onPress={() => Toast.show({ type: 'info', message: 'SOS message ready to send.' })}
            variant="secondary"
          />
        </Section>

        {/* -- HELPLINE CTA — CRITICAL -- */}
        <Section title="HelplineCTA — Plain text number ALWAYS visible">
          {/* SPEC VERIFICATION: number readable without any tap */}
          <HelplineCTA city="Delhi" />
          <HelplineCTA
            city="Mumbai"
            prefilledMessage="Language issue at Apollo Clinic"
            note="Message us when connected for live recommendations."
            compact
          />
        </Section>

        {/* -- PROVIDER CARD -- */}
        <Section title="ProviderCard — Live Result">
          <ProviderCard
            provider={MOCK_PROVIDER}
            openStatus="open"
            distanceKm={1.2}
            onPress={() => {}}
          />
          {/* Stale variant */}
          <ProviderCard
            provider={MOCK_STALE_PROVIDER}
            openStatus="closed"
            distanceKm={3.4}
            onPress={() => {}}
          />
        </Section>

        {/* -- OFFLINE PROVIDER CARD -- */}
        <Section title="OfflineProviderCard — Amber border + cache timestamp">
          <OfflineProviderCard provider={MOCK_OFFLINE_PROVIDER} onPress={() => {}} />
        </Section>

        {/* -- FAILURE BOTTOM SHEET -- */}
        <Section title="FailureBottomSheet — 3 options">
          <Button
            label="Open FailureBottomSheet"
            onPress={() => setFailureVisible(true)}
            variant="secondary"
          />
          <FailureBottomSheet
            visible={failureVisible}
            onClose={() => setFailureVisible(false)}
            reason="provider_no_answer"
            primaryProviderName="Apollo Clinic"
            onTryAlternative={() => setFailureVisible(false)}
            onOpenHelpline={() => setFailureVisible(false)}
            onSearchAll={() => setFailureVisible(false)}
          />
        </Section>

        {/* -- CONSENT MESSAGE MODAL (Amendment 5) -- */}
        <Section title="ConsentMessageModal — Amendment 5">
          <Button
            label="Open ConsentMessageModal (with contact)"
            onPress={() => setConsentVisible(true)}
            variant="secondary"
          />
          <ConsentMessageModal
            visible={consentVisible}
            onConfirm={() => setConsentVisible(false)}
            onCancel={() => setConsentVisible(false)}
            contactName="Priya Sharma"
            contactPhone="+919876543210"
            contactRelationship="Sister"
            userName="Rahul Mehta"
            userCity="Delhi"
            providerName="Apollo Clinic Connaught Place"
            providerAddress="N-110, Connaught Place, New Delhi"
          />
          {/* Verify message preview contains correct provider name */}
          <Card padding="md">
            <Text style={{ fontSize: typography.fontSize.xs, color: theme.textSecondary, lineHeight: 18 }}>
              Preview text contains:{'\n'}
              <Text style={{ color: theme.primary }}>Apollo Clinic Connaught Place</Text>
              {' '}at{' '}
              <Text style={{ color: theme.primary }}>N-110, Connaught Place, New Delhi</Text>
            </Text>
          </Card>
        </Section>

        {/* -- QUICK CASE MODAL (Amendment 2) -- */}
        <Section title="QuickCaseModal — Amendment 2 (Admin)">
          {quickCaseVisible ? (
            <QuickCaseModal
              onSubmit={async (c) => {
                Toast.show({ type: 'success', message: `Case ${c.id} logged!` });
                setQuickCaseVisible(false);
              }}
              onCancel={() => setQuickCaseVisible(false)}
              currentUser="ops@travelhealthbridge.com"
            />
          ) : (
            <Button
              label="Open QuickCaseModal"
              onPress={() => setQuickCaseVisible(true)}
              variant="secondary"
            />
          )}
        </Section>

        {/* -- DAILY SUMMARY CARD (Admin) -- */}
        <Section title="DailySummaryCard — Admin Console">
          <DailySummaryCard
            data={{
              triage_sessions_today: 23,
              non_covered_hits_today: 4,   // green (<5)
              open_overcharges: 8,          // amber (5-15)
              open_p1_p2_cases: 17,         // red (>15)
            }}
            onRefresh={() => Toast.show({ type: 'info', message: 'Refreshed' })}
          />
          <DailySummaryCard data={null} isLoading />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}
