/**
 * QuickCaseModal — Admin console only (web).
 * Severity (P1/P2/P3/P4 preset buttons), Category (8 chips), optional notes.
 * Auto-generates case_id (THB-YYYYMMDD-sequential) and opened_at.
 * One tap to create minimal case record.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ViewStyle } from 'react-native';
import { type CaseSeverity, type WhatsappCase } from '../types';
import { WHATSAPP_CASE_CATEGORIES } from '../constants';
import { useTheme } from './useTheme';
import { typography, spacing, borderRadius, palette } from './tokens';

interface QuickCaseModalProps {
  onSubmit: (minimalCase: Partial<WhatsappCase>) => Promise<void>;
  onCancel: () => void;
  currentUser?: string;
  style?: ViewStyle;
  testID?: string;
}

// Sequential counter for case ID (resets on page reload — ops logs handle dedup)
let caseCounter = 1;

function generateCaseId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const id = `THB-${dateStr}-${String(caseCounter++).padStart(3, '0')}`;
  return id;
}

const SEVERITY_OPTIONS: { value: CaseSeverity; label: string; color: string; bg: string }[] = [
  { value: 'P1', label: 'P1 Critical', color: palette.red[800],   bg: palette.red[50] },
  { value: 'P2', label: 'P2 Urgent',   color: palette.amber[900], bg: palette.amber[50] },
  { value: 'P3', label: 'P3 Normal',   color: '#1565C0',          bg: '#E3F2FD' },
  { value: 'P4', label: 'P4 Low',      color: '#2E7D32',          bg: '#E8F5E9' },
];

export function QuickCaseModal({
  onSubmit,
  onCancel,
  currentUser,
  style,
  testID,
}: QuickCaseModalProps) {
  const { theme } = useTheme();
  const [severity, setSeverity] = useState<CaseSeverity | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = severity !== null && category !== null;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Select severity and category to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const minimalCase: Partial<WhatsappCase> = {
        id: generateCaseId(),
        severity: severity!,
        category: category!,
        status: 'Open',
        owner: currentUser ?? 'ops',
        opened_at: new Date().toISOString(),
        notes: notes.trim() || undefined,
      };
      await onSubmit(minimalCase);
    } catch (e) {
      setError('Failed to log case. Try again.');
      setLoading(false);
    }
  };

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          maxWidth: 480,
          width: '100%',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: theme.textPrimary,
          marginBottom: spacing.base,
        }}
      >
        Log New Case
      </Text>

      {/* Severity — P1/P2/P3/P4 large preset buttons */}
      <Text
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.textSecondary,
          marginBottom: spacing.sm,
        }}
      >
        Severity <Text style={{ color: palette.red[700] }}>*</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
        {SEVERITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setSeverity(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: severity === opt.value }}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.md,
              alignItems: 'center',
              backgroundColor: severity === opt.value ? opt.color : opt.bg,
              borderWidth: 1.5,
              borderColor: opt.color,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold,
                color: severity === opt.value ? '#FFFFFF' : opt.color,
              }}
            >
              {opt.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category — 8 chips */}
      <Text
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.textSecondary,
          marginBottom: spacing.sm,
        }}
      >
        Category <Text style={{ color: palette.red[700] }}>*</Text>
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.base }}>
        {WHATSAPP_CASE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            accessibilityRole="checkbox"
            accessibilityState={{ selected: category === cat }}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.full,
              backgroundColor: category === cat ? theme.primary : theme.surfaceRaised,
              borderWidth: 1,
              borderColor: category === cat ? theme.primary : theme.border,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: category === cat ? '#FFFFFF' : theme.textPrimary,
                fontWeight: category === cat ? typography.fontWeight.semibold : typography.fontWeight.regular,
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes (optional) */}
      <Text
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
        }}
      >
        Notes (optional)
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Brief note about the case..."
        placeholderTextColor={theme.textTertiary}
        multiline
        numberOfLines={2}
        maxLength={300}
        style={{
          borderWidth: 1,
          borderColor: theme.inputBorder,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          fontSize: typography.fontSize.base,
          color: theme.textPrimary,
          backgroundColor: theme.inputBackground,
          marginBottom: spacing.base,
          minHeight: 72,
          textAlignVertical: 'top',
        }}
      />

      {error ? (
        <Text style={{ fontSize: typography.fontSize.sm, color: theme.textDanger, marginBottom: spacing.sm }}>
          {error}
        </Text>
      ) : null}

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <TouchableOpacity
          onPress={onCancel}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: typography.fontSize.base, color: theme.textSecondary }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            flex: 2,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.md,
            backgroundColor: canSubmit && !loading ? theme.primary : theme.buttonDisabled,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              color: canSubmit && !loading ? '#FFFFFF' : theme.buttonDisabledText,
            }}
          >
            {loading ? 'Logging...' : 'Log Case'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
