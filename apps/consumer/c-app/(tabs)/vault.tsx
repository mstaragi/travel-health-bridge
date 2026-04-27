import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, Stack } from 'expo-router';
import { palette, typography, spacing, borderRadius, shadows } from '@travelhealthbridge/shared/ui/tokens';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Card } from '@travelhealthbridge/shared/ui/Card';
import { track, supabase } from '@travelhealthbridge/shared';
import { useAuthStore } from 'store/authStore';
import { useVaultStore } from 'store/vaultStore';
import { database } from 'db';
import * as SecureStore from 'expo-secure-store';
import { encrypt, decrypt } from '@travelhealthbridge/shared/utils/encryption';

interface VaultData {
  blood_group: string | null;
  allergies: string[];
  medications: Array<{name: string, dose: string}>;
  emergency_contacts: Array<{name: string, relationship: string, phone: string}>;
  insurance: { name: string; policy: string; helpline: string };
}

export default function VaultScreen() {
  const router = useRouter();
  const { session, isGuest } = useAuthStore();
  const { setVaultData } = useVaultStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Section state
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<{name: string, dose: string}[]>([]);
  const [contacts, setContacts] = useState<{name: string, relationship: string, phone: string}[]>([]);
  const [insurance, setInsurance] = useState({ name: '', policy: '', helpline: '' });

  useEffect(() => {
    track('vault_opened', { is_guest: isGuest });
    if (isGuest) {
      track('guest_login_prompt_shown', { context: 'vault_access' });
    }
    if (!isGuest && session) {
      loadVaultData();
    } else {
      setIsLoading(false);
    }
  }, [session, isGuest]);

  const loadVaultData = async () => {
    setIsLoading(true);
    try {
      if (!session?.user?.id) return;

      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('vault_data')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!error && data) {
        // Decrypt sensitive data
        try {
          const decryptedAllergies = data.allergies_encrypted ? 
            JSON.parse(await decrypt(data.allergies_encrypted)) : [];
          const decryptedMedications = data.medications_encrypted ? 
            JSON.parse(await decrypt(data.medications_encrypted)) : [];
          const decryptedContacts = data.emergency_contacts_encrypted ? 
            JSON.parse(await decrypt(data.emergency_contacts_encrypted)) : [];

          setBloodGroup(data.blood_group);
          setAllergies(decryptedAllergies);
          setMedications(decryptedMedications);
          setContacts(decryptedContacts);
          setInsurance({
            name: data.insurer_name || '',
            policy: data.insurer_policy || '',
            helpline: data.insurer_helpline || ''
          });

          // Update Zustand store for cross-screen access
          setVaultData({
            blood_group: data.blood_group,
            allergies_json: JSON.stringify(decryptedAllergies),
            medications_json: JSON.stringify(decryptedMedications),
            emergency_contacts_json: JSON.stringify(decryptedContacts),
            insurer_name: data.insurer_name
          });

          track('vault_data_loaded', { 
            has_blood_group: !!data.blood_group,
            allergies_count: decryptedAllergies.length,
            medications_count: decryptedMedications.length,
            contacts_count: decryptedContacts.length
          });
        } catch (err) {
          console.error('Error decrypting vault data:', err);
        }
      }
    } catch (err) {
      console.error('Error loading vault data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;
    setIsSaving(true);
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }

    // Track which sections are being saved
    if (bloodGroup) track('vault_section_saved', { section_name: 'blood_group' });
    if (allergies.length > 0) track('vault_section_saved', { section_name: 'allergies' });
    if (medications.length > 0) track('vault_section_saved', { section_name: 'medications' });
    if (contacts.length > 0) track('vault_section_saved', { section_name: 'emergency_contacts' });
    if (insurance.name) track('vault_section_saved', { section_name: 'insurance' });

    try {
      // Encrypt sensitive data
      const encryptedAllergies = allergies.length > 0 ? await encrypt(JSON.stringify(allergies)) : null;
      const encryptedMedications = medications.length > 0 ? await encrypt(JSON.stringify(medications)) : null;
      const encryptedContacts = contacts.length > 0 ? await encrypt(JSON.stringify(contacts)) : null;

      const payload = {
        blood_group: bloodGroup,
        allergies_encrypted: encryptedAllergies,
        medications_encrypted: encryptedMedications,
        emergency_contacts_encrypted: encryptedContacts,
        insurer_name: insurance.name,
        insurer_policy: insurance.policy,
        insurer_helpline: insurance.helpline,
        user_id: session.user.id,
        last_synced_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('vault_data')
        .upsert([payload], { onConflict: 'user_id' });

      if (error) throw error;

      // Update local Zustand store
      setVaultData({
        blood_group: bloodGroup,
        allergies_json: JSON.stringify(allergies),
        medications_json: JSON.stringify(medications),
        emergency_contacts_json: JSON.stringify(contacts),
        insurer_name: insurance.name
      });

      track('vault_data_saved', { 
        sections_saved: 5,
        total_items: allergies.length + medications.length + contacts.length
      });

      Alert.alert('Success', 'Your medical data has been securely saved.');
    } catch (e) {
      console.error('Error saving vault:', e);
      Alert.alert('Error', 'Failed to save vault data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will delete your account and anonymize your feedback data (keeping only ratings). Continue?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Anonymize feedback
              const { error: feedbackError } = await supabase
                .from('feedback')
                .update({ user_id: null, provider_name: null, notes: null })
                .eq('user_id', session?.user?.id);

              if (feedbackError) throw feedbackError;

              // Delete vault data
              await supabase.from('vault_data').delete().eq('user_id', session?.user?.id);

              // Delete user account via auth
              await supabase.auth.admin.deleteUser(session?.user?.id);

              track('account_deleted', {});

              Alert.alert('Account Deleted', 'Your account has been deleted.');
              router.replace('/(auth)/login');
            } catch (err) {
              console.error('Error deleting account:', err);
              Alert.alert('Error', 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    track('vault_share_tapped');
    let summary = '🏥 Medical Emergency Travel Card\n(Shared from Travel Health Bridge)\n\n';

    if (bloodGroup) {
      const bgText = bloodGroup === "Don't know" ? "Unknown" : bloodGroup;
      summary += `Blood Group: ${bgText}\n`;
    }

    if (allergies.length > 0) {
      summary += `Allergies: ${allergies.join(', ')}\n`;
    }

    if (medications.length > 0) {
      summary += `Current Medications:\n${medications.map(m => `• ${m.name} (${m.dose})`).join('\n')}\n`;
    }

    if (contacts.length > 0) {
      summary += `Emergency Contacts:\n${contacts.map(c => `• ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}\n`;
    }

    if (insurance.name || insurance.policy || insurance.helpline) {
      summary += '\nInsurance Info:\n';
      if (insurance.name) summary += `Insurance: ${insurance.name}\n`;
      if (insurance.policy) summary += `Policy No: ${insurance.policy}\n`;
      if (insurance.helpline) summary += `Insurance Helpline: ${insurance.helpline}\n`;
    }

    try {
      await Share.share({
        message: summary.trim(),
        title: 'Share Medical Summary'
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.guestContainer}>
        <View style={styles.guestInner}>
          <Shield size={64} color={palette.teal[600]} style={{ marginBottom: spacing.xl }} />
          <Text style={styles.guestTitle}>Secure Medical Vault</Text>
          <Text style={styles.guestSub}>
            Encryption-protected storage for your blood group, allergies, and emergency contacts. Data is stored on-device and in our secure vault.
          </Text>
          <Button 
            label="Log in to start your Vault" 
            onPress={() => router.push('/auth/phone')} 
            variant="primary"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: palette.white }}>
        <ActivityIndicator size="large" color={palette.teal[600]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Medical Vault',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/profile/settings')}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <Settings size={24} color={palette.navy[900]} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: palette.white },
          headerShadowVisible: false
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ACTION BAR */}
        <View style={styles.actionBar}>
          <Button 
            label={isSaving ? "Saving..." : "Save Changes"} 
            onPress={handleSave} 
            variant="primary" 
            size="sm"
            disabled={isSaving}
          />
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Share2 size={20} color={palette.teal[600]} />
            <Text style={styles.shareText}>Share with Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* BLOOD GROUP */}
        <Collapsible 
          title="Blood Group" 
          icon={<Heart size={20} color={palette.rose[600]} />}
          subtitle={bloodGroup ? (bloodGroup === "Don't know" ? "Unknown" : bloodGroup) : "Not set"}
        >
          <View style={styles.bgGrid}>
            {BLOOD_GROUPS.map(group => (
              <TouchableOpacity
                key={group}
                style={[styles.bgChip, bloodGroup === group && styles.bgChipActive]}
                onPress={() => setBloodGroup(group)}
              >
                <Text style={[styles.bgChipText, bloodGroup === group && styles.bgChipTextActive]}>{group}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Collapsible>

        {/* ALLERGIES */}
        <Collapsible 
          title="Allergies" 
          icon={<AlertCircle size={20} color={palette.amber[600]} />}
          subtitle={allergies.length > 0 ? `${allergies.length} listed` : "None listed"}
        >
          <View style={styles.entryRow}>
            <Input 
              value={newAllergy} 
              onChangeText={setNewAllergy} 
              placeholder="e.g. Penicillin" 
              containerStyle={{ flex: 1 }}
            />
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => {
                if (newAllergy) {
                  setAllergies([...allergies, newAllergy]);
                  setNewAllergy('');
                }
              }}
            >
              <Plus size={20} color={palette.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagCloud}>
            {allergies.map((a, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{a}</Text>
                <TouchableOpacity onPress={() => setAllergies(allergies.filter((_, idx) => idx !== i))}>
                  <X size={14} color={palette.navy[400]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Collapsible>

        {/* MEDICATIONS */}
        <Collapsible 
          title="Current Medications" 
          icon={<Activity size={20} color={palette.teal[600]} />}
          subtitle={medications.length > 0 ? `${medications.length} active` : "None listed"}
        >
          <View style={styles.multiEntry}>
            <Input 
              value={newMedName} 
              onChangeText={setNewMedName} 
              placeholder="Medication name" 
              containerStyle={{ marginBottom: spacing.sm }}
            />
            <View style={styles.entryRow}>
              <Input 
                value={newMedDose} 
                onChangeText={setNewMedDose} 
                placeholder="Dose (e.g. 500mg)" 
                containerStyle={{ flex: 1 }}
              />
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => {
                  if (newMedName && newMedDose) {
                    setMedications([...medications, { name: newMedName, dose: newMedDose }]);
                    setNewMedName('');
                    setNewMedDose('');
                  }
                }}
              >
                <Plus size={20} color={palette.white} />
              </TouchableOpacity>
            </View>
          </View>
          {medications.map((m, i) => (
            <View key={i} style={styles.listItem}>
              <View>
                <Text style={styles.listMain}>{m.name}</Text>
                <Text style={styles.listSub}>{m.dose}</Text>
              </View>
              <TouchableOpacity onPress={() => setMedications(medications.filter((_, idx) => idx !== i))}>
                <X size={18} color={palette.rose[400]} />
              </TouchableOpacity>
            </View>
          ))}
        </Collapsible>

        {/* EMERGENCY CONTACTS */}
        <Collapsible 
          title="Emergency Contacts" 
          icon={<Users size={20} color={palette.navy[600]} />}
          subtitle={contacts.length > 0 ? `${contacts.length}/2 saved` : "Required for SOS"}
        >
          {contacts.length < 2 && (
             <Button 
               label={`Add Contact ${contacts.length + 1}`} 
               onPress={() => {
                 setContacts([...contacts, { name: 'New Contact', relationship: 'Relative', phone: '' }]);
               }} 
               variant="secondary"
               size="sm"
               style={{ marginBottom: spacing.md }}
             />
          )}
          {contacts.map((c, i) => (
            <View key={i} style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Contact {i + 1}</Text>
                <TouchableOpacity onPress={() => setContacts(contacts.filter((_, idx) => idx !== i))}>
                  <Text style={styles.removeLink}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Input 
                value={c.name} 
                onChangeText={t => {
                  const newC = [...contacts];
                  newC[i].name = t;
                  setContacts(newC);
                }}
                placeholder="Full Name"
                containerStyle={{ marginBottom: spacing.sm }}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Input 
                  value={c.relationship} 
                  onChangeText={t => {
                    const newC = [...contacts];
                    newC[i].relationship = t;
                    setContacts(newC);
                  }}
                  placeholder="Relationship"
                  containerStyle={{ flex: 1 }}
                />
                <Input 
                  value={c.phone} 
                  onChangeText={t => {
                    const newC = [...contacts];
                    newC[i].phone = t;
                    setContacts(newC);
                  }}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </View>
          ))}
        </Collapsible>

        {/* INSURANCE */}
        <Collapsible 
          title="Insurance" 
          icon={<Shield size={20} color={palette.teal[600]} />}
          subtitle={insurance.name ? "Policy details saved" : "Not set"}
        >
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Insurer Name</Text>
            <Input 
              value={insurance.name} 
              onChangeText={t => setInsurance({...insurance, name: t})}
              placeholder="e.g. UnitedHealth"
              containerStyle={{ marginBottom: spacing.md }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Policy Number</Text>
                <Input 
                  value={insurance.policy} 
                  onChangeText={t => setInsurance({...insurance, policy: t})}
                  placeholder="AB123456"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Helpline Number</Text>
                <Input 
                  value={insurance.helpline} 
                  onChangeText={t => setInsurance({...insurance, helpline: t})}
                  placeholder="+1-800..."
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </Collapsible>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// CSS styles below
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: palette.white,
    justifyContent: 'center',
  },
  guestInner: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: spacing.md,
  },
  guestSub: {
    fontSize: 16,
    color: palette.navy[400],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  scroll: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.teal[600],
  },
  bgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bgChip: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.navy[100],
    alignItems: 'center',
  },
  bgChipActive: {
    backgroundColor: palette.rose[600],
    borderColor: palette.rose[600],
  },
  bgChipText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  bgChipTextActive: {
    color: palette.white,
  },
  entryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: palette.navy[900],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.navy[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: palette.navy[900],
  },
  multiEntry: {
    paddingBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.navy[50],
  },
  listMain: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  listSub: {
    fontSize: 12,
    color: palette.navy[400],
  },
  formCard: {
    backgroundColor: palette.navy[50],
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[400],
    textTransform: 'uppercase',
  },
  removeLink: {
    fontSize: 12,
    color: palette.rose[600],
    fontWeight: typography.fontWeight.bold,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[600],
    marginBottom: 4,
  },
  formSection: {
    paddingBottom: spacing.sm,
  }
});


