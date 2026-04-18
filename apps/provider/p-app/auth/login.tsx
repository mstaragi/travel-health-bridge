import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Mail, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react-native';
import { Input, Button, OTPInput, palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setSession, error: profileError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid clinic email.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Providers must be pre-registered by THB
      }
    });

    setIsLoading(false);

    if (otpErr) {
      setError(otpErr.message);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    const { data: { session }, error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyErr) {
      setError(verifyErr.message);
      setIsLoading(false);
    } else {
      // Session will be picked up by store via setSession if needed,
      // but we wait for profile resolution in store
      setSession(session);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoSlot}>
             <ShieldCheck size={48} color={palette.teal[600]} />
          </View>
          <Text style={styles.title}>Provider Portal</Text>
          <Text style={styles.subtitle}>
            {step === 'email' 
              ? 'Enter your registered clinic email to access your dashboard.'
              : `We've sent a 6-digit code to ${email}`}
          </Text>
        </View>

        {(error || profileError) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error || profileError}</Text>
            {profileError?.includes('Not registered') && (
               <TouchableOpacity 
                 style={styles.helpLink}
                 onPress={() => Linking.openURL('https://wa.me/thb_ops')}
               >
                 <Text style={styles.helpLinkText}>Contact Support</Text>
                 <ExternalLink size={14} color={palette.teal[700]} />
               </TouchableOpacity>
            )}
          </View>
        )}

        {step === 'email' ? (
          <View style={styles.form}>
            <Input
              label="Clinic Email"
              value={email}
              onChangeText={setEmail}
              placeholder="doctor@clinic.com"
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Mail size={20} color={palette.navy[400]} />}
            />
            <Button
              title="Send One-Time Password"
              onPress={handleSendOtp}
              loading={isLoading}
              style={{ marginTop: spacing.lg }}
              rightIcon={<ArrowRight size={20} color="#fff" />}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Verification Code</Text>
            <OTPInput
              value={otp}
              onChange={setOtp}
              digits={6}
            />
            <Button
              title="Verify & Sign In"
              onPress={handleVerifyOtp}
              loading={isLoading}
              disabled={otp.length !== 6}
              style={{ marginTop: spacing.xl }}
            />
            <TouchableOpacity 
              onPress={() => setStep('email')}
              style={styles.backBtn}
            >
              <Text style={styles.backResetText}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Access restricted to verified medical partners.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoSlot: {
     width: 80,
     height: 80,
     borderRadius: 20,
     backgroundColor: palette.teal[50],
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.navy[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: palette.navy[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: palette.red[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.red[200],
  },
  errorText: {
    color: palette.red[700],
    fontSize: 14,
    lineHeight: 20,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  helpLinkText: {
    color: palette.teal[700],
    fontWeight: '600',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.navy[700],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  backResetText: {
    color: palette.navy[400],
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: palette.navy[50],
  },
  footerText: {
    fontSize: 12,
    color: palette.navy[300],
    textAlign: 'center',
  }
});
