/**
 * Card Component
 * White background, shadow, border radius 12, padding variants.
 */
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from './useTheme';
import { borderRadius, shadows, spacing } from './tokens';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  style?: ViewStyle;
  elevated?: boolean;
  testID?: string;
}

export function Card({
  children,
  padding = 'md',
  style,
  elevated = false,
  testID,
}: CardProps) {
  const { theme } = useTheme();

  const paddingMap: Record<CardPadding, number> = {
    none: 0,
    sm:   spacing.sm,
    md:   spacing.base,
    lg:   spacing.xl,
  };

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: theme.cardBackground,
          borderRadius: borderRadius.lg,  // spec: border radius 12
          padding: paddingMap[padding],
          borderWidth: 1,
          borderColor: theme.border,
        },
        elevated ? shadows.md : shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}
