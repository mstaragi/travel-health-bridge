import { track } from '@travelhealthbridge/shared';
import { useRef } from 'react';

export default function Step2City() {
  const { city, setCity } = useTriageStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const startTime = useRef(Date.now());

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please select manually.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address?.city) {
        const foundCity = CITIES.find(
          (c) => c.name.toLowerCase() === address.city?.toLowerCase() || 
                 c.id.toLowerCase() === address.city?.toLowerCase()
        );
        if (foundCity) {
          setCity(foundCity.id);
        } else {
          // City not covered
          track('non_covered_city_hit', { 
            city_entered: address.city,
            nearest_covered_city: 'Delhi', // Placeholder logic for now
            distance_km: 0
          });
          router.push('/(triage)/city-not-covered');
        }
      } else {
        setError('Could not determine city. Please select manually.');
      }
    } catch (err) {
      setError('Could not detect location. Please select manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelect = (cityId: string) => {
    const timeOnStep = Math.round((Date.now() - startTime.current) / 1000);
    track('triage_step_completed', { 
      step_number: 2, 
      value: cityId,
      time_on_step_seconds: timeOnStep
    });
    setCity(cityId);
    router.push('/(triage)/step3-language');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Where are you?</Text>
          <Text style={styles.subtitle}>We need your location to find the nearest verified doctors.</Text>
        </View>

        <TouchableOpacity 
          style={styles.detectButton} 
          onPress={handleDetectLocation}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <ActivityIndicator color={palette.teal[600]} />
          ) : (
            <>
              <Navigation size={20} color={palette.teal[600]} style={styles.detectIcon} />
              <Text style={styles.detectText}>Detect My Location</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={palette.rose[600]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.cityGrid}>
          {CITIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.cityCard,
                city === c.id && styles.cityCardActive
              ]}
              onPress={() => handleSelect(c.id)}
            >
              <MapPin 
                size={20} 
                color={city === c.id ? palette.teal[600] : palette.navy[200]} 
                style={styles.cityIcon} 
              />
              <Text style={[
                styles.cityName,
                city === c.id && styles.cityNameActive
              ]}>
                {c.name}
              </Text>
              {city === c.id && <ChevronRight size={18} color={palette.teal[600]} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.notListedLink} 
          onPress={() => router.push('/(triage)/city-not-covered')}
        >
          <Text style={styles.notListedText}>My city isn't listed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 20 : 40,
    marginBottom: spacing.xxl,
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
    lineHeight: 24,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.teal[50],
    paddingVertical: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.teal[100],
  },
  detectIcon: {
    marginRight: spacing.sm,
  },
  detectText: {
    color: palette.teal[600],
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.rose[50],
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  errorText: {
    color: palette.rose[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  cityGrid: {
    gap: spacing.md,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.navy[50],
  },
  cityCardActive: {
    borderColor: palette.teal[600],
    backgroundColor: palette.teal[0],
  },
  cityIcon: {
    marginRight: spacing.md,
  },
  cityName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: palette.navy[700],
  },
  cityNameActive: {
    color: palette.navy[900],
    fontWeight: typography.fontWeight.black,
  },
  notListedLink: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    padding: spacing.md,
  },
  notListedText: {
    color: palette.navy[400],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
