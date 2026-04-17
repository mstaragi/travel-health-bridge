/**
 * Badge — 'Travel Health Bridge Verified' with checkmark + date.
 * Shows verification status on provider profiles and cards.
 */
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius, palette } from './tokens';

interface BadgeProps {
  date?: string;           // ISO date string, e.g. '2025-12-01'
  compact?: boolean;       // compact hides date
  style?: ViewStyle;
  testID?: string;
}

export function Badge({ date, compact = false, style, testID }: BadgeProps) {
  const { theme } = useTheme();

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  return (
    <View
      testID={testID}
      accessibilityLabel={`Travel Health Bridge Verified${formattedDate ? `, verified ${formattedDate}` : ''}`}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.successLight,
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.md,
          paddingVertical: compact ? 3 : spacing.xs,
          alignSelf: 'flex-start',
          gap: spacing.xs,
          borderWidth: 1,
          borderColor: palette.green[300],
        },
        style,
      ]}
    >
      <Text style={{ fontSize: compact ? 10 : 12, color: theme.success }}>✓</Text>
      <Text
        style={{
          fontSize: compact ? typography.fontSize.xs : typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.textSuccess,
        }}
      >
        Travel Health Bridge Verified
      </Text>
      {!compact && formattedDate ? (
        <Text
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textSecondary,
          }}
        >
          · {formattedDate}
        </Text>
      ) : null}
    </View>
  );
}
