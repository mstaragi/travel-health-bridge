import { track } from '@travelhealthbridge/shared';

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  useEffect(() => {
    // Mock simulation
    if (id) {
      const p = fetchMockProvider(id as string);
      setProvider(p);
      track('provider_profile_viewed', { 
        provider_id: p.id,
        provider_name: p.name
      });
    }
  }, [id]);

  const handleSave = () => {
    if (provider) {
      track('provider_saved', { provider_id: provider.id });
      // Logic for saving...
    }
  };

  if (!provider) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.teal[600]} />
      </View>
    );
  }

  const isStale = provider.staleness_tier === 'stale';
  const openStatus = isOpenNow(provider.opd_hours, new Date());

  const handleCall = () => {
    Linking.openURL(`tel:1234567890`);
  };

  const handleDirections = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${provider.lat},${provider.lng}`,
      android: `google.navigation:q=${provider.lat},${provider.lng}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: palette.gray[0] }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Photo Placeholder */}
        <View style={styles.imageHeader}>
           <Image 
             source={{ uri: 'https://images.unsplash.com/photo-1586773860418-d319a221f52c?q=80&w=2073&auto=format&fit=crop' }} 
             style={styles.headerImage}
           />
           <View style={styles.imageOverlay} />
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.area}>{provider.area}, {provider.city}</Text>
          
          <View style={styles.badgeRow}>
            {provider.verified && <Badge date={provider.badge_date} style={{ marginRight: spacing.sm }} />}
            <OpenStatusBadge status={openStatus} />
          </View>

          {isStale && (
            <View style={styles.staleBanner}>
              <Text style={styles.staleText}>⚠ Availability recently unconfirmed — call ahead before visiting</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Languages */}
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languages}>
            {provider.languages.map(lang => (
              <LanguagePill key={lang} language={lang} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
            ))}
          </View>
          <Text style={styles.infoNote}>Language verified by Travel Health Bridge. Tests communication ability.</Text>

          <View style={styles.divider} />

          {/* Pricing */}
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingRow}>
             <Text style={styles.feeRange}>{formatFeeRange(provider.fee_opd.min, provider.fee_opd.max)}</Text>
             <View style={styles.committedBadge}>
                 <Text style={styles.committedText}>✓ Price Committed</Text>
             </View>
          </View>
          <Text style={styles.infoNote}>
            This provider agreed in writing to charge within this range. Charged more? 
            <Text style={styles.linkText} onPress={() => router.push(`/(providers)/${id}/report`)}> Report it</Text> — we investigate within 24 hours.
          </Text>

          <View style={styles.divider} />

          {/* OPD Hours */}
          <TouchableOpacity 
            style={styles.hoursHeader} 
            onPress={() => setIsHoursExpanded(!isHoursExpanded)}
          >
            <Text style={styles.sectionTitle}>OPD Hours</Text>
            <Text style={styles.expandLink}>{isHoursExpanded ? 'Hide' : 'Show weekly'}</Text>
          </TouchableOpacity>
          
          {isHoursExpanded && (
            <View style={styles.hoursTable}>
              {Object.entries(provider.opd_hours).map(([day, slots]: [string, any]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.dayText}>{day}</Text>
                  <Text style={styles.timeText}>
                    {slots.length > 0 ? slots.map((s: any) => `${s.open} - ${s.close}`).join(', ') : 'Closed'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Doctors */}
          <Text style={styles.sectionTitle}>Doctors</Text>
          <View style={styles.doctorItem}>
            <Text style={styles.doctorName}>Dr. S. K. Sharma</Text>
            <Text style={styles.doctorSub}>MBBS, MD · General Physician</Text>
          </View>
          <View style={styles.doctorItem}>
            <Text style={styles.doctorName}>Dr. Anjali Mehta</Text>
            <Text style={styles.doctorSub}>MBBS · Travel Medicine Specialist</Text>
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapPlaceholder}>
              <Text style={{ color: palette.gray[400] }}>Google Maps Embed Placeholder</Text>
          </View>
          <TouchableOpacity style={styles.mapLink} onPress={handleDirections}>
            <Text style={styles.linkText}>Open in Google Maps</Text>
          </TouchableOpacity>
          <Text style={styles.addressText}>15th Main Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034</Text>

          <View style={styles.divider} />

          {/* Reviews */}
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyReviewsText}>Reviews from verified travelers will appear here as they visit.</Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionInner}>
          <TouchableOpacity style={styles.saveBtn}>
             <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <Button 
            title="Get Directions" 
            variant="secondary" 
            onPress={handleDirections}
            style={{ flex: 1, marginHorizontal: spacing.sm }} 
          />
          <Button 
            title="Call Now" 
            variant="primary" 
            onPress={handleCall}
            style={{ flex: 1.2 }} 
          />
        </View>
        <TouchableOpacity style={styles.notReachable} onPress={() => setBottomSheetVisible(true)}>
           <Text style={styles.notReachableText}>Provider not reachable?</Text>
        </TouchableOpacity>
      </View>

      {bottomSheetVisible && (
        <FailureBottomSheet 
          primaryProviderName={provider.name}
          onClose={() => setBottomSheetVisible(false)}
          onTryAlternative={() => setBottomSheetVisible(false)}
          onSearchAll={() => {
            setBottomSheetVisible(false);
            router.replace('/(tabs)/search');
          }}
          onOpenHelpline={() => {
            setBottomSheetVisible(false);
            Linking.openURL(`whatsapp://send?phone=910000000000&text=Provider ${provider.name} not reachable.`);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray[0],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
  },
  imageHeader: {
    height: 240,
    width: '100%',
    backgroundColor: palette.gray[200],
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mainInfo: {
    padding: spacing.xl,
    marginTop: -40,
    backgroundColor: palette.gray[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  name: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: palette.gray[900],
  },
  area: {
    fontSize: typography.fontSize.md,
    color: palette.gray[500],
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  staleBanner: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: palette.amber[50],
    borderLeftWidth: 3,
    borderLeftColor: palette.amber[500],
    borderRadius: 4,
  },
  staleText: {
    fontSize: typography.fontSize.xs,
    color: palette.amber[900],
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray[100],
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[900],
    marginBottom: spacing.md,
  },
  languages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoNote: {
    fontSize: typography.fontSize.xs,
    color: palette.gray[500],
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  linkText: {
    color: palette.teal[700],
    fontWeight: typography.fontWeight.bold,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeRange: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: palette.teal[800],
  },
  committedBadge: {
    backgroundColor: palette.teal[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  committedText: {
    color: palette.gray[0],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  hoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandLink: {
    color: palette.teal[700],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  hoursTable: {
    marginTop: spacing.md,
    backgroundColor: palette.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[700],
    fontWeight: typography.fontWeight.medium,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[900],
  },
  doctorItem: {
    marginBottom: spacing.md,
  },
  doctorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[800],
  },
  doctorSub: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[500],
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: palette.gray[100],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.gray[200],
    marginBottom: spacing.sm,
  },
  mapLink: {
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[600],
    lineHeight: 20,
  },
  emptyReviews: {
    padding: spacing.lg,
    backgroundColor: palette.gray[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: typography.fontSize.sm,
    color: palette.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.gray[0],
    padding: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
    ...shadows.lg,
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: palette.gray[600],
  },
  notReachable: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  notReachableText: {
    color: palette.gray[500],
    fontSize: typography.fontSize.xs,
    textDecorationLine: 'underline',
  },
});


