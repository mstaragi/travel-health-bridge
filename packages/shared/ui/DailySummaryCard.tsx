/**
 * DailySummaryCard — Admin console only (web).
 * Four metric tiles: triage_sessions_today, non_covered_hits_today,
 * open_overcharges, open_p1_p2_cases.
 * Colour coded: green<5, amber 5-15, red>15 for case counts.
 * Refreshes every 5 minutes via React Query polling (polling config in admin hooks).
 */
import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius, palette, shadows, type Theme } from './tokens';

interface DailySummaryData {
  triage_sessions_today: number | null;
  non_covered_hits_today: number | null;
  open_overcharges: number | null;
  open_p1_p2_cases: number | null;
}

interface DailySummaryCardProps {
  data: DailySummaryData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  testID?: string;
}

function getCountColor(count: number | null, theme: Theme): { bg: string; text: string; border: string } {
  if (count === null) return { bg: theme.surfaceRaised, text: theme.textSecondary, border: theme.border };
  if (count < 5)  return { bg: theme.successLight, text: theme.textSuccess, border: palette.green[300] };
  if (count <= 15) return { bg: theme.warningLight, text: theme.textWarning, border: palette.amber[300] };
  return { bg: theme.dangerLight, text: theme.textDanger, border: palette.red[300] };
}

interface MetricTileProps {
  label: string;
  value: number | null;
  useColorCoding: boolean;
  isLoading?: boolean;
  theme: Theme;
}

function MetricTile({ label, value, useColorCoding, isLoading, theme }: MetricTileProps) {
  const colors = useColorCoding
    ? getCountColor(value, theme)
    : { bg: theme.infoLight, text: theme.info, border: palette.blue[200] };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 140,
        ...shadows.sm,
      }}
    >
      <Text
        style={{
          fontSize: isLoading ? typography.fontSize.sm : typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.extrabold,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {isLoading ? '—' : (value ?? '—')}
      </Text>
      <Text
        style={{
          fontSize: typography.fontSize.xs,
          color: theme.textSecondary,
          lineHeight: 15,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function DailySummaryCard({
  data,
  isLoading = false,
  onRefresh,
  style,
  testID,
}: DailySummaryCardProps) {
  const { theme } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.base,
          borderWidth: 1,
          borderColor: theme.border,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            color: theme.textPrimary,
          }}
        >
          Today's Overview
        </Text>
        {onRefresh ? (
          <TouchableOpacity
            onPress={onRefresh}
            accessibilityLabel="Refresh summary"
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              backgroundColor: theme.surfaceRaised,
              borderRadius: borderRadius.sm,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>↻ Refresh</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Metric tiles — 2x2 grid */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        <MetricTile
          label="Triage sessions today"
          value={data?.triage_sessions_today ?? null}
          useColorCoding={false}
          isLoading={isLoading}
          theme={theme}
        />
        <MetricTile
          label="City gaps today"
          value={data?.non_covered_hits_today ?? null}
          useColorCoding={true}
          isLoading={isLoading}
          theme={theme}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.sm }}>
        <MetricTile
          label="Open overcharges"
          value={data?.open_overcharges ?? null}
          useColorCoding={true}
          isLoading={isLoading}
          theme={theme}
        />
        <MetricTile
          label="P1 + P2 cases open"
          value={data?.open_p1_p2_cases ?? null}
          useColorCoding={true}
          isLoading={isLoading}
          theme={theme}
        />
      </View>

      {/* Refresh note */}
      <Text
        style={{
          fontSize: typography.fontSize.xs,
          color: theme.textTertiary,
          marginTop: spacing.sm,
          textAlign: 'right',
        }}
      >
        Auto-refreshes every 5 minutes
      </Text>
    </View>
  );
}
