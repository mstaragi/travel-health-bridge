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
  /** Primary text label. Use `label` or `title` — both work. */
  label?: string;
  /** Alias for label — many callers use this. */
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  /** Alias for loading */
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Optional icon element rendered left of label */
  icon?: React.ReactNode;
  /** Optional icon rendered right of label */
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
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
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  rightIcon,
  size = 'md',
  accessibilityLabel,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const isProcessing = loading || isLoading;
  const isDisabled = disabled || isProcessing;
  const displayLabel = label || title || '';

  const buttonStyle = getButtonStyle(variant, isDisabled, fullWidth, theme, size);
  const labelStyle = getLabelStyle(variant, isDisabled, theme, size);
  const spinnerColor = variant === 'secondary' || variant === 'ghost'
    ? theme.buttonSecondaryText
    : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.82}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isProcessing }}
      testID={testID}
      style={[buttonStyle, style]}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[labelStyle, textStyle]}>{displayLabel}</Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

function getButtonStyle(
  variant: ButtonVariant,
  disabled: boolean,
  fullWidth: boolean,
  theme: ReturnType<typeof useTheme>['theme'],
  size: 'sm' | 'md' | 'lg' = 'md'
): ViewStyle {
  const sizeMap = {
    sm: { minHeight: 36, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    md: { minHeight: 48, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    lg: { minHeight: 56, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  };
  const s = sizeMap[size];
  const base: ViewStyle = {
    borderRadius: borderRadius.lg,
    paddingHorizontal: s.paddingHorizontal,
    paddingVertical: s.paddingVertical,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: s.minHeight,
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
  theme: ReturnType<typeof useTheme>['theme'],
  size: 'sm' | 'md' | 'lg' = 'md'
): TextStyle {
  const fontSizeMap = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
  };
  const base: TextStyle = {
    fontWeight: typography.fontWeight.bold,
    fontSize: fontSizeMap[size],
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
