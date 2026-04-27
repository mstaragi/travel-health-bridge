/**
 * Input — Text input with label, error state, helper text, accessible.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius } from './tokens';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  /** Style applied to the input wrapper row (the border box) */
  wrapperStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  secureToggle?: boolean; // shows eye icon for password fields
  testID?: string;
}

export function Input({
  label,
  error,
  helper,
  containerStyle,
  wrapperStyle,
  leftIcon,
  rightIcon,
  required,
  secureToggle,
  secureTextEntry,
  ...rest
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const borderColor = error
    ? theme.inputErrorBorder
    : isFocused
    ? theme.inputFocusBorder
    : theme.inputBorder;

  const isSecure = secureToggle ? !showSecret : secureTextEntry;

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label ? (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
          {required ? (
            <Text style={{ color: theme.danger }}> *</Text>
          ) : null}
        </Text>
      ) : null}

      <View
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.inputBackground,
          borderWidth: 1.5,
          borderColor,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.md,
        }, wrapperStyle]}
      >
        {leftIcon ? <View style={{ marginRight: spacing.sm }}>{leftIcon}</View> : null}
        <TextInput
          {...rest}
          secureTextEntry={isSecure}
          onFocus={(e) => { setIsFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); rest.onBlur?.(e); }}
          accessibilityLabel={label ?? rest.placeholder}
          accessibilityHint={helper}
          style={{
            flex: 1,
            fontSize: typography.fontSize.base,
            color: theme.textPrimary,
            paddingVertical: spacing.md,
            minHeight: 48,
          }}
          placeholderTextColor={theme.textTertiary}
        />
        {rightIcon ? <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View> : null}
        {secureToggle ? (
          <TouchableOpacity
            onPress={() => setShowSecret(!showSecret)}
            accessibilityLabel={showSecret ? 'Hide' : 'Show'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 16, color: theme.textSecondary }}>
              {showSecret ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textDanger,
            marginTop: spacing.xs,
          }}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : helper ? (
        <Text
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
