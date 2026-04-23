/**
 * Gallery — Component showcase for visual verification.
 * Displays all UI components in all states.
 *
 * Verification checklist:
 * ✓ HelplineCTA plain text number visible without tapping
 * ✓ Dark mode on all components
 * ✓ ConsentMessageModal shows correct message preview
 * ✓ All Button variants rendered
 * ✓ ProviderCard with staleness label
 * ✓ OfflineProviderCard with amber border + cache date
 * ✓ OpenStatusBadge all 4 states
 * ✓ QuickCaseModal with THB- prefix generation
 * ✓ DailySummaryCard with color coding
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius, palette, shadows } from './tokens';
import { Button } from './Button';
import { Card } from './Card';
import { Tag } from './Tag';
import { LanguagePill } from './LanguagePill';
import { Badge } from './Badge';
import { OpenStatusBadge } from './OpenStatusBadge';
import { Input } from './Input';
import { OTPInput } from './OTPInput';
import { Skeleton, ProviderCardSkeleton } from './Skeleton';
import { Toast, ToastProvider } from './Toast';
import { HelplineCTA } from './HelplineCTA';
import { ProviderCard } from './ProviderCard';
import { OfflineProviderCard } from './OfflineProviderCard';
import { FailureBottomSheet } from './FailureBottomSheet';
import { ConsentMessageModal } from './ConsentMessageModal';
import { QuickCaseModal } from './QuickCaseModal';
import { DailySummaryCard } from './DailySummaryCard';
import type { Provider, OfflineProvider } from '../types';

// ─── Section Header ──────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        marginTop: spacing['2xl'],
        marginBottom: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: theme.primary,
        paddingBottom: spacing.xs,
      }}
    >
      <Text
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          color: theme.textPrimary,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function SubHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: theme.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      {title}
    </Text>
  );
}

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_PROVIDER: Provider = {
  id: 'p1',
  slug: 'apollo-connaught',
  name: 'Apollo Clinic Connaught Place',
  city_id: 'delhi',
  area: 'Connaught Place',
  address: 'N-110, Connaught Place, New Delhi',
  lat: 28.6315,
  lng: 77.2167,
  phone: '011-47600000',
  languages: ['English', 'Hindi'],
  specialties: ['General Physician', 'Travel Medicine'],
  doctors: [{ name: 'Dr. Sharma', qualification: 'MBBS', specialty: 'GP' }],
  opd_hours: {
    monday: { open: true, from: '09:00', to: '21:00' },
    tuesday: { open: true, from: '09:00', to: '21:00' },
    wednesday: { open: true, from: '09:00', to: '21:00' },
    thursday: { open: true, from: '09:00', to: '21:00' },
    friday: { open: true, from: '09:00', to: '21:00' },
    saturday: { open: true, from: '09:00', to: '18:00' },
    sunday: { open: false },
  },
  fee_opd: { min: 400, max: 600 },
  emergency: true,
  badge_status: 'active',
  badge_date: '2025-12-01',
  badge_expiry: '2026-12-01',
  last_activity_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  staleness_tier: 'fresh',
  strike_count: 0,
  verified: true,
  reliability_score: 1.8,
};

const MOCK_STALE_PROVIDER: Provider = {
  ...MOCK_PROVIDER,
  id: 'p2',
  slug: 'paharganj-health',
  name: 'Paharganj Health Hub',
  area: 'Paharganj',
  staleness_tier: 'stale',
  reliability_score: 0,
  languages: ['English', 'Hindi', 'Tamil'],
};

const MOCK_OFFLINE_PROVIDER: OfflineProvider = {
  id: 'op1',
  provider_id: 'p1',
  city: 'Delhi',
  symptom_cluster: 'fever_infection',
  provider_name: 'Apollo Clinic CP (Cached)',
  provider_phone: '011-47600000',
  provider_address: 'N-110, Connaught Place',
  provider_open_status: 'unconfirmed',
  languages: ['English', 'Hindi'],
  fee_opd_min: 400,
  fee_opd_max: 600,
  emergency: true,
  last_synced_at: new Date(Date.now() - 3 * 86400000).toISOString(),
};

// ─── Gallery Component ───────────────────────────────────────
export function Gallery() {
  const { theme, isDark } = useTheme();
  const [showFailureSheet, setShowFailureSheet] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showQuickCase, setShowQuickCase] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ToastProvider />
      <ScrollView
        contentContainerStyle={{
          padding: spacing.base,
          paddingBottom: spacing['5xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingVertical: spacing.xl,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.extrabold,
              color: theme.primary,
              marginBottom: spacing.xs,
            }}
          >
            Travel Health Bridge
          </Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: theme.textSecondary }}>
            UI Component Gallery
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.xs,
              color: theme.textTertiary,
              marginTop: spacing.xs,
            }}
          >
            Theme: {isDark ? '🌙 Dark' : '☀️ Light'}
          </Text>
        </View>

        {/* ─── BUTTONS ──────────────────────────────────── */}
        <SectionHeader title="Button" />
        <SubHeader title="Primary" />
        <Button label="Get Recommendation" onPress={() => {}} />
        <SubHeader title="Secondary" />
        <Button label="View All Providers" onPress={() => {}} variant="secondary" />
        <SubHeader title="Danger" />
        <Button label="Delete Account" onPress={() => {}} variant="danger" />
        <SubHeader title="Ghost" />
        <Button label="Skip for now" onPress={() => {}} variant="ghost" />
        <SubHeader title="Emergency (min 72px, full-width, 24pt text)" />
        <Button label="🚨 CALL EMERGENCY" onPress={() => {}} variant="emergency" />
        <SubHeader title="Loading State" />
        <Button label="Submitting..." onPress={() => {}} loading />
        <SubHeader title="Disabled State" />
        <Button label="Disabled" onPress={() => {}} disabled />

        {/* ─── CARD ─────────────────────────────────────── */}
        <SectionHeader title="Card" />
        <SubHeader title="Default (md padding)" />
        <Card>
          <Text style={{ color: theme.textPrimary }}>Card with default padding (16px)</Text>
        </Card>
        <SubHeader title="Small padding" />
        <Card padding="sm">
          <Text style={{ color: theme.textPrimary }}>Card with sm padding (8px)</Text>
        </Card>
        <SubHeader title="Large padding, elevated" />
        <Card padding="lg" elevated>
          <Text style={{ color: theme.textPrimary }}>Card with lg padding (24px), elevated shadow</Text>
        </Card>

        {/* ─── TAG ──────────────────────────────────────── */}
        <SectionHeader title="Tag" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Tag label="Active" backgroundColor={palette.green[50]} textColor={palette.green[800]} icon="●" />
          <Tag label="Pending" backgroundColor={palette.amber[50]} textColor={palette.amber[900]} icon="◑" />
          <Tag label="Expired" backgroundColor={palette.red[50]} textColor={palette.red[800]} icon="○" />
          <Tag label="Small" size="sm" />
        </View>

        {/* ─── LANGUAGE PILL ────────────────────────────── */}
        <SectionHeader title="LanguagePill" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <LanguagePill language="English" />
          <LanguagePill language="Hindi" />
          <LanguagePill language="Tamil" />
          <LanguagePill language="Bengali" />
          <LanguagePill language="Other" />
          <LanguagePill language="Punjabi" />
        </View>

        {/* ─── BADGE ────────────────────────────────────── */}
        <SectionHeader title="Badge" />
        <SubHeader title="Full (with date)" />
        <Badge date="2025-12-01" />
        <SubHeader title="Compact (no date)" />
        <Badge compact />

        {/* ─── OPEN STATUS BADGE ────────────────────────── */}
        <SectionHeader title="OpenStatusBadge" />
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <OpenStatusBadge status="open" />
            <Text style={{ color: theme.textSecondary, fontSize: typography.fontSize.sm }}>→ green chip</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <OpenStatusBadge status="opening_soon" opensAt="11:00" />
            <Text style={{ color: theme.textSecondary, fontSize: typography.fontSize.sm }}>→ amber chip</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <OpenStatusBadge status="closed" />
            <Text style={{ color: theme.textSecondary, fontSize: typography.fontSize.sm }}>→ red chip</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <OpenStatusBadge status="unconfirmed" />
            <Text style={{ color: theme.textSecondary, fontSize: typography.fontSize.sm }}>→ grey chip</Text>
          </View>
        </View>

        {/* ─── INPUT ────────────────────────────────────── */}
        <SectionHeader title="Input" />
        <SubHeader title="Normal with label + helper" />
        <Input
          label="Full name"
          placeholder="Enter your name"
          helper="As shown on your passport"
        />
        <SubHeader title="Error state" />
        <Input
          label="Email"
          placeholder="you@example.com"
          error="Please enter a valid email address"
          value="invalid-email"
        />
        <SubHeader title="Required + password toggle" />
        <Input
          label="Password"
          placeholder="••••••••"
          required
          secureToggle
          secureTextEntry
        />

        {/* ─── OTP INPUT ───────────────────────────────── */}
        <SectionHeader title="OTPInput" />
        <SubHeader title="6-digit, auto-advance, paste support" />
        <OTPInput
          onComplete={(code) => Toast.show({ type: 'success', message: `OTP entered: ${code}` })}
        />
        <SubHeader title="With error" />
        <OTPInput
          onComplete={() => {}}
          error="Invalid OTP. Please try again."
        />

        {/* ─── SKELETON ─────────────────────────────────── */}
        <SectionHeader title="Skeleton" />
        <SubHeader title="Basic shimmer lines" />
        <View style={{ gap: spacing.sm }}>
          <Skeleton width="100%" height={16} />
          <Skeleton width="75%" height={16} />
          <Skeleton width="50%" height={16} />
        </View>
        <SubHeader title="ProviderCard skeleton" />
        <Card>
          <ProviderCardSkeleton />
        </Card>

        {/* ─── TOAST ────────────────────────────────────── */}
        <SectionHeader title="Toast (imperative)" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Button
            label="Success"
            onPress={() => Toast.show({ type: 'success', message: 'Provider added successfully!' })}
            variant="primary"
          />
          <Button
            label="Error"
            onPress={() => Toast.show({ type: 'error', message: 'Failed to save changes.' })}
            variant="danger"
          />
          <Button
            label="Info"
            onPress={() => Toast.show({ type: 'info', message: 'Provider updated their hours.' })}
            variant="secondary"
          />
        </View>

        {/* ─── PROVIDER CARD ────────────────────────────── */}
        <SectionHeader title="ProviderCard" />
        <SubHeader title="Fresh provider (verified, open)" />
        <ProviderCard
          provider={MOCK_PROVIDER}
          openStatus="open"
          distanceKm={1.2}
          onPress={() => Toast.show({ type: 'info', message: 'Provider tapped' })}
        />
        <SubHeader title="Stale provider (amber label)" />
        <ProviderCard
          provider={MOCK_STALE_PROVIDER}
          openStatus="opening_soon"
          opensAt="11:00"
          distanceKm={3.7}
          onPress={() => {}}
        />

        {/* ─── OFFLINE PROVIDER CARD ────────────────────── */}
        <SectionHeader title="OfflineProviderCard" />
        <SubHeader title="Cached result (amber border + timestamp)" />
        <OfflineProviderCard
          provider={MOCK_OFFLINE_PROVIDER}
          onPress={() => Toast.show({ type: 'info', message: 'Offline provider tapped' })}
        />

        {/* ─── HELPLINE CTA (CRITICAL) ──────────────────── */}
        <SectionHeader title="HelplineCTA (CRITICAL)" />
        <View
          style={{
            backgroundColor: palette.red[50],
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.fontSize.xs, color: palette.red[800], fontWeight: typography.fontWeight.bold }}>
            ⚠ VERIFY: Plain text helpline number is visible below WITHOUT tapping any button
          </Text>
        </View>
        <HelplineCTA city="Delhi" />
        <SubHeader title="Compact variant" />
        <HelplineCTA compact prefilledMessage="I need urgent help in Goa." />

        {/* ─── FAILURE BOTTOM SHEET ─────────────────────── */}
        <SectionHeader title="FailureBottomSheet" />
        <Button
          label="Open FailureBottomSheet"
          onPress={() => setShowFailureSheet(true)}
          variant="secondary"
        />
        <FailureBottomSheet
          visible={showFailureSheet}
          onClose={() => setShowFailureSheet(false)}
          reason="provider_not_reachable"
          primaryProviderName="Apollo Clinic"
          onTryAlternative={() => Toast.show({ type: 'info', message: 'Try alternative' })}
          onOpenHelpline={() => Toast.show({ type: 'info', message: 'Open helpline' })}
          onSearchAll={() => Toast.show({ type: 'info', message: 'Search all' })}
        />

        {/* ─── CONSENT MESSAGE MODAL ────────────────────── */}
        <SectionHeader title="ConsentMessageModal" />
        <View
          style={{
            backgroundColor: palette.green[50],
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.fontSize.xs, color: palette.green[800], fontWeight: typography.fontWeight.bold }}>
            ⚠ VERIFY: Message preview shows "Travel Health Bridge" (not TravelMedix)
          </Text>
        </View>
        <Button
          label="Open ConsentMessageModal"
          onPress={() => setShowConsentModal(true)}
          variant="secondary"
        />
        <ConsentMessageModal
          visible={showConsentModal}
          onConfirm={() => { setShowConsentModal(false); Toast.show({ type: 'success', message: 'Message sent!' }); }}
          onCancel={() => setShowConsentModal(false)}
          contactName="Sarah Johnson"
          contactPhone="+44-7700-900000"
          contactRelationship="Sister"
          userName="James"
          userCity="Delhi"
          providerName="Apollo Clinic Connaught Place"
          providerAddress="N-110, Connaught Place, New Delhi"
        />

        {/* ─── QUICK CASE MODAL (Admin) ─────────────────── */}
        <SectionHeader title="QuickCaseModal (Admin)" />
        <View
          style={{
            backgroundColor: palette.blue[50],
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.fontSize.xs, color: palette.blue[800], fontWeight: typography.fontWeight.bold }}>
            VERIFY: Case ID generates as THB-YYYYMMDD-NNN (not TM-)
          </Text>
        </View>
        <Card padding="none">
          <QuickCaseModal
            onSubmit={async (c) => {
              Toast.show({ type: 'success', message: `Case ${c.id} logged (${c.severity})` });
            }}
            onCancel={() => {}}
            currentUser="ops-admin"
          />
        </Card>

        {/* ─── DAILY SUMMARY CARD (Admin) ───────────────── */}
        <SectionHeader title="DailySummaryCard (Admin)" />
        <SubHeader title="Green (<5 values)" />
        <DailySummaryCard
          data={{
            triage_sessions_today: 3,
            non_covered_hits_today: 1,
            open_overcharges: 0,
            open_p1_p2_cases: 2,
          }}
          onRefresh={() => Toast.show({ type: 'info', message: 'Refreshed' })}
        />
        <SubHeader title="Amber (5-15 values)" />
        <DailySummaryCard
          data={{
            triage_sessions_today: 12,
            non_covered_hits_today: 8,
            open_overcharges: 7,
            open_p1_p2_cases: 10,
          }}
        />
        <SubHeader title="Red (>15 values)" />
        <DailySummaryCard
          data={{
            triage_sessions_today: 42,
            non_covered_hits_today: 22,
            open_overcharges: 18,
            open_p1_p2_cases: 25,
          }}
        />
        <SubHeader title="Loading state" />
        <DailySummaryCard data={null} isLoading />

        {/* ─── END ──────────────────────────────────────── */}
        <View style={{ marginTop: spacing['3xl'], alignItems: 'center' }}>
          <Text style={{ fontSize: typography.fontSize.xs, color: theme.textTertiary }}>
            — End of Gallery —
          </Text>
          <Text style={{ fontSize: typography.fontSize.xs, color: theme.textTertiary, marginTop: spacing.xs }}>
            Theme: {isDark ? 'Dark' : 'Light'} · Components: 20
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
