/**
 * ProviderCard — used in search list and triage result.
 * Shows: name, area, languages (LanguagePill[]), OpenStatusBadge,
 * fee range (formatFee), distance, VerifiedBadge, staleness label.
 * Staleness label (amber): 'Availability recently unconfirmed — call ahead'
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from './useTheme';
import { Badge } from './Badge';
import { LanguagePill } from './LanguagePill';
import { OpenStatusBadge } from './OpenStatusBadge';
import { type OpenStatus } from '../utils/openStatus';
import { type Provider } from '../types';
import { typography, spacing, borderRadius, shadows, palette } from './tokens';
import { formatFeeRange } from '../utils/formatFee';

interface ProviderCardProps {
  provider: Provider;
  openStatus: OpenStatus;
  opensAt?: string;
  distanceKm?: number;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function ProviderCard({
  provider,
  openStatus,
  opensAt,
  distanceKm,
  onPress,
  style,
  testID,
}: ProviderCardProps) {
  const { theme } = useTheme();

  const isStale = provider.staleness_tier === 'stale';
  const feeText = formatFeeRange(provider.fee_opd.min, provider.fee_opd.max);

  const distanceText = distanceKm != null
    ? distanceKm < 1
      ? `${Math.round(distanceKm * 1000)}m away`
      : `${distanceKm.toFixed(1)} km away`
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityLabel={`${provider.name}, ${provider.area}. ${openStatus}. Fee: ${feeText}`}
      accessibilityRole="button"
      testID={testID}
      style={[
        {
          backgroundColor: theme.cardBackground,
          borderRadius: borderRadius.lg,
          padding: spacing.base,
          borderWidth: 1,
          borderColor: theme.border,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {/* Row 1: Name + Open status */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
        <Text
          style={{
            flex: 1,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            color: theme.textPrimary,
            marginRight: spacing.sm,
          }}
          numberOfLines={2}
        >
          {provider.name}
        </Text>
        <OpenStatusBadge status={openStatus} opensAt={opensAt} size="sm" />
      </View>

      {/* Row 2: Area + distance */}
      <Text style={{ fontSize: typography.fontSize.sm, color: theme.textSecondary, marginBottom: spacing.sm }}>
        {provider.area}{distanceText ? ` · ${distanceText}` : ''}
      </Text>

      {/* Row 3: Verified badge */}
      {provider.verified ? (
        <Badge date={provider.badge_date} compact style={{ marginBottom: spacing.sm }} />
      ) : null}

      {/* Row 4: Language pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
        {provider.languages.map((lang) => (
          <LanguagePill key={lang} language={lang} size="sm" />
        ))}
      </View>

      {/* Row 5: Fee */}
      <Text style={{ fontSize: typography.fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs }}>
        💰 Consultation: <Text style={{ fontWeight: typography.fontWeight.semibold, color: theme.textPrimary }}>{feeText}</Text>
      </Text>

      {/* Stale label — per spec: amber text when staleness_tier='stale' */}
      {isStale ? (
        <View
          style={{
            marginTop: spacing.xs,
            backgroundColor: palette.amber[50],
            borderRadius: borderRadius.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            borderLeftWidth: 3,
            borderLeftColor: palette.amber[600],
          }}
        >
          <Text style={{ fontSize: typography.fontSize.xs, color: palette.amber[900], fontWeight: typography.fontWeight.medium }}>
            ⚠ Availability recently unconfirmed — call ahead
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
