import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@travelhealthbridge/shared/ui/useTheme';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { database } from '../../db';
import { VaultEntry } from '../../db/models/VaultEntry';

const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Child', 'Other'];
const MAX_CONTACTS = 2;

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export default function VaultEmergencyContactsScreen() {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rel, setRel] = useState(RELATIONSHIPS[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const records = await database.get<VaultEntry>('vault_entries').query().fetch();
      if (records.length > 0 && records[0].emergencyContactsJson) {
        try { setContacts(JSON.parse(records[0].emergencyContactsJson)); } catch(e){}
      }
    };
    fetch();
  }, []);

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    if (contacts.length >= MAX_CONTACTS) {
      Alert.alert('Limit Reached', `Maximum ${MAX_CONTACTS} emergency contacts allowed.`);
      return;
    }
    setContacts([...contacts, { id: Math.random().toString(), name: name.trim(), phone: phone.trim(), relationship: rel }]);
    setName('');
    setPhone('');
    setRel(RELATIONSHIPS[0]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const makePrimary = (id: string) => {
    const idx = contacts.findIndex(c => c.id === id);
    if (idx > 0) {
      const newArr = [...contacts];
      const temp = newArr[0];
      newArr[0] = newArr[idx];
      newArr[idx] = temp;
      setContacts(newArr);
    }
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await database.write(async () => {
        const entryCollection = database.get<VaultEntry>('vault_entries');
        const records = await entryCollection.query().fetch();
        let record = records[0];
        const updatedJson = JSON.stringify(contacts);

        if (!record) {
          record = await entryCollection.create(el => {
            el.userId = 'mock-user-id';
            el.emergencyContactsJson = updatedJson;
            el.lastSyncedAt = Date.now();
          });
        } else {
          await record.update(el => {
            el.emergencyContactsJson = updatedJson;
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
      <Stack.Screen options={{ title: isSaving ? 'Saving...' : 'Emergency Contacts' }} />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* ADD CONTACT FORM */}
        {contacts.length < MAX_CONTACTS && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Add Contact</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]} 
              placeholder="Full Name" 
              placeholderTextColor={theme.textTertiary}
              value={name} onChangeText={setName}
            />
            <TextInput 
              style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]} 
              placeholder="Phone (incl. country code)" 
              placeholderTextColor={theme.textTertiary}
              keyboardType="phone-pad"
              value={phone} onChangeText={setPhone}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRowContainer}>
              {RELATIONSHIPS.map(r => (
                <TouchableOpacity 
                  key={r} 
                  onPress={() => setRel(r)}
                  style={[styles.chip, { backgroundColor: r === rel ? theme.primary : theme.surface, borderColor: theme.border }]}
                >
                  <Text style={{ color: r === rel ? '#fff' : theme.textPrimary }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button variant="secondary" label="Add Contact" onPress={addContact} disabled={!name} />
          </View>
        )}

        {/* CONTACTS LIST */}
        <View style={styles.list}>
          {contacts.map((c, index) => (
            <View key={c.id} style={[styles.contactItem, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              {index === 0 && <Text style={[styles.primaryBadge, { color: theme.success }]}>PRIMARY</Text>}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textPrimary }}>{c.name}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>{c.relationship} • {c.phone}</Text>
              </View>
              <View style={styles.actions}>
                {index > 0 && (
                  <TouchableOpacity onPress={() => makePrimary(c.id)}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold', marginRight: 16 }}>Make Primary</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => removeContact(c.id)}>
                  <Text style={{ color: theme.danger, fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              </View>
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
  chipsRowContainer: { marginVertical: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, marginRight: 8 },
  list: { gap: 12 },
  contactItem: { padding: 16, borderRadius: 8, borderWidth: 1 },
  primaryBadge: { fontSize: 11, fontWeight: '900', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }
});
