import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { track } from '../index';
import { Button } from './Button';
import { palette, typography, spacing } from './tokens';
import { XCircle, Phone, RefreshCcw } from 'lucide-react-native';

interface FailureBottomSheetProps {
  onCallHelpline: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const FailureBottomSheet: React.FC<FailureBottomSheetProps> = ({ 
  onCallHelpline, 
  onRetry, 
  onClose 
}) => {
  const handleCall = () => {
    track('failure_bottom_sheet_action', { action: 'call_helpline' });
    onCallHelpline();
  };

  const handleRetry = () => {
    track('failure_bottom_sheet_action', { action: 'retry' });
    onRetry();
  };

  const handleClose = () => {
    track('failure_bottom_sheet_action', { action: 'dismiss' });
    onClose();
  };
  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <XCircle size={48} color={palette.rose[600]} />
          <Text style={styles.title}>Provider didn't answer?</Text>
          <Text style={styles.subtitle}>
            Don't worry, our 24/7 medical response team is standing by to help you manually.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Call 24/7 Helpline"
            onPress={onCallHelpline}
            variant="primary"
            size="lg"
            fullWidth
            icon={<Phone size={20} color={palette.white} />}
            style={styles.primaryButton}
          />

          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <RefreshCcw size={18} color={palette.teal[600]} />
            <Text style={styles.retryText}>Try another search</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: palette.navy[50],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: palette.navy[400],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: palette.rose[600],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  retryText: {
    color: palette.teal[600],
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  closeButton: {
    marginTop: spacing.lg,
  },
  closeText: {
    color: palette.navy[200],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

