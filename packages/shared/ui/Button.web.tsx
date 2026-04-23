/**
 * Button.web — Button component with Web support using HTML button element.
 * Variants: primary, secondary, danger, ghost, emergency, outline
 */
import React from 'react';
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
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
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

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      paddingLeft: spacing.md,
      paddingRight: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      minHeight: 36,
      fontSize: typography.fontSize.sm,
    },
    md: {
      paddingLeft: spacing.xl,
      paddingRight: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      minHeight: 48,
      fontSize: typography.fontSize.base,
    },
    lg: {
      paddingLeft: spacing.xl,
      paddingRight: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      minHeight: 56,
      fontSize: typography.fontSize.lg,
    },
  };

  let baseColor = theme.buttonPrimary;
  let baseTextColor = theme.buttonPrimaryText;
  let borderColor = 'transparent';

  if (isDisabled) {
    baseColor = theme.buttonDisabled;
    baseTextColor = theme.buttonDisabledText;
  } else {
    switch (variant) {
      case 'primary':
        baseColor = theme.buttonPrimary;
        baseTextColor = theme.buttonPrimaryText;
        break;
      case 'secondary':
        baseColor = theme.buttonSecondary;
        baseTextColor = theme.buttonSecondaryText;
        borderColor = theme.buttonSecondaryBorder;
        break;
      case 'outline':
        baseColor = 'transparent';
        baseTextColor = theme.buttonSecondaryText;
        borderColor = theme.inputBorder;
        break;
      case 'danger':
        baseColor = theme.buttonDanger;
        baseTextColor = theme.buttonDangerText;
        break;
      case 'ghost':
        baseColor = 'transparent';
        baseTextColor = theme.buttonGhostText;
        break;
      case 'emergency':
        baseColor = theme.buttonEmergency;
        baseTextColor = theme.buttonEmergencyText;
        break;
    }
  }

  const buttonStyle: React.CSSProperties = {
    ...sizeStyles[size],
    backgroundColor: baseColor,
    color: baseTextColor,
    border: borderColor === 'transparent' ? 'none' : `1.5px solid ${borderColor}`,
    borderRadius: variant === 'emergency' ? borderRadius.xl : borderRadius.lg,
    fontWeight: typography.fontWeight.bold,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...(variant === 'emergency' && { minHeight: 72, width: '100%' }),
    ...style,
  };

  const handleClick = () => {
    if (!isDisabled) {
      onPress();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={accessibilityLabel ?? buttonLabel}
      aria-busy={isLoading_}
      data-testid={testID}
      style={buttonStyle}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = '0.9';
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = '1';
        }
      }}
    >
      {isLoading_ && (
        <div
          style={{
            width: 16,
            height: 16,
            border: `2px solid ${baseTextColor}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {icon && !isLoading_ && <span>{icon}</span>}
      {buttonLabel && <span style={textStyle}>{buttonLabel}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
