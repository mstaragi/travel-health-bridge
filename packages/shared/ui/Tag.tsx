/**
 * Tag — coloured pill with text and optional icon.
 * Base building block for LanguagePill and other chips.
 */
import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { borderRadius, spacing, typography } from './tokens';

interface TagProps {
  label: string;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Tag({
  label,
  icon,
  backgroundColor = '#E0F2F1',
  textColor = '#00796B',
  borderColor,
  size = 'md',
  style,
  textStyle,
  testID,
}: TagProps) {
  const isSm = size === 'sm';

  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor,
          borderRadius: borderRadius.full,
          paddingHorizontal: isSm ? spacing.sm : spacing.md,
          paddingVertical: isSm ? 2 : spacing.xs,
          alignSelf: 'flex-start',
          gap: spacing.xs,
          ...(borderColor ? { borderWidth: 1, borderColor } : {}),
        },
        style,
      ]}
    >
      {icon ? (
        <Text style={{ fontSize: isSm ? 10 : 12 }}>{icon}</Text>
      ) : null}
      <Text
        style={[
          {
            color: textColor,
            fontSize: isSm ? typography.fontSize.xs : typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
