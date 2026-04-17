import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@travelhealthbridge/shared/ui/useTheme';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { database } from '../../db';
import { VaultEntry } from '../../db/models/VaultEntry';

const SUGGESTIONS = ['Penicillin', 'Aspirin', 'Sulfa', 'NSAIDs', 'Peanuts', 'Shellfish', 'Latex', 'Iodine', 'Codeine'];
const MAX_ALLERGIES = 20;

export default function VaultAllergiesScreen() {
  const { theme } = useTheme();
  const [allergies, setAllergies] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const records = await database.get<VaultEntry>('vault_entries').query().fetch();
      if (records.length > 0 && records[0].allergiesJson) {
        try { setAllergies(JSON.parse(records[0].allergiesJson)); } catch(e){}
      }
    };
    fetch();
  }, []);

  const addAllergy = (name: string) => {
    if (!name.trim()) return;
    if (allergies.length >= MAX_ALLERGIES) {
      Alert.alert('Limit Reached', `Maximum ${MAX_ALLERGIES} allergies allowed.`);
      return;
    }
    if (!allergies.includes(name.trim())) {
      setAllergies([...allergies, name.trim()]);
    }
    setInputVal('');
  };

  const removeAllergy = (name: string) => {
    setAllergies(allergies.filter(a => a !== name));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await database.write(async () => {
        const entryCollection = database.get<VaultEntry>('vault_entries');
        const records = await entryCollection.query().fetch();
        let record = records[0];
        const updatedJson = JSON.stringify(allergies);

        if (!record) {
          record = await entryCollection.create(el => {
            el.userId = 'mock-user-id';
            el.allergiesJson = updatedJson;
            el.lastSyncedAt = Date.now();
          });
        } else {
          await record.update(el => {
            el.allergiesJson = updatedJson;
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
      <Stack.Screen options={{ title: isSaving ? 'Saving...' : 'Allergies' }} />
      <View style={styles.container}>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={[styles.input, { borderColor: theme.borderStrong, color: theme.textPrimary, backgroundColor: theme.surface }]} 
            placeholder="Type an allergy" 
            placeholderTextColor={theme.textTertiary}
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={() => addAllergy(inputVal)}
          />
          <TouchableOpacity onPress={() => addAllergy(inputVal)} style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <Text style={{color: '#fff', fontWeight:'bold'}}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          {allergies.map(a => (
            <TouchableOpacity key={a} onPress={() => removeAllergy(a)} style={[styles.chip, { backgroundColor: theme.dangerLight }]}>
              <Text style={{ color: theme.dangerDark }}>{a}  ?</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>Common Suggestions</Text>
        <View style={styles.chipsRow}>
          {SUGGESTIONS.map(s => {
            if (allergies.includes(s)) return null;
            return (
              <TouchableOpacity key={s} onPress={() => addAllergy(s)} style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                 <Text style={{ color: theme.textPrimary }}>+ {s}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Button variant="primary" label="Save" onPress={save} disabled={isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  inputContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  addButton: { paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: 'transparent' },
  sectionHeading: { fontSize: 14, marginBottom: 12, fontWeight: 'bold' }
});
