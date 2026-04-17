import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from './Button';
import { palette, typography, spacing } from './tokens';

interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ visible, onAccept }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Before we continue</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.bodyText}>
              Travel Health Bridge is a decision-support tool. We provide recommendations for verified medical providers in India based on your symptoms and location.
            </Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Medical Advice Disclaimer</Text>
              <Text style={styles.sectionText}>
                We do not provide medical advice, diagnosis, or treatment. Our recommendations are based on verified availability and provider specializations. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Emergency Situations</Text>
              <Text style={styles.sectionText}>
                If you are experiencing a life-threatening emergency, use the "Emergency" button immediately or call national emergency services (102/108) directly.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Terms & Privacy</Text>
              <Text style={styles.sectionText}>
                By tapping "I Agree", you confirm that you have read and understood our Terms of Service and Privacy Policy. We store your triage data and vault entries locally on your device using secure encryption.
              </Text>
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="I Agree & Continue"
              onPress={onAccept}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  inner: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  bodyText: {
    fontSize: typography.fontSize.md,
    color: palette.navy[600],
    lineHeight: 24,
    marginBottom: spacing.xl,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
    marginBottom: spacing.xs,
  },
  sectionText: {
    fontSize: typography.fontSize.sm,
    color: palette.navy[500],
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: palette.white,
  },
});
