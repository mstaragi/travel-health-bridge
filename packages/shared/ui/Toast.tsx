/**
 * Toast — Imperative toast notification.
 * API: Toast.show({ type: 'success' | 'error' | 'info', message })
 *
 * Usage:
 *   1. Mount <ToastProvider /> once at app root
 *   2. Call Toast.show({ type: 'success', message: 'Saved!' }) anywhere
 */
import React, { createRef, useImperativeHandle, useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { lightTheme, typography, spacing, borderRadius, palette } from './tokens';

export type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number; // ms, default 3000
}

interface ToastHandle {
  show: (config: ToastConfig) => void;
}

// Global ref — accessible anywhere without React context
const toastRef = createRef<ToastHandle>();

export const Toast = {
  show: (config: ToastConfig) => {
    toastRef.current?.show(config);
  },
};

export function ToastProvider() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig>({ type: 'info', message: '' });
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(toastRef, () => ({
    show: (newConfig) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setConfig(newConfig);
      setVisible(true);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(newConfig.duration ?? 3000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    },
  }));

  if (!visible) return null;

  const bgColors: Record<ToastType, string> = {
    success: palette.green[800],
    error:   palette.red[700],
    info:    palette.navy[800],
  };

  const icons: Record<ToastType, string> = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 32,
        left: 16,
        right: 16,
        zIndex: 9999,
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: bgColors[config.type],
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 16, color: '#FFFFFF' }}>{icons[config.type]}</Text>
        <Text
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {config.message}
        </Text>
      </View>
    </Animated.View>
  );
}
