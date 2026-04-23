/**
 * (auth)/phone.tsx — Phone number entry screen
 *
 * Flow: User enters 10-digit phone → OTP sent → navigation to OTP screen
 * Includes: country code selector (+91), phone input validation, loading state, error display
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Toast } from '@travelhealthbridge/shared';
import { useTheme } from '@travelhealthbridge/shared';
import { usePhoneAuth } from '@travelhealthbridge/shared/hooks/usePhoneAuth';
import { typography, spacing, borderRadius, palette } from '@travelhealthbridge/shared';

export default function PhoneScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { sendOTP, loading, error, successMessage } = usePhoneAuth();
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSendOTP = async () => {
    setLocalError('');

    // Validate
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setLocalError('Enter a valid 10-digit phone number');
      return;
    }

    // Send OTP
    const result = await sendOTP(phone);
    if (result.success) {
      Toast.show({
        type: 'success',
        message: 'OTP sent! Check your SMS.',
      });
      // Navigate to OTP screen with phone number
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: phone.replace(/\D/g, '').slice(-10) },
      });
    } else {
      Toast.show({
        type: 'error',
        message: result.error || 'Failed to send OTP',
      });
    }
  };

  const errorMessage = localError || error;
  const isDisabled = !phone || phone.replace(/\D/g, '').length < 10 || loading;

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
            Get medical help anywhere
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: theme.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Enter your phone number to find verified doctors in 6 Indian cities.
          </Text>
        </View>

        {/* Phone Input */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: theme.textPrimary,
              marginBottom: spacing.xs,
            }}
          >
            Phone Number
          </Text>

          {/* Country Code + Input Row */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              alignItems: 'center',
            }}
          >
            {/* Country Code Prefix */}
            <View
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                backgroundColor: theme.inputBackground,
                borderWidth: 1.5,
                borderColor: theme.inputBorder,
                borderRadius: borderRadius.md,
                justifyContent: 'center',
                minHeight: 48,
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: theme.textPrimary,
                }}
              >
                +91
              </Text>
            </View>

            {/* Phone Input */}
            <View style={{ flex: 1 }}>
              <Input
                placeholder="98765 43210"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setLocalError('');
                }}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={10}
              />
            </View>
          </View>

          {/* Error Message */}
          {errorMessage && (
            <Text
              style={{
                color: palette.red[600],
                fontSize: typography.fontSize.sm,
                marginTop: spacing.sm,
              }}
            >
              {errorMessage}
            </Text>
          )}

          {/* Helper Text */}
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: typography.fontSize.xs,
              marginTop: spacing.xs,
            }}
          >
            We'll send you a 6-digit verification code
          </Text>
        </View>

        {/* Send OTP Button */}
        <Button
          label={loading ? 'Sending...' : 'Send OTP'}
          onPress={handleSendOTP}
          loading={loading}
          disabled={isDisabled}
          size="lg"
          fullWidth
          style={{ marginBottom: spacing.lg }}
        />

        {/* Guest Mode Option */}
        <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: theme.textSecondary, marginBottom: spacing.xs }}>
            Want to try without signing up?
          </Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Implement guest mode flow
              Toast.show({
                type: 'info',
                message: 'Guest mode coming soon',
              });
            }}
          >
            <Text
              style={{
                color: palette.teal[600],
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.base,
              }}
            >
              Browse as guest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
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
            By continuing, you agree to our Terms of Service and Privacy Policy. 24/7
            medical support in 6 Indian cities — free for travelers.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
