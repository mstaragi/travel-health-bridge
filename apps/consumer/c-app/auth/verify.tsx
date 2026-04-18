import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@travelhealthbridge/shared';
import { useAuthStore } from 'store/authStore';
import { OTPInput } from '@travelhealthbridge/shared/ui/OTPInput';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { ChevronLeft, RefreshCcw } from 'lucide-react-native';

export default function VerifyScreen() {
  const { phone, channel } = useLocalSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  
  const { lockUntil, setLockout } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (lockUntil && lockUntil > Date.now()) {
      router.replace('/auth/phone');
    }
  }, [lockUntil]);

  const handleVerify = async (otp: string) => {
    if (attempts >= 5) {
      await setLockout(15);
      return;
    }

    Keyboard.dismiss();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: String(phone),
        token: otp,
        type: 'sms',
      });

      if (verifyError) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          await setLockout(15);
          setError('Too many failed attempts. Locked for 15 minutes.');
        } else {
          setError(`Incorrect code. ${5 - newAttempts} attempts remaining.`);
        }
      } else if (data.session) {
        // Success - track auth completion
        track('auth_completed', { 
          method: 'sms',
          is_new_user: data.user?.last_sign_in_at ? false : true 
        });
        
        // Success - check if profile complete or go home
        router.replace('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setError('');
    setIsLoading(true);
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({ 
        phone: String(phone) 
      });
      if (resendError) throw resendError;
      
      setCountdown(30);
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color={palette.navy[900]} />
              </TouchableOpacity>
              
              <Text style={styles.title}>Confirm your code</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to <Text style={styles.phoneText}>{phone}</Text> via {channel}.
              </Text>

              <View style={styles.otpWrapper}>
                <OTPInput 
                  onComplete={handleVerify}
                  error={!!error}
                  disabled={isLoading}
                />
              </View>
              
              <View style={styles.errorContainer}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <View style={styles.resendWrapper}>
                {countdown > 0 ? (
                  <View style={styles.countdownRow}>
                    <Text style={styles.resendText}>Resend code in </Text>
                    <Text style={styles.resendTimer}>{countdown}s</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={handleResend} 
                    style={styles.resendButton}
                    disabled={isLoading}
                  >
                    <RefreshCcw size={16} color={palette.teal[600]} style={styles.resendIcon} />
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Verify & Continue"
                onPress={() => {}} // OTPInput handles auto-submit, but this is a fallback/UX anchor
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={true} // Only active if needed, but Prompt says Auto-submit
                style={{ opacity: 0.5 }}
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
  backButton: {
    marginBottom: spacing.xxl,
    marginLeft: -spacing.sm,
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
    lineHeight: 22,
    marginBottom: 40,
  },
  phoneText: {
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  otpWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  errorContainer: {
    minHeight: 24,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: palette.rose[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  resendWrapper: {
    alignItems: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    color: palette.navy[400],
    fontSize: typography.fontSize.sm,
  },
  resendTimer: {
    color: palette.navy[900],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.teal[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  resendIcon: {
    marginRight: spacing.xs,
  },
  resendLink: {
    color: palette.teal[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    marginBottom: spacing.xl,
  },
});


