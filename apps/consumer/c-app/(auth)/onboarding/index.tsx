/**
 * (auth)/onboarding/index.tsx — 3-slide onboarding carousel
 *
 * Slides:
 * 1. "Get sick in any city?" - Find doctors without local knowledge
 * 2. "Verified doctors" - All doctors verified by TravelHealthBridge
 * 3. "Free, 24/7" - 6 cities, 24/7 support, no fees
 *
 * Cannot skip slides. "Get started" button at end navigates to app.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Toast } from '@travelhealthbridge/shared';
import { useTheme } from '@travelhealthbridge/shared';
import { useAuthStore } from '../../store/authStore';
import { typography, spacing, borderRadius, palette } from '@travelhealthbridge/shared';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SLIDES = [
  {
    title: 'Get sick in any city?',
    description: 'Find verified doctors without knowing anyone local',
    emoji: '🏥',
    color: palette.blue[50],
  },
  {
    title: 'Verified doctors',
    description: 'Every doctor personally verified by Travel Health Bridge',
    emoji: '✅',
    color: palette.teal[50],
  },
  {
    title: 'Free, 24/7',
    description: 'In 6 Indian cities, open 24 hours a day, every day. No signup fee.',
    emoji: '🌍',
    color: palette.green[50],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { completeOnboarding } = useAuthStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentSlide(currentIndex);
  };

  const handleGetStarted = async () => {
    try {
      await completeOnboarding();
      Toast.show({
        type: 'success',
        message: 'Welcome to Travel Health Bridge!',
      });
      router.replace('/(tabs)/(home)');
    } catch (err) {
      Toast.show({
        type: 'error',
        message: 'Failed to complete onboarding',
      });
    }
  };

  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Slides Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        scrollIndicatorInsets={{ right: 1 }}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={{
              width: SCREEN_WIDTH,
              backgroundColor: slide.color,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: spacing.xl,
            }}
          >
            {/* Emoji */}
            <Text style={{ fontSize: 80, marginBottom: spacing.xl }}>
              {slide.emoji}
            </Text>

            {/* Title */}
            <Text
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.extrabold,
                color: theme.textPrimary,
                marginBottom: spacing.lg,
                textAlign: 'center',
              }}
            >
              {slide.title}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: typography.fontSize.base,
                color: theme.textSecondary,
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer: Indicators + Buttons */}
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xl,
          paddingTop: spacing.lg,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.inputBorder,
        }}
      >
        {/* Slide Indicators */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                scrollRef.current?.scrollTo({
                  x: index * SCREEN_WIDTH,
                  animated: true,
                });
              }}
              style={{
                width: index === currentSlide ? 32 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentSlide ? palette.teal[600] : palette.gray[300],
              }}
            />
          ))}
        </View>

        {/* Action Button */}
        {isLastSlide ? (
          <Button
            label="Get Started"
            onPress={handleGetStarted}
            size="lg"
            fullWidth
            variant="primary"
          />
        ) : (
          <Button
            label="Next"
            onPress={() => {
              scrollRef.current?.scrollTo({
                x: (currentSlide + 1) * SCREEN_WIDTH,
                animated: true,
              });
            }}
            size="lg"
            fullWidth
            variant="primary"
          />
        )}

        {/* Skip/Back Links */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.lg,
          }}
        >
          {currentSlide > 0 && (
            <TouchableOpacity
              onPress={() => {
                scrollRef.current?.scrollTo({
                  x: (currentSlide - 1) * SCREEN_WIDTH,
                  animated: true,
                });
              }}
            >
              <Text
                style={{
                  color: palette.teal[600],
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {!isLastSlide && (
            <TouchableOpacity onPress={handleGetStarted}>
              <Text
                style={{
                  color: palette.gray[600],
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
