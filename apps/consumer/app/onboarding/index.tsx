import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { ShieldCheck, MapPin, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    text: 'Sick in an unfamiliar city? We tell you where to go in 2 minutes.',
    icon: <Zap size={80} color={palette.teal[400]} />,
  },
  {
    id: '2',
    text: 'Every doctor personally verified. Price committed upfront.',
    icon: <ShieldCheck size={80} color={palette.teal[400]} />,
  },
  {
    id: '3',
    text: 'Free. Available across 6 Indian cities. Emergency line always on.',
    icon: <MapPin size={80} color={palette.teal[400]} />,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { completeOnboarding, setGuestMode } = useAuthStore();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleFinish = async (isGuest: boolean) => {
    await completeOnboarding();
    if (isGuest) {
      setGuestMode(true);
      router.replace('/');
    } else {
      router.replace('/auth/phone');
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>{item.icon}</View>
      <Text style={styles.slideText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleFinish(true)} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(ev) => {
          const index = Math.round(ev.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dotRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx && styles.dotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonWrapper}>
          {currentIndex === SLIDES.length - 1 ? (
            <View style={styles.finalActions}>
              <Button
                title="Get Started"
                onPress={() => handleFinish(false)}
                variant="primary"
                size="lg"
                fullWidth
              />
              <TouchableOpacity onPress={() => handleFinish(true)} style={styles.guestLink}>
                <Text style={styles.guestLinkText}>Skip for now (Guest Mode)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              variant="secondary"
              size="lg"
              fullWidth
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.navy[900],
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    color: palette.navy[400],
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  slide: {
    width,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  slideText: {
    color: palette.white,
    fontSize: 28,
    fontWeight: typography.fontWeight.black,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl * 2,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.navy[700],
  },
  dotActive: {
    backgroundColor: palette.teal[400],
    width: 24,
  },
  buttonWrapper: {
    minHeight: 120,
  },
  finalActions: {
    gap: spacing.lg,
  },
  guestLink: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  guestLinkText: {
    color: palette.teal[400],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
});
