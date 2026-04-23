/**
 * HelplineCTA — CRITICAL COMPONENT
 *
 * Per spec: "Always shows helpline number in PLAIN TEXT visible without tapping
 * (plain text required: user may have no connectivity to open a link)"
 *
 * The helpline number MUST be readable without any tap or network connection.
 * This is a non-negotiable safety requirement.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Linking, ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import {
  HELPLINE_WHATSAPP_NUMBER,
  HELPLINE_OPERATING_HOURS,
} from '../constants';
import { typography, spacing, borderRadius, palette, shadows } from './tokens';

interface HelplineCTAProps {
  city?: string;
  prefilledMessage?: string;
  note?: string;       // custom note below the button
  style?: ViewStyle;
  compact?: boolean;   // reduced padding for inline use
  testID?: string;
}

export function HelplineCTA({
  city,
  prefilledMessage,
  note,
  style,
  compact = false,
  testID,
}: HelplineCTAProps) {
  const { theme } = useTheme();

  const message = prefilledMessage
    ?? (city ? `I need medical assistance in ${city}. Can you help?` : 'I need medical assistance. Can you help?');

  const whatsappNumber = HELPLINE_WHATSAPP_NUMBER.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleWhatsApp = () => {
    Linking.openURL(whatsappUrl).catch(() => {
      // If WhatsApp fails, user still has the plain text number to call
    });
  };

  return (
    <View
      testID={testID}
      accessibilityLabel={`Message Travel Health Bridge helpline. Number: ${HELPLINE_WHATSAPP_NUMBER}`}
      style={[
        {
          backgroundColor: theme.primaryLight,
          borderRadius: borderRadius.lg,
          padding: compact ? spacing.md : spacing.xl,
          borderWidth: 1,
          borderColor: palette.teal[200],
          ...shadows.sm,
        },
        style,
      ]}
    >
      {/* PLAIN TEXT HELPLINE NUMBER — always visible, no tap required */}
      {/* Per spec this MUST be visible without any interaction */}
      <Text
        style={{
          fontSize: typography.fontSize.sm,
          color: theme.textSecondary,
          marginBottom: 2,
        }}
      >
        Travel Health Bridge helpline:
      </Text>
      <Text
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.extrabold,
          color: theme.textPrimary,
          letterSpacing: 0.5,
          marginBottom: compact ? spacing.sm : spacing.md,
        }}
        accessibilityRole="text"
        accessible
      >
        {HELPLINE_WHATSAPP_NUMBER}
      </Text>

      <Text
        style={{
          fontSize: typography.fontSize.xs,
          color: theme.textSecondary,
          marginBottom: compact ? spacing.sm : spacing.md,
        }}
      >
        Available {HELPLINE_OPERATING_HOURS}
      </Text>

      {/* WhatsApp button — tap to open pre-filled chat */}
      <TouchableOpacity
        onPress={handleWhatsApp}
        accessibilityLabel={`Message Travel Health Bridge helpline. Number: ${HELPLINE_WHATSAPP_NUMBER}`}
        accessibilityRole="button"
        accessibilityHint="Opens WhatsApp with pre-filled message"
        style={{
          backgroundColor: '#25D366', // WhatsApp green
          borderRadius: borderRadius.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
        }}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 18 }}>💬</Text>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          Message on WhatsApp
        </Text>
      </TouchableOpacity>

      {note ? (
        <Text
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.textSecondary,
            marginTop: spacing.sm,
            textAlign: 'center',
            lineHeight: 18,
          }}
        >
          {note}
        </Text>
      ) : null}
    </View>
  );
}
