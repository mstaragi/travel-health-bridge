/**
 * Button Component
 * Variants: primary, secondary, danger, ghost, emergency
 * Emergency: min height 72px, red, full-width, 24pt text
 * All: loading spinner, disabled state, auto-derived accessibilityLabel
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius, shadows } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'emergency';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const buttonStyle = getButtonStyle(variant, isDisabled, fullWidth, theme);
  const labelStyle = getLabelStyle(variant, isDisabled, theme);
  const spinnerColor = variant === 'secondary' || variant === 'ghost'
    ? theme.buttonSecondaryText
    : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.82}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={[buttonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={[labelStyle, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function getButtonStyle(
  variant: ButtonVariant,
  disabled: boolean,
  fullWidth: boolean,
  theme: ReturnType<typeof useTheme>['theme']
): ViewStyle {
  const base: ViewStyle = {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...(fullWidth ? { width: '100%' } : {}),
  };

  if (disabled) {
    return {
      ...base,
      backgroundColor: theme.buttonDisabled,
      borderWidth: 0,
    };
  }

  switch (variant) {
    case 'primary':
      return { ...base, backgroundColor: theme.buttonPrimary, ...shadows.sm };
    case 'secondary':
      return {
        ...base,
        backgroundColor: theme.buttonSecondary,
        borderWidth: 1.5,
        borderColor: theme.buttonSecondaryBorder,
      };
    case 'danger':
      return { ...base, backgroundColor: theme.buttonDanger, ...shadows.sm };
    case 'ghost':
      return { ...base, backgroundColor: 'transparent', paddingHorizontal: spacing.md };
    case 'emergency':
      return {
        ...base,
        backgroundColor: theme.buttonEmergency,
        minHeight: 72,        // SPEC — must be at least 72px
        width: '100%',        // SPEC — always full width
        borderRadius: borderRadius.xl,
        ...shadows.emergency,
      };
    default:
      return { ...base, backgroundColor: theme.buttonPrimary };
  }
}

function getLabelStyle(
  variant: ButtonVariant,
  disabled: boolean,
  theme: ReturnType<typeof useTheme>['theme']
): TextStyle {
  const base: TextStyle = {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  };

  if (disabled) {
    return { ...base, color: theme.buttonDisabledText };
  }

  switch (variant) {
    case 'primary':
      return { ...base, color: theme.buttonPrimaryText };
    case 'secondary':
      return { ...base, color: theme.buttonSecondaryText };
    case 'danger':
      return { ...base, color: theme.buttonDangerText };
    case 'ghost':
      return { ...base, color: theme.buttonGhostText, fontWeight: typography.fontWeight.semibold };
    case 'emergency':
      return {
        ...base,
        color: theme.buttonEmergencyText,
        fontSize: typography.fontSize['2xl'], // SPEC — 24pt for emergency
        fontWeight: typography.fontWeight.extrabold,
        letterSpacing: 0.5,
      };
    default:
      return { ...base, color: theme.buttonPrimaryText };
  }
}
