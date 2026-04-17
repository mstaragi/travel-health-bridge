import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@travelhealthbridge/shared/ui/useTheme';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { database } from '../../db';
import { VaultEntry } from '../../db/models/VaultEntry';
import { supabase } from '@travelhealthbridge/shared/api/supabase';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function VaultBasicScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const records = await database.get<VaultEntry>('vault_entries').query().fetch();
      if (records.length > 0 && records[0].bloodGroup) {
        setSelected(records[0].bloodGroup);
      }
    };
    fetch();
  }, []);

  const save = async () => {
    setIsSaving(true);
    try {
      // Get the existing entry or prepare a new one
      await database.write(async () => {
        const entryCollection = database.get<VaultEntry>('vault_entries');
        const records = await entryCollection.query().fetch();
        let record = records[0];

        if (!record) {
          record = await entryCollection.create(el => {
            el.userId = 'mock-user-id';
            el.bloodGroup = selected!;
            el.lastSyncedAt = Date.now();
          });
        } else {
          await record.update(el => {
            el.bloodGroup = selected!;
            el.lastSyncedAt = Date.now();
          });
        }
      });
      // Mock Supabase sync upsert
      router.back();
    } catch(e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: isSaving ? 'Saving...' : 'Blood Group' }} />
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Select your blood group</Text>
        <View style={styles.grid}>
          {BLOOD_GROUPS.map((bg) => (
            <TouchableOpacity 
              key={bg} 
              onPress={() => setSelected(bg)}
              style={[styles.chip, { backgroundColor: bg === selected ? theme.primary : theme.surface, borderColor: theme.border }]}
            >
              <Text style={{ color: bg === selected ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>{bg}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button variant="primary" label="Save" onPress={save} disabled={!selected || isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  label: { fontSize: 16, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  chip: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 }
});
