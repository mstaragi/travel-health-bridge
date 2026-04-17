import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@travelhealthbridge/shared';
import { useAuthStore } from 'store/authStore';
import { Input } from '@travelhealthbridge/shared/ui/Input';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { MessageCircle, Phone } from 'lucide-react-native';

export default function PhoneAuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const { lockUntil, setLockout } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (lockUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockUntil]);

  const validatePhone = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 13;
  };

  const handleSendOTP = async (channel: 'sms' | 'whatsapp') => {
    if (lockUntil && Date.now() < lockUntil) return;

    Keyboard.dismiss();
    setError('');

    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    const fullNumber = `${countryCode}${phoneNumber.replace(/\s/g, '')}`;

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: fullNumber,
      });

      if (signInError) {
        if (signInError.message.includes('rate limit') || signInError.status === 429) {
          await setLockout(15);
          setError('Too many attempts. Account locked for 15 minutes.');
        } else {
          setError(signInError.message || 'Failed to send OTP. Please try again.');
        }
      } else {
        router.push({
          //@ts-ignore - expo router param types
          pathname: '/auth/verify',
          params: { phone: fullNumber, channel },
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLocked = lockUntil && Date.now() < lockUntil;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.content}>
              <Text style={styles.title}>What's your number?</Text>
              <Text style={styles.subtitle}>We'll send you a 6-digit code to verify your account.</Text>

              <View style={isLocked ? styles.inputLocked : styles.inputContainer}>
                <View style={styles.countryPicker}>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                </View>
                <Input
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  autoFocus={!isLocked}
                  maxLength={11}
                  editable={!isLocked}
                  style={{ flex: 1, backgroundColor: 'transparent', borderWidth: 0 }}
                  wrapperStyle={{ flex: 1 }}
                />
              </View>

              {isLocked && timeLeft !== null && (
                <View style={styles.lockoutBanner}>
                  <Text style={styles.lockoutText}>
                    Locked for {formatTime(timeLeft)} due to too many attempts.
                  </Text>
                </View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Send OTP via WhatsApp"
                onPress={() => handleSendOTP('whatsapp')}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={isLocked}
                icon={<MessageCircle size={20} color="white" />}
                style={styles.primaryButton}
              />
              <Button
                title="Send via SMS instead"
                onPress={() => handleSendOTP('sms')}
                variant="outline"
                size="lg"
                disabled={isLoading || isLocked}
                icon={<Phone size={18} color={palette.navy[900]} />}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  inner: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: palette.navy[400],
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: palette.navy[100],
    borderRadius: 16,
    backgroundColor: palette.white,
    overflow: 'hidden',
  },
  inputLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: palette.navy[50],
    borderRadius: 16,
    backgroundColor: palette.navy[50],
    overflow: 'hidden',
    opacity: 0.6,
  },
  countryPicker: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: palette.navy[100],
    backgroundColor: palette.navy[50],
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  lockoutBanner: {
    backgroundColor: palette.rose[50],
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.rose[100],
    marginBottom: spacing.lg,
  },
  lockoutText: {
    color: palette.rose[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  errorText: {
    color: palette.rose[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.md,
    backgroundColor: '#25D366', // WhatsApp Green
    borderColor: '#25D366',
  },
});


