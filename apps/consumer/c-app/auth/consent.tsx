import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@travelhealthbridge/shared';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { useAuthStore } from 'store/authStore';
import { palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui/tokens';

export default function ConsentScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { session, isGuest } = useAuthStore();

  const handleConsent = async () => {
    setIsLoading(true);
    
    try {
      if (session?.user) {
        // Authenticated user - store consent in DB
        await supabase.from('user_profiles').upsert({
          id: session.user.id,
          consent_given: true,
          updated_at: new Date().toISOString(),
        });
      }
      
      // Guest mode consent could be stored in local storage, but for now
      // we'll just navigate to the home/triage screen and consider it implicitly given
      // for the session.

      router.replace('/'); // Redirect to home/triage root
    } catch (e) {
      console.error('Failed to save consent:', e);
      // Failsafe: let them through if DB fails so they aren't blocked from care
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} alwaysBounceVertical={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Before we continue</Text>
          
          <Text style={styles.body}>
            Travel Health Bridge helps you find verified doctors. We are a referral platform, not a medical provider.
          </Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Always call <Text style={{fontWeight: 'bold'}}>102</Text> or <Text style={{fontWeight: 'bold'}}>108</Text> for life-threatening emergencies.
            </Text>
          </View>
          
          <Text style={styles.body}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>

          <View style={styles.linkContainer}>
            <Text style={styles.link}>View Terms of Service</Text>
            <Text style={styles.link}>View Privacy Policy</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="I understand, continue" 
          onPress={handleConsent} 
          variant="primary" 
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray[900], // Dark backdrop feel
    justifyContent: 'center',
    padding: spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: palette.gray[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    fontSize: typography.fontSize.md,
    color: palette.gray[700],
    lineHeight: 24,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: palette.red[50],
    borderWidth: 1,
    borderColor: palette.red[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningText: {
    fontSize: typography.fontSize.md,
    color: palette.red[800],
    textAlign: 'center',
    lineHeight: 22,
  },
  linkContainer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  link: {
    fontSize: typography.fontSize.sm,
    color: palette.teal[600],
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: spacing.xl,
  },
});


