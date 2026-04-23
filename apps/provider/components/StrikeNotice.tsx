import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { AlertCircle, ShieldAlert, ExternalLink } from 'lucide-react-native';
import { palette, spacing, borderRadius, typography } from '@travelhealthbridge/shared/ui';

interface StrikeNoticeProps {
  strikeCount: number;
}

export function StrikeNotice({ strikeCount }: StrikeNoticeProps) {
  if (strikeCount <= 0) return null;

  const isHighSeverity = strikeCount >= 2;
  const bgColor = isHighSeverity ? palette.red[50] : '#FFF8E1'; // Red vs Amber
  const borderColor = isHighSeverity ? palette.red[200] : '#FFE082';
  const textColor = isHighSeverity ? palette.red[900] : palette.amber[900];
  const Icon = isHighSeverity ? ShieldAlert : AlertCircle;

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.header}>
        <Icon size={24} color={isHighSeverity ? palette.red[600] : palette.amber[700]} />
        <Text style={[styles.title, { color: textColor }]}>
          {isHighSeverity ? 'Critical Quality Alert' : 'Quality Warning'}
        </Text>
      </View>
      
      <Text style={[styles.description, { color: textColor }]}>
        Your clinic has {strikeCount} active {strikeCount === 1 ? 'strike' : 'strikes'}. 
        {isHighSeverity 
          ? ' Any further violation will result in immediate permanent suspension from the Travel Health Bridge network.'
          : ' Active strikes affect your ranking and trust score. Please review the Quality Charter.'}
      </Text>

      <TouchableOpacity 
        style={styles.link}
        onPress={() => Linking.openURL('https://travelhealthbridge.com/charter')}
      >
        <Text style={[styles.linkText, { color: isHighSeverity ? palette.red[700] : palette.teal[700] }]}>
          View Quality Charter
        </Text>
        <ExternalLink size={14} color={isHighSeverity ? palette.red[700] : palette.teal[700]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});
