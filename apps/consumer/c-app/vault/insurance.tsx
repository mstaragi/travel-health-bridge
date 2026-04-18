import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@travelhealthbridge/shared/ui/useTheme';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { database } from 'db';
import { VaultEntry } from 'db/models/VaultEntry';

export default function VaultInsuranceScreen() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const records = await database.get<VaultEntry>('vault_entries').query().fetch();
      if (records.length > 0) {
        if (records[0].insurerName) setName(records[0].insurerName);
        if (records[0].insurerPhone) setPhone(records[0].insurerPhone);
      }
    };
    fetch();
  }, []);

  const save = async () => {
    setIsSaving(true);
    try {
      await database.write(async () => {
        const entryCollection = database.get<VaultEntry>('vault_entries');
        const records = await entryCollection.query().fetch();
        let record = records[0];

        if (!record) {
          record = await entryCollection.create(el => {
            el.userId = 'mock-user-id';
            el.insurerName = name.trim();
            el.insurerPhone = phone.trim();
            el.lastSyncedAt = Date.now();
          });
        } else {
          await record.update(el => {
            el.insurerName = name.trim();
            el.insurerPhone = phone.trim();
            el.lastSyncedAt = Date.now();
          });
        }
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: isSaving ? 'Saving...' : 'Insurance' }} />
      <View style={styles.container}>
        
        <Text style={[styles.subText, { color: theme.textSecondary }]}>
          For hospital cashless processing or reimbursement.
        </Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Insurance company name</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.surface }]} 
          maxLength={50}
          value={name} onChangeText={setName}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Claims / emergency helpline number</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.surface }]} 
          keyboardType="phone-pad"
          value={phone} onChangeText={setPhone}
        />

        <View style={{ flex: 1 }} />
        <Button variant="primary" label="Save" onPress={save} disabled={isSaving || !name} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  subText: { fontSize: 13, marginBottom: 24, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 20 },
});


