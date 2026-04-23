/**
 * Button Component
 * Variants: primary, secondary, danger, ghost, emergency, outline
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

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'emergency' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label?: string;
  title?: string; // Alias for label
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  isLoading?: boolean; // Alias for loading
  disabled?: boolean;
  fullWidth?: boolean;
  size?: ButtonSize;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  label,
  title,
  onPress,
  variant = 'primary',
  loading,
  isLoading,
  disabled = false,
  fullWidth = false,
  size = 'md',
  icon,
  accessibilityLabel,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const buttonLabel = label || title || '';
  const isLoading_ = loading || isLoading || false;
  const isDisabled = disabled || isLoading_;

  const buttonStyle = getButtonStyle(variant, isDisabled, fullWidth, size, theme);
  const labelStyle = getLabelStyle(variant, isDisabled, size, theme);
  const spinnerColor = variant === 'secondary' || variant === 'ghost' || variant === 'outline'
    ? theme.buttonSecondaryText
    : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.82}
      accessibilityLabel={accessibilityLabel ?? buttonLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading_ }}
      testID={testID}
      style={[buttonStyle, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {isLoading_ ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : icon ? (
          icon
        ) : null}
        {!isLoading_ && <Text style={[labelStyle, textStyle]}>{buttonLabel}</Text>}
      </View>
    </TouchableOpacity>
  );
}

function getButtonStyle(
  variant: ButtonVariant,
  disabled: boolean,
  fullWidth: boolean,
  size: ButtonSize,
  theme: ReturnType<typeof useTheme>['theme']
): ViewStyle {
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minHeight: 36,
    },
    md: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      minHeight: 48,
    },
    lg: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      minHeight: 56,
    },
  };

  const base: ViewStyle = {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullWidth ? { width: '100%' } : {}),
    ...sizeStyles[size],
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
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.inputBorder,
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
  size: ButtonSize,
  theme: ReturnType<typeof useTheme>['theme']
): TextStyle {
  const sizeStyles: Record<ButtonSize, TextStyle> = {
    sm: {
      fontSize: typography.fontSize.sm,
    },
    md: {
      fontSize: typography.fontSize.base,
    },
    lg: {
      fontSize: typography.fontSize.lg,
    },
  };

  const base: TextStyle = {
    fontWeight: typography.fontWeight.bold,
    ...sizeStyles[size],
  };

  if (disabled) {
    return { ...base, color: theme.buttonDisabledText };
  }

  switch (variant) {
    case 'primary':
      return { ...base, color: theme.buttonPrimaryText };
    case 'secondary':
      return { ...base, color: theme.buttonSecondaryText };
    case 'outline':
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
