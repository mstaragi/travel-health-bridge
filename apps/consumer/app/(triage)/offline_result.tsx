import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTriageStore } from '../../store/triageStore';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { WifiOff, Phone, MapPin, AlertCircle, ShieldAlert } from 'lucide-react-native';
import { Button } from '@travelhealthbridge/shared/ui/Button';

// Mock offline data structure for demonstration
// In reality, this would be fetched from WatermelonDB:offline_providers
const MOCK_OFFLINE_PROVIDERS = [
  {
    name: 'Apollo Spectra (Emergency Care)',
    phone: '9100000001',
    address: 'Koramangala, Bengaluru',
    type: 'Hospital',
  },
  {
    name: 'Sanjeevini Medical (General)',
    phone: '9100000002',
    address: 'Indiranagar, Bengaluru',
    type: 'Clinic',
  }
];

export default function OfflineResult() {
  const { city, urgency } = useTriageStore();
  const [offlineResults, setOfflineResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // In a real implementation:
    // const providers = await database.get('offline_providers').query(Q.where('city', city)).fetch();
    // setOfflineResults(providers.map(p => JSON.parse(p.data_json)));
    
    // For now, filtering mock data to simulate DB query
    setOfflineResults(MOCK_OFFLINE_PROVIDERS);
  }, [city]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.offlineBadge}>
            <WifiOff size={14} color={palette.rose[600]} />
            <Text style={styles.offlineText}>OFFLINE MODE</Text>
          </View>
          <Text style={styles.title}>Nearby Emergency Contacts</Text>
          <Text style={styles.subtitle}>
            You are currently offline. We've pulled verified hospitals in <Text style={styles.bold}>{city || 'your area'}</Text> from your local safety cache.
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.warningBox}>
            <ShieldAlert size={20} color={palette.rose[600]} />
            <Text style={styles.warningText}>
              Phone lines may be active even without internet. Try calling the primary hospital immediately.
            </Text>
          </View>

          {offlineResults.map((provider, index) => (
            <View key={index} style={styles.offlineCard}>
              <View style={styles.cardInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <View style={styles.addressRow}>
                  <MapPin size={14} color={palette.navy[200]} />
                  <Text style={styles.addressText} numberOfLines={1}>{provider.address}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.callCircle} 
                onPress={() => handleCall(provider.phone)}
              >
                <Phone size={20} color={palette.white} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.footerSpacing} />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerHint}>Reconnect to internet for full doctor matching and pricing commitment.</Text>
          <Button
            title="Return to Home"
            onPress={() => router.replace('/')}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
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
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 10 : 20,
    marginBottom: spacing.xl,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.rose[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.black,
    color: palette.rose[600],
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: palette.navy[400],
    lineHeight: 20,
    marginTop: 6,
  },
  bold: {
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: palette.rose[50],
    padding: spacing.lg,
    borderRadius: 20,
    gap: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.rose[100],
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: palette.rose[900],
    lineHeight: 18,
    fontWeight: typography.fontWeight.semibold,
  },
  offlineCard: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.navy[50],
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: palette.navy[300],
    fontWeight: typography.fontWeight.medium,
  },
  callCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: palette.rose[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  footerSpacing: {
    height: 40,
  },
  footer: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 12,
    color: palette.navy[200],
    paddingHorizontal: spacing.xxl,
    lineHeight: 16,
  },
});
