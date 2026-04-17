import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { 
  CITIES, 
  NATIONAL_EMERGENCY_NUMBERS, 
  HELPLINE_WHATSAPP_NUMBER 
} from '@travelhealthbridge/shared/constants';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { HelplineCTA } from '@travelhealthbridge/shared/ui/HelplineCTA';
import { ConsentMessageModal } from '@travelhealthbridge/shared/ui/ConsentMessageModal';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { Phone, MapPin, AlertCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react-native';
import { useTriageStore } from '../../store/triageStore';
import { database } from '../../db';
import { logSOS } from '../../lib/analytics';
import { track } from '@travelhealthbridge/shared';

export default function EmergencyScreen() {
  const router = useRouter();
  const { city: storedCity, setCity } = useTriageStore();
  const [selectedCityId, setSelectedCityId] = useState<string | null>(storedCity);
  const [detectedCityId, setDetectedCityId] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [showSOSConsent, setShowSOSConsent] = useState(false);
  const [vaultData, setVaultData] = useState<any>(null);

  useEffect(() => {
    detectLocation();
    loadVaultData();
    track('emergency_screen_opened');
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission denied');

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address?.city) {
        const match = CITIES.find(c => c.name.toLowerCase() === address.city?.toLowerCase());
        if (match) {
          setDetectedCityId(match.id);
          if (!selectedCityId) setSelectedCityId(match.id);
        } else {
          setShowSelector(true);
        }
      }
    } catch (e) {
      setShowSelector(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const loadVaultData = async () => {
    try {
      const entries = await database.get('vault_entries').query().fetch();
      if (entries.length > 0) setVaultData(entries[0]);
    } catch (e) {
      console.error('Failed to load vault for SOS payload');
    }
  };

  const calculateVaultCompletion = () => {
    if (!vaultData) return 0;
    let filled = 0;
    const fields = ['blood_group', 'allergies_json', 'medications_json', 'emergency_contacts_json', 'insurer_name'];
    fields.forEach(f => { if (vaultData[f]) filled++; });
    return Math.round((filled / fields.length) * 100);
  };

  const activeCity = CITIES.find(c => c.id === selectedCityId);

  const handleSOSConfirm = async () => {
    setShowSOSConsent(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const completion = calculateVaultCompletion();
    const payload = {
      city: activeCity?.name || 'Unknown',
      blood_group: vaultData?.blood_group || null,
      known_allergies: !!(vaultData?.allergies_json && JSON.parse(vaultData.allergies_json).length > 0),
      has_emergency_contact: !!(vaultData?.emergency_contacts_json && JSON.parse(vaultData.emergency_contacts_json).length > 0),
      vault_completion_pct: completion,
    };

    track('sos_triggered', payload);
    await logSOS(payload);
    
    // Attempt location share via SMS/WhatsApp after logging
    try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
        const sosMessage = `EMERGENCY SOS — I need urgent assistance in ${activeCity?.name || 'my location'}. Map: ${mapsUrl}`;
        
        let contacts = [];
        if (vaultData?.emergency_contacts_json) {
            try { contacts = JSON.parse(vaultData.emergency_contacts_json); } catch (e) {}
        }

        if (contacts.length > 0 && contacts[0].phone) {
            track('emergency_contact_notified', { method: 'whatsapp', contact_type: 'personal' });
            Linking.openURL(`whatsapp://send?phone=${contacts[0].phone}&text=${encodeURIComponent(sosMessage)}`);
        } else {
            track('emergency_contact_notified', { method: 'whatsapp', contact_type: 'helpline' });
            Linking.openURL(`whatsapp://send?phone=${HELPLINE_WHATSAPP_NUMBER}&text=${encodeURIComponent(sosMessage)}`);
        }
    } catch (err) {
        Alert.alert('SOS Triggered', 'Emergency services notified. Please call 102 if possible.');
    }
  };

  const handleCall = (number: string) => {
    const cleanNumber = number.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* HEADER / CITY STATUS */}
        <View style={styles.header}>
          <View style={styles.cityStatus}>
            <MapPin size={18} color={palette.teal[600]} />
            <View>
              <Text style={styles.cityLabel}>Current City</Text>
              <View style={styles.cityRow}>
                <Text style={styles.cityName}>
                  {isDetecting ? 'Detecting...' : (activeCity?.name || 'Not Selected')}
                </Text>
                {isDetecting && <ActivityIndicator size="small" color={palette.teal[600]} style={{ marginLeft: 8 }} />}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.changeBtn} 
              onPress={() => setShowSelector(!showSelector)}
            >
              <Text style={styles.changeBtnText}>{showSelector ? 'Close' : 'Change'}</Text>
              {showSelector ? <ChevronUp size={16} color={palette.teal[600]} /> : <ChevronDown size={16} color={palette.teal[600]} />}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* INLINE CITY SELECTOR */}
          {showSelector && (
            <View style={styles.selector}>
              <Text style={styles.selectorTitle}>Select your city for verified hospitals</Text>
              <View style={styles.cityGrid}>
                {CITIES.map(city => (
                  <TouchableOpacity 
                    key={city.id} 
                    style={[styles.cityChip, selectedCityId === city.id && styles.cityChipActive]}
                    onPress={() => {
                      setSelectedCityId(city.id);
                      setCity(city.id);
                      setShowSelector(false);
                    }}
                  >
                    <Text style={[styles.cityChipText, selectedCityId === city.id && styles.cityChipTextActive]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* EMERGENCY CONTACT STACK */}
          <View style={styles.section}>
            <Button
              label={`Call Ambulance (${NATIONAL_EMERGENCY_NUMBERS.ambulance})`}
              onPress={() => handleCall(NATIONAL_EMERGENCY_NUMBERS.ambulance)}
              variant="primary"
              fullWidth
              style={styles.ambulanceBtn}
              textStyle={styles.ambulanceBtnText}
            />

            {activeCity ? (
              <View style={styles.hospitalCard}>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalBrand}>VERIFIED EMERGENCY CARE</Text>
                  <Text style={styles.hospitalName}>{activeCity.emergency.hospital}</Text>
                  <Text style={styles.hospitalPhone}>{activeCity.emergency.phone}</Text>
                  <Text style={styles.hospitalAddress}>{activeCity.name}, {activeCity.state}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.hospitalCallBtn}
                  onPress={() => handleCall(activeCity.emergency.phone)}
                >
                  <Phone size={20} color={palette.white} />
                  <Text style={styles.hospitalCallText}>Call</Text>
                </TouchableOpacity>
              </View>
            ) : !showSelector ? (
                <View style={styles.errorCard}>
                    <AlertCircle size={20} color={palette.rose[600]} />
                    <Text style={styles.errorText}>No city selected. Use selector above.</Text>
                </View>
            ) : null}

            <View style={styles.helplineWrapper}>
              <View style={styles.helplineHeader}>
                <MessageCircle size={20} color={palette.navy[400]} />
                <Text style={styles.helplineTitle}>Message Support</Text>
              </View>
              <HelplineCTA 
                prefilledMessage="EMERGENCY — I need urgent assistance." 
                style={styles.helplineBtn}
              />
              <Text style={styles.helplineNote}>Available 8am – 11pm IST · Typical response 2min</Text>
            </View>
          </View>

          {/* SOS BUTTON */}
          <View style={styles.sosSection}>
            <TouchableOpacity 
              style={styles.sosButton}
              onPress={() => setShowSOSConsent(true)}
              activeOpacity={0.8}
            >
              <AlertCircle size={32} color={palette.white} />
              <Text style={styles.sosText}>I Need Immediate Help</Text>
              <Text style={styles.sosSubtext}>Triggers location share & alerts emergency contact</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ConsentMessageModal
        visible={showSOSConsent}
        onConfirm={handleSOSConfirm}
        onCancel={() => setShowSOSConsent(false)}
        userCity={activeCity?.name || 'their current city'}
        contactName={vaultData?.emergency_contacts_json ? JSON.parse(vaultData.emergency_contacts_json)[0]?.name : undefined}
        contactPhone={vaultData?.emergency_contacts_json ? JSON.parse(vaultData.emergency_contacts_json)[0]?.phone : undefined}
        providerName=""
        providerAddress=""
      />
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
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
  },
  cityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.black,
    color: palette.teal[600],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
  },
  changeBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: palette.teal[50],
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: palette.teal[600],
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },
  selector: {
    backgroundColor: palette.navy[50],
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.navy[100],
  },
  cityChipActive: {
    backgroundColor: palette.teal[600],
    borderColor: palette.teal[600],
  },
  cityChipText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: palette.navy[900],
  },
  cityChipTextActive: {
    color: palette.white,
    fontWeight: typography.fontWeight.black,
  },
  section: {
    gap: spacing.xl,
  },
  ambulanceBtn: {
    backgroundColor: palette.rose[600],
    height: 80,
    borderRadius: 24,
  },
  ambulanceBtnText: {
    fontSize: 20,
    fontWeight: typography.fontWeight.black,
    color: palette.white,
  },
  hospitalCard: {
    backgroundColor: palette.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.navy[50],
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: palette.navy[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalBrand: {
    fontSize: 10,
    fontWeight: typography.fontWeight.black,
    color: palette.teal[600],
    letterSpacing: 1,
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: 2,
  },
  hospitalPhone: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[400],
    marginBottom: 8,
  },
  hospitalAddress: {
    fontSize: 12,
    color: palette.navy[200],
    fontWeight: typography.fontWeight.medium,
  },
  hospitalCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.teal[600],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  hospitalCallText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: palette.white,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: palette.rose[50],
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: palette.rose[700],
    fontWeight: typography.fontWeight.bold,
  },
  helplineWrapper: {
    backgroundColor: palette.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.navy[50],
    padding: spacing.xl,
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  helplineTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  helplineBtn: {
    backgroundColor: palette.navy[900],
    borderRadius: 16,
  },
  helplineNote: {
    fontSize: 12,
    color: palette.navy[200],
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
  sosSection: {
    marginTop: 40,
  },
  sosButton: {
    backgroundColor: palette.rose[600],
    padding: spacing.xxl,
    borderRadius: 32,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: palette.rose[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sosText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.black,
    color: palette.white,
    letterSpacing: -0.5,
  },
  sosSubtext: {
    fontSize: 12,
    color: palette.white,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
});
