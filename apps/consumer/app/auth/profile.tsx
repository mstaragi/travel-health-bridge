import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, CITIES, LANGUAGES, track, identify } from '@travelhealthbridge/shared';
import { Input } from '@travelhealthbridge/shared/ui/Input';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Tag } from '@travelhealthbridge/shared/ui/Tag';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => 
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSkip = () => {
    track('onboarding_completed', { skipped: true });
    router.push('/auth/consent');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let pushToken = null;
      if (notificationsEnabled) {
        pushToken = await registerForPushNotificationsAsync();
      }

      // Identify user for analytics
      identify(user.id, { city: homeCity });
      track('onboarding_completed', { skipped: false });

      // Upsert to user_profiles table
      await supabase.from('user_profiles').upsert({
        id: user.id, // Primary key
        name: name || null,
        home_city: homeCity || null,
        languages: selectedLanguages,
        notifications_enabled: notificationsEnabled,
        expo_push_token: pushToken,
        notification_prefs: {
          follow_up: true,
          announcements: false,
          quiet_hours: { start: '22:00', end: '07:00' }
        },
        updated_at: new Date().toISOString(),
      });

      router.push('/auth/consent');
    } catch (e) {
      console.error('Error saving profile:', e);
      router.push('/auth/consent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Set up later</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>Help us personalize your medical recommendations.</Text>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name (Optional)</Text>
          <Input 
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            autoCapitalize="words"
          />
        </View>

        {/* City Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Home City</Text>
          <View style={styles.chipContainer}>
            {CITIES.map((city) => (
              <TouchableOpacity key={city.id} onPress={() => setHomeCity(city.name)}>
                <Tag 
                  label={city.name} 
                  variant={homeCity === city.name ? 'primary' : 'neutral'} 
                  style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.label}>Languages Spoken</Text>
          <Text style={styles.hint}>Select all that apply so we can match you with the right doctor.</Text>
          <View style={styles.chipContainer}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity key={lang} onPress={() => toggleLanguage(lang)}>
                <Tag 
                  label={lang} 
                  variant={selectedLanguages.includes(lang) ? 'primary' : 'neutral'} 
                  style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.notificationSection}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={styles.label}>Allow Notifications</Text>
            <Text style={styles.hint}>
              So we can remind you to share feedback after your visit.
            </Text>
          </View>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: palette.gray[300], true: palette.teal[400] }}
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={handleSubmit} 
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
    backgroundColor: palette.gray[50], // theme.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  skipText: {
    color: palette.teal[600],
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: palette.gray[500],
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: palette.gray[800],
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[500],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  notificationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.gray[0],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: palette.gray[200],
    marginBottom: spacing.xl,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: palette.gray[0],
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
  },
});
