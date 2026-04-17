import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@travelhealthbridge/shared/ui/useTheme';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { database } from '../../db';
import { VaultEntry } from '../../db/models/VaultEntry';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'As needed'];
const MAX_MEDS = 10;

interface Med {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export default function VaultMedicationsScreen() {
  const { theme } = useTheme();
  const [meds, setMeds] = useState<Med[]>([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [freq, setFreq] = useState(FREQUENCIES[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const records = await database.get<VaultEntry>('vault_entries').query().fetch();
      if (records.length > 0 && records[0].medicationsJson) {
        try { setMeds(JSON.parse(records[0].medicationsJson)); } catch(e){}
      }
    };
    fetch();
  }, []);

  const addMed = () => {
    if (!name.trim()) return;
    if (meds.length >= MAX_MEDS) {
      Alert.alert('Limit Reached', `Maximum ${MAX_MEDS} medications allowed.`);
      return;
    }
    setMeds([...meds, { id: Math.random().toString(), name: name.trim(), dosage: dosage.trim(), frequency: freq }]);
    setName('');
    setDosage('');
    setFreq(FREQUENCIES[0]);
  };

  const removeMed = (id: string) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await database.write(async () => {
        const entryCollection = database.get<VaultEntry>('vault_entries');
        const records = await entryCollection.query().fetch();
        let record = records[0];
        const updatedJson = JSON.stringify(meds);

        if (!record) {
          record = await entryCollection.create(el => {
            el.userId = 'mock-user-id';
            el.medicationsJson = updatedJson;
            el.lastSyncedAt = Date.now();
          });
        } else {
          await record.update(el => {
            el.medicationsJson = updatedJson;
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
      <Stack.Screen options={{ title: isSaving ? 'Saving...' : 'Medications' }} />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* ADD NEW MED FORM */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Add Medication</Text>
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]} 
            placeholder="Medication name" 
            placeholderTextColor={theme.textTertiary}
            value={name} onChangeText={setName}
          />
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]} 
            placeholder="Dosage (e.g. 50mg)" 
            placeholderTextColor={theme.textTertiary}
            value={dosage} onChangeText={setDosage}
          />
          
          <View style={styles.chipsRow}>
            {FREQUENCIES.map(f => (
              <TouchableOpacity 
                key={f} 
                onPress={() => setFreq(f)}
                style={[styles.chip, { backgroundColor: f === freq ? theme.primary : theme.surface, borderColor: theme.border }]}
              >
                <Text style={{ color: f === freq ? '#fff' : theme.textPrimary }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button variant="secondary" label="Add to list" onPress={addMed} />
        </View>

        {/* MEDS LIST */}
        <View style={styles.list}>
          {meds.map(m => (
            <View key={m.id} style={[styles.medItem, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textPrimary }}>{m.name}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>{m.dosage} • {m.frequency}</Text>
              </View>
              <TouchableOpacity onPress={() => removeMed(m.id)}>
                <Text style={{ color: theme.danger, fontWeight: 'bold' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
        <Button variant="primary" label="Save" onPress={save} disabled={isSaving} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24, gap: 12 },
  label: { fontSize: 14, fontWeight: 'bold' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  list: { gap: 12 },
  medItem: { flexDirection: 'row', padding: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center' }
});
