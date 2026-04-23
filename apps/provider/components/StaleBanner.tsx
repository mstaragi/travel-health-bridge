import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react-native';
import { palette, spacing, borderRadius, typography } from '@travelhealthbridge/shared/ui';

interface StaleBannerProps {
  lastActivityAt: string;
  onRefresh: () => void;
}

export function StaleBanner({ lastActivityAt, onRefresh }: StaleBannerProps) {
  const diffInDays = Math.floor(
    (new Date().getTime() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays < 14) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.iconContainer}>
        <Clock size={24} color={palette.amber[900]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Your profile hasn't been updated in {diffInDays} days</Text>
        <Text style={styles.description}>
          Providers with stale profiles are ranked lower in traveler recommendations. 
          Confirm your availability to stay at the top.
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={onRefresh}>
          <Text style={styles.actionText}>Confirm availability now</Text>
          <ArrowRight size={16} color={palette.amber[900]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFECB3', // Soft Amber
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.amber[900],
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: palette.amber[800],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.amber[900],
  }
});
