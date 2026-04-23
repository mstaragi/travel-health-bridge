/**
 * Input.web — Text input with label, error state, helper text, accessible.
 * Web-specific implementation using HTML input element.
 */
import React, { useState, InputHTMLAttributes } from 'react';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius } from './tokens';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: React.CSSProperties;
  required?: boolean;
  secureToggle?: boolean; // shows eye icon for password fields
  testID?: string;
  wrapperStyle?: React.CSSProperties; // For compatibility with phone.tsx
}

export function Input({
  label,
  error,
  helper,
  containerStyle,
  required,
  secureToggle,
  type: inputType,
  testID,
  wrapperStyle,
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

  const isSecure = secureToggle ? !showSecret : inputType === 'password';
  const inputTypeToUse = isSecure ? 'password' : (inputType === 'phone-pad' ? 'tel' : inputType);

  return (
    <div
      style={{
        width: '100%',
        ...containerStyle,
        ...wrapperStyle,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme.textPrimary,
            marginBottom: spacing.xs,
            display: 'block',
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.danger }}> *</span>
          )}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.inputBackground,
          border: `1.5px solid ${borderColor}`,
          borderRadius: borderRadius.md,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          transition: 'border-color 0.2s ease',
        }}
      >
        <input
          {...rest}
          type={inputTypeToUse}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          style={{
            flex: 1,
            fontSize: typography.fontSize.base,
            color: theme.textPrimary,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            minHeight: 48,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'inherit',
          }}
          placeholder={rest.placeholder}
          aria-label={label ?? rest.placeholder}
          aria-describedby={helper ? `${testID}-helper` : undefined}
        />
        {secureToggle && (
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            aria-label={showSecret ? 'Hide password' : 'Show password'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              fontSize: '16px',
              color: theme.textSecondary,
              marginLeft: spacing.xs,
            }}
          >
            {showSecret ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textDanger,
            marginTop: spacing.xs,
          }}
          role="alert"
        >
          {error}
        </div>
      )}
      {helper && !error && (
        <div
          id={testID ? `${testID}-helper` : undefined}
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {helper}
        </div>
      )}
    </div>
  );
}
