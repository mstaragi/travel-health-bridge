import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { 
  NON_COVERED_CITY_CHECKLIST, 
  NATIONAL_EMERGENCY_NUMBERS, 
  CITIES,
  HELPLINE_WHATSAPP_NUMBER 
} from '@travelhealthbridge/shared/constants';
import { haversineDistance } from '@travelhealthbridge/shared/utils/distance';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui/tokens';

export default function NotCoveredEmergencyScreen() {
  const [nearestCityInfo, setNearestCityInfo] = useState<{ name: string; distance: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          
          let minD = Infinity;
          let nearestCity = '';
          
          CITIES.forEach(city => {
            const d = haversineDistance(loc.coords.latitude, loc.coords.longitude, city.lat, city.lng);
            if (d < minD) {
              minD = d;
              nearestCity = city.name;
            }
          });
          
          setNearestCityInfo({ name: nearestCity, distance: Math.round(minD) });
        }
      } catch (e) {
        console.log('Location calc failed:', e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Emergency Aid', 
          headerStyle: { backgroundColor: palette.navy[900] }, 
          headerTintColor: palette.gray[0] 
        }} 
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>We don't have verified clinics here yet.</Text>
        <Text style={styles.subtitle}>
          Travel Health Bridge verified providers are not available in this location. Follow this safety checklist:
        </Text>

        <View style={styles.checklist}>
          {NON_COVERED_CITY_CHECKLIST.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>National Emergency Numbers</Text>
        <View style={styles.grid}>
          <Button style={styles.gridBtn} title="102 Ambulance" variant="danger" onPress={() => Linking.openURL('tel:102')} />
          <Button style={styles.gridBtn} title="108 Emergency" variant="danger" onPress={() => Linking.openURL('tel:108')} />
          <Button style={styles.gridBtn} title="100 Police" variant="danger" onPress={() => Linking.openURL('tel:100')} />
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Manual Support</Text>
        <Text style={styles.supportText}>
          Even without verified providers, we help travelers manually. Call our helpline or message us:
        </Text>
        <Text style={styles.helplineNumber}>{HELPLINE_WHATSAPP_NUMBER}</Text>
        <Button 
          title="WhatsApp Us Now" 
          variant="secondary" 
          onPress={() => Linking.openURL(`whatsapp://send?phone=${HELPLINE_WHATSAPP_NUMBER}`)} 
        />

        {nearestCityInfo && (
          <View style={styles.distanceBox}>
             <Text style={styles.distanceText}>
               Nearest covered city: <Text style={{fontWeight:'bold'}}>{nearestCityInfo.name}</Text> ({nearestCityInfo.distance} km away)
             </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.navy[900],
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[0],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[400],
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  checklist: {
    backgroundColor: palette.navy[800],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  bullet: {
    fontSize: typography.fontSize.lg,
    color: palette.red[400],
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  itemText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[200],
    lineHeight: 22,
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[0],
    marginBottom: spacing.md,
  },
  grid: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  gridBtn: {
    height: 56,
  },
  divider: {
    height: 1,
    backgroundColor: palette.navy[700],
    marginVertical: spacing.xl,
  },
  supportText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[400],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  helplineNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[0],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  distanceBox: {
    marginTop: spacing['3xl'],
    padding: spacing.md,
    backgroundColor: palette.navy[700],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  distanceText: {
    color: palette.gray[300],
    fontSize: typography.fontSize.xs,
  },
});


