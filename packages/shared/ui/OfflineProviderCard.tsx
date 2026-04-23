/**
 * OfflineProviderCard — Same as ProviderCard but with:
 * - Cache timestamp: 'Last verified: [date]. Call ahead before visiting.'
 * - Amber border to visually differentiate from live results
 */
import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import { LanguagePill } from './LanguagePill';
import { type OfflineProvider } from '../types';
import { typography, spacing, borderRadius, shadows, palette } from './tokens';
import { formatFeeRange } from '../utils/formatFee';

interface OfflineProviderCardProps {
  provider: OfflineProvider;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function OfflineProviderCard({
  provider,
  onPress,
  style,
  testID,
}: OfflineProviderCardProps) {
  const { theme } = useTheme();

  const feeText = formatFeeRange(provider.fee_opd_min, provider.fee_opd_max);

  const cacheDate = provider.last_synced_at
    ? new Date(provider.last_synced_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'unknown date';

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={onPress ? 0.88 : 1}
      accessibilityLabel={`${provider.provider_name}, ${provider.city}. Cached offline. Fee: ${feeText}. Call ahead before visiting.`}
      accessibilityRole={onPress ? 'button' : 'none'}
      testID={testID}
      style={[
        {
          backgroundColor: theme.cardBackground,
          borderRadius: borderRadius.lg,
          padding: spacing.base,
          // SPEC: amber border to visually differentiate from live results
          borderWidth: 2,
          borderColor: palette.amber[400],
          ...shadows.sm,
        },
        style,
      ]}
    >
      {/* Offline banner */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: palette.amber[50],
          borderRadius: borderRadius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          marginBottom: spacing.sm,
          gap: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 12 }}>📵</Text>
        <Text style={{ fontSize: typography.fontSize.xs, color: palette.amber[900], fontWeight: typography.fontWeight.semibold }}>
          OFFLINE CACHE
        </Text>
      </View>

      {/* Name + area */}
      <Text
        style={{
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.bold,
          color: theme.textPrimary,
          marginBottom: spacing.xs,
        }}
        numberOfLines={2}
      >
        {provider.provider_name}
      </Text>
      <Text style={{ fontSize: typography.fontSize.sm, color: theme.textSecondary, marginBottom: spacing.sm }}>
        {provider.city}
      </Text>

      {/* Language pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
        {provider.languages.map((lang) => (
          <LanguagePill key={lang} language={lang} size="sm" />
        ))}
      </View>

      {/* Fee */}
      <Text style={{ fontSize: typography.fontSize.sm, color: theme.textSecondary, marginBottom: spacing.sm }}>
        💰 Consultation: <Text style={{ fontWeight: typography.fontWeight.semibold, color: theme.textPrimary }}>{feeText}</Text>
      </Text>

      {/* SPEC cache timestamp */}
      <Text
        style={{
          fontSize: typography.fontSize.xs,
          color: palette.amber[800],
          fontStyle: 'italic',
        }}
      >
        Last verified: {cacheDate}. Call ahead before visiting.
      </Text>
    </Wrapper>
  );
}
