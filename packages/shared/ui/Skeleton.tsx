/**
 * Skeleton — shimmer animation loading placeholder.
 * Uses react-native-reanimated for smooth shimmer.
 */
import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from './useTheme';
import { borderRadius } from './tokens';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadiusSize?: 'sm' | 'md' | 'lg' | 'full';
  style?: ViewStyle;
  testID?: string;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadiusSize = 'sm',
  style,
  testID,
}: SkeletonProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700, easing: Easing.ease }),
        withTiming(1, { duration: 700, easing: Easing.ease })
      ),
      -1,   // infinite
      false // don't reverse (sequence handles it)
    );
    return () => {
      opacity.value = 1;
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const radii = {
    sm:   borderRadius.sm,
    md:   borderRadius.md,
    lg:   borderRadius.lg,
    full: borderRadius.full,
  };

  return (
    <Animated.View
      testID={testID}
      style={[
        animatedStyle,
        {
          width,
          height,
          backgroundColor: theme.skeletonBase,
          borderRadius: radii[borderRadiusSize],
        },
        style,
      ]}
    />
  );
}

/** Pre-composed skeleton for a provider card */
export function ProviderCardSkeleton() {
  return (
    <View style={{ gap: 10, padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Skeleton width={48} height={48} borderRadiusSize="full" />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={16} borderRadiusSize="sm" />
          <Skeleton width="40%" height={12} borderRadiusSize="sm" />
        </View>
      </View>
      <Skeleton width="80%" height={12} borderRadiusSize="sm" />
      <Skeleton width="50%" height={12} borderRadiusSize="sm" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton width={60} height={24} borderRadiusSize="full" />
        <Skeleton width={60} height={24} borderRadiusSize="full" />
      </View>
    </View>
  );
}
