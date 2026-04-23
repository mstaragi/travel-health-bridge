/**
 * OTPInput.web — 6-digit OTP input with auto-advance, paste support.
 * Web-specific implementation using HTML input elements.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius } from './tokens';

const OTP_LENGTH = 6;

interface OTPInputProps {
  onComplete: (otp: string) => void;
  onChangeText?: (otp: string) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export function OTPInput({
  onComplete,
  onChangeText,
  error,
  disabled = false,
  testID,
}: OTPInputProps) {
  const { theme } = useTheme();
  const [values, setValues] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  const handleChange = useCallback(
    (text: string, index: number) => {
      // Handle paste — extract digits
      const cleaned = text.replace(/\D/g, '');

      if (cleaned.length > 1) {
        // Paste: fill digits from index
        const digits = cleaned.slice(0, OTP_LENGTH - index).split('');
        const newValues = [...values];
        digits.forEach((d, i) => {
          if (index + i < OTP_LENGTH) newValues[index + i] = d;
        });
        setValues(newValues);
        onChangeText?.(newValues.join(''));
        // Focus last filled or next
        const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        if (newValues.every((v) => v !== '')) {
          onComplete(newValues.join(''));
        }
        return;
      }

      // Single character
      const digit = cleaned.slice(-1);
      const newValues = [...values];
      newValues[index] = digit;
      setValues(newValues);
      onChangeText?.(newValues.join(''));

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus(); // auto-advance
      }
      if (newValues.every((v) => v !== '')) {
        onComplete(newValues.join('')); // auto-submit
      }
    },
    [values, onChangeText, onComplete]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [values]
  );

  const cellBorderColor = (i: number) => {
    if (error) return theme.inputErrorBorder;
    if (focusedIndex === i) return theme.inputFocusBorder;
    if (values[i]) return theme.inputBorder;
    return theme.border;
  };

  return (
    <div
      data-testid={testID}
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: spacing.sm,
      }}
    >
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[i]}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            aria-label={`OTP digit ${i + 1}`}
            style={{
              width: 48,
              height: 56,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              textAlign: 'center',
              border: `1.5px solid ${cellBorderColor(i)}`,
              borderRadius: borderRadius.md,
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary,
              transition: 'border-color 0.2s ease',
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
            }}
          />
        </div>
      ))}
      {error && (
        <div
          style={{
            position: 'absolute',
            bottom: -24,
            left: 0,
            right: 0,
            fontSize: typography.fontSize.xs,
            color: theme.textDanger,
            textAlign: 'center',
            marginTop: spacing.xs,
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
