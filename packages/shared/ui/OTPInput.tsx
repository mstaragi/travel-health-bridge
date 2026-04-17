/**
 * OTPInput — 6-digit, auto-advance, auto-submit, paste-support.
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Clipboard,
  TouchableOpacity,
} from 'react-native';
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
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

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

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
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
    <View testID={testID}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' }}>
        {Array(OTP_LENGTH).fill(null).map((_, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref; }}
            value={values[i]}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH} // allows paste of full code
            editable={!disabled}
            accessibilityLabel={`OTP digit ${i + 1} of ${OTP_LENGTH}`}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            style={{
              width: 44,
              height: 52,
              borderWidth: 1.5,
              borderColor: cellBorderColor(i),
              borderRadius: borderRadius.md,
              textAlign: 'center',
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: theme.textPrimary,
              backgroundColor: theme.inputBackground,
            }}
          />
        ))}
      </View>
      {error ? (
        <Text
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textDanger,
            marginTop: spacing.sm,
            textAlign: 'center',
          }}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
