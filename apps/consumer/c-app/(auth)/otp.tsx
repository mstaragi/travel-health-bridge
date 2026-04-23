/**
 * (auth)/otp.tsx — OTP verification screen
 *
 * Flow: User sees 6-digit OTP input → auto-advances → auto-submits when complete
 * Features: Paste support, backspace navigation, 15-minute lockout on 3 failures
 * Per spec: Cannot navigate back once "Send OTP" pressed
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OTPInput, Button, Toast } from '@travelhealthbridge/shared';
import { useTheme } from '@travelhealthbridge/shared';
import { usePhoneAuth } from '@travelhealthbridge/shared/hooks/usePhoneAuth';
import { useAuthStore } from '../store/authStore';
import { typography, spacing, borderRadius, palette } from '@travelhealthbridge/shared';

export default function OTPScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOTP, loading, error, canRetry, retryAfterSeconds } = usePhoneAuth();
  const { authenticate } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Format phone for display
  const displayPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '***';

  // Handle OTP auto-submit when 6 digits entered
  const handleOTPComplete = async (completeOtp: string) => {
    setOtp(completeOtp);
    await verifyOTPCode(completeOtp);
  };

  const verifyOTPCode = async (otpCode: string) => {
    if (!phone || otpCode.length !== 6 || isVerifying) return;

    try {
      setIsVerifying(true);
      setLocalError('');

      const result = await verifyOTP(phone, otpCode);
      if (result.success) {
        // Set authenticated state
        await authenticate(phone, otpCode);

        Toast.show({
          type: 'success',
          message: 'Verified!',
        });

        // Navigate to onboarding
        router.push('/(auth)/onboarding');
      } else {
        setLocalError(result.error || 'Verification failed');
        setOtp(''); // Clear OTP for retry
        Toast.show({
          type: 'error',
          message: result.error || 'Invalid OTP',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setLocalError(message);
      setOtp('');
      Toast.show({
        type: 'error',
        message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = async () => {
    if (otp.length === 6) {
      await verifyOTPCode(otp);
    }
  };

  const handleResendOTP = async () => {
    if (!canRetry) {
      Toast.show({
        type: 'error',
        message: `Wait ${retryAfterSeconds}s before retrying`,
      });
      return;
    }

    // Go back to phone screen to resend
    router.back();
  };

  const errorMessage = localError || error;
  const isDisabled = otp.length < 6 || isVerifying || loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.xl,
          backgroundColor: theme.background,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.extrabold,
              color: theme.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            Enter verification code
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: theme.textSecondary,
              lineHeight: 1.5,
            }}
          >
            We sent a 6-digit code to {displayPhone}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={{ marginBottom: spacing.xl }}>
          <OTPInput
            value={otp}
            onChangeText={setOtp}
            onComplete={handleOTPComplete}
            error={errorMessage}
            disabled={isVerifying || loading || !canRetry}
            testID="otp-input"
          />

          {/* Error Message */}
          {errorMessage && (
            <Text
              style={{
                color: palette.red[600],
                fontSize: typography.fontSize.sm,
                marginTop: spacing.md,
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </Text>
          )}

          {/* Lockout Warning */}
          {!canRetry && (
            <View
              style={{
                marginTop: spacing.lg,
                padding: spacing.md,
                backgroundColor: palette.red[50],
                borderRadius: borderRadius.md,
                borderLeftWidth: 4,
                borderLeftColor: palette.red[600],
              }}
            >
              <Text
                style={{
                  color: palette.red[600],
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing.xs,
                }}
              >
                Too many attempts
              </Text>
              <Text style={{ color: palette.red[600], fontSize: typography.fontSize.sm }}>
                Try again in {retryAfterSeconds} seconds
              </Text>
            </View>
          )}
        </View>

        {/* Manual Verify Button */}
        <Button
          label={isVerifying ? 'Verifying...' : 'Verify'}
          onPress={handleManualVerify}
          loading={isVerifying}
          disabled={isDisabled}
          size="lg"
          fullWidth
          style={{ marginBottom: spacing.lg }}
        />

        {/* Resend OTP */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: typography.fontSize.sm,
              marginBottom: spacing.xs,
            }}
          >
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={!canRetry}
            style={{ opacity: canRetry ? 1 : 0.5 }}
          >
            <Text
              style={{
                color: canRetry ? palette.teal[600] : theme.textDisabled,
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.base,
              }}
            >
              {canRetry ? 'Resend OTP' : `Resend in ${retryAfterSeconds}s`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Helper Text */}
        <View
          style={{
            marginTop: spacing.xl,
            padding: spacing.lg,
            backgroundColor: palette.blue[50],
            borderRadius: borderRadius.md,
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: typography.fontSize.xs,
              lineHeight: 1.6,
            }}
          >
            ✓ Your number is never shared with doctors
            {'\n'}✓ Standard SMS rates apply
            {'\n'}✓ Code expires in 10 minutes
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
