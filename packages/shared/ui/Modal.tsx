/**
 * Modal — Bottom sheet using react-native-reanimated.
 * Slides up from bottom with backdrop overlay.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius } from './tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number;
  showHandle?: boolean;
  testID?: string;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  maxHeight = SCREEN_HEIGHT * 0.9,
  showHandle = true,
  testID,
}: ModalProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && translateY.value === SCREEN_HEIGHT) return null;

  return (
    <View
      testID={testID}
      style={StyleSheet.absoluteFillObject}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose} accessibilityLabel="Close">
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: theme.overlayBackground },
            backdropStyle,
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          sheetStyle,
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight,
            backgroundColor: theme.surface,
            borderTopLeftRadius: borderRadius['2xl'],
            borderTopRightRadius: borderRadius['2xl'],
            paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
          },
        ]}
      >
        {/* Handle */}
        {showHandle ? (
          <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: theme.border,
                borderRadius: borderRadius.full,
              }}
            />
          </View>
        ) : null}

        {/* Title */}
        {title ? (
          <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: theme.textPrimary,
              }}
            >
              {title}
            </Text>
          </View>
        ) : null}

        {children}
      </Animated.View>
    </View>
  );
}
