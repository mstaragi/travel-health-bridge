/**
 * ConsentMessageModal
 *
 * Triggered when user taps 'Message my emergency contact' from the user-alone flow.
 * Shows: contact name/relationship, exact message preview, Send button, Don't send link.
 * Per spec: 'This opens WhatsApp for you to send — not automatic.'
 */
import React from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView, ViewStyle } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius, palette } from './tokens';

interface ConsentMessageModalProps {
  visible: boolean;
  onConfirm: () => void;   // called after opening WhatsApp
  onCancel: () => void;
  contactName?: string;
  contactPhone?: string;
  contactRelationship?: string;
  userName?: string;
  userCity: string;
  providerName: string;
  providerAddress: string;
  testID?: string;
}

export function ConsentMessageModal({
  visible,
  onConfirm,
  onCancel,
  contactName,
  contactPhone,
  contactRelationship,
  userName,
  userCity,
  providerName,
  providerAddress,
  testID,
}: ConsentMessageModalProps) {
  const { theme } = useTheme();

  // SPEC: exact message text
  const messageText = `Hi ${contactName ?? 'there'}, this is an automated message from Travel Health Bridge. ${userName ?? 'A traveler'} may need medical assistance in ${userCity ?? 'their local city'}.${providerName ? ` Their recommended clinic is ${providerName} at ${providerAddress}.` : ' They have triggered an emergency SOS.'} Please try to reach them.`;

  const handleSend = () => {
    if (contactPhone) {
      const phone = contactPhone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
      Linking.openURL(whatsappUrl).finally(() => {
        onConfirm(); // log emergency_contact_notified_at (handled by caller)
      });
    } else {
      onConfirm();
    }
  };

  const hasContact = !!(contactName && contactPhone);

  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      testID={testID}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xl,
          gap: spacing.base,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.sm,
          }}
        >
          Notify your emergency contact?
        </Text>

        {hasContact ? (
          <>
            {/* Contact info */}
            <View
              style={{
                backgroundColor: theme.primaryLight,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                borderWidth: 1,
                borderColor: palette.teal[200],
              }}
            >
              <Text style={{ fontSize: 28 }}>👤</Text>
              <View>
                <Text
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.bold,
                    color: theme.textPrimary,
                  }}
                >
                  {contactName}
                </Text>
                {contactRelationship ? (
                  <Text style={{ fontSize: typography.fontSize.sm, color: theme.textSecondary }}>
                    {contactRelationship}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Message preview — read-only, exact text */}
            <View>
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: theme.textSecondary,
                  marginBottom: spacing.sm,
                }}
              >
                Message that will be sent:
              </Text>
              <View
                style={{
                  backgroundColor: theme.surfaceRaised,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: theme.textPrimary,
                    lineHeight: 20,
                  }}
                >
                  {messageText}
                </Text>
              </View>
            </View>

            {/* Send button — per spec: 'Send this message to [contactName]' */}
            <Button
              label={`Send this message to ${contactName}`}
              onPress={handleSend}
              variant="primary"
              fullWidth
            />

            {/* Don't send link — per spec: 'Don't send' cancel link */}
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Don't send"
              style={{ alignItems: 'center', paddingVertical: spacing.sm }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: theme.textSecondary,
                  textDecorationLine: 'underline',
                }}
              >
                Don't send
              </Text>
            </TouchableOpacity>

            {/* Consent note — per spec exact text */}
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: theme.textTertiary,
                textAlign: 'center',
                lineHeight: 16,
              }}
            >
              This opens WhatsApp for you to send — not automatic.
            </Text>
          </>
        ) : (
          <>
            {/* No contact saved */}
            <View
              style={{
                backgroundColor: theme.surfaceRaised,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: spacing.md }}>📞</Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  color: theme.textSecondary,
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                No emergency contact saved.{'\n'}Add one in your Vault.
              </Text>
            </View>
            <Button
              label="Add emergency contact"
              onPress={onCancel} // caller opens vault
              variant="secondary"
              fullWidth
            />
          </>
        )}
      </ScrollView>
    </Modal>
  );
}
