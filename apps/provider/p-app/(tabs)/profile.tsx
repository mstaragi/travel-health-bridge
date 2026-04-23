import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Building2, 
  Stethoscope, 
  Clock, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Save, 
  Info,
  ChevronDown
} from 'lucide-react-native';
import { 
  palette, 
  spacing, 
  borderRadius, 
  typography, 
  Button, 
  Input, 
  Card,
  Collapsible
} from '@travelhealthbridge/shared/ui';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { useAuthStore } from '../../store/authStore';
import { Doctor, OpdHours } from '@travelhealthbridge/shared/types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ProfileScreen() {
  const { provider, setSession } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    phone: provider?.phone || '',
    about: provider?.about || '',
    fee_opd: { ...provider?.fee_opd },
    fee_specialist: provider?.fee_specialist ? { ...provider.fee_specialist } : { min: 0, max: 0 },
    opd_hours: { ...provider?.opd_hours } as OpdHours,
    doctors: [...(provider?.doctors || [])] as Doctor[],
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleDayToggle = (day: string, open: boolean) => {
    setFormData(prev => ({
      ...prev,
      opd_hours: {
        ...prev.opd_hours,
        [day]: { ...prev.opd_hours[day], open }
      }
    }));
  };

  const updateTime = (day: string, type: 'from' | 'to', value: string) => {
    setFormData(prev => ({
      ...prev,
      opd_hours: {
        ...prev.opd_hours,
        [day]: { ...prev.opd_hours[day], [type]: value }
      }
    }));
  };

  const addDoctor = () => {
    setFormData(prev => ({
      ...prev,
      doctors: [...prev.doctors, { name: '', qualification: '', specialty: '' }]
    }));
  };

  const removeDoctor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      doctors: prev.doctors.filter((_, i) => i !== index)
    }));
  };

  const updateDoctor = (index: number, field: keyof Doctor, value: string) => {
    const newDocs = [...formData.doctors];
    newDocs[index] = { ...newDocs[index], [field]: value };
    setFormData(prev => ({ ...prev, doctors: newDocs }));
  };

  const handleSave = async () => {
    if (!provider) return;
    setIsLoading(true);

    try {
      const isFeeIncrease = 
        formData.fee_opd.min > (provider.fee_opd.min || 0) || 
        formData.fee_opd.max > (provider.fee_opd.max || 0);

      // 1. WhatsApp Case for Fee Increase (Layer 2A requirement)
      if (isFeeIncrease) {
        await supabase.from('whatsapp_cases').insert({
          severity: 'P3',
          category: 'FEE_UPDATE',
          status: 'Open',
          provider_id: provider.id,
          notes: `Provider requested fee increase: OPD ${provider.fee_opd.min}-${provider.fee_opd.max} -> ${formData.fee_opd.min}-${formData.fee_opd.max}`,
          opened_at: new Date().toISOString()
        });
        
        // Don't update fees immediately if they increased
        // (Simplified logic: keep old fees in update payload for now)
        var updatePayload = {
          ...formData,
          fee_opd: provider.fee_opd, // Keep old fees for review
          last_activity_at: new Date().toISOString()
        };
        Alert.alert('Success', 'Profile updated. Fee increases have been submitted for review.');
      } else {
        var updatePayload = {
          ...formData,
          last_activity_at: new Date().toISOString()
        };
        Alert.alert('Success', 'Profile updated successfully.');
      }

      const { error } = await supabase
        .from('providers')
        .update(updatePayload)
        .eq('id', provider.id);

      if (error) throw error;
      
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Clinic Profile' }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Card style={styles.card}>
          <Input 
            label="Clinic Name"
            value={formData.name}
            onChangeText={(t) => setFormData(p => ({ ...p, name: t }))}
            placeholder="Name as it appears on signage"
          />
          <View style={{ height: spacing.lg }} />
          <Input 
            label="Phone Number"
            value={formData.phone}
            onChangeText={(t) => setFormData(p => ({ ...p, phone: t }))}
            placeholder="+91 00000 00000"
          />
          <View style={{ height: spacing.lg }} />
          <Input 
            label="About (200 chars)"
            value={formData.about}
            onChangeText={(t) => setFormData(p => ({ ...p, about: t.slice(0, 200) }))}
            multiline
            numberOfLines={3}
            placeholder="Brief description of your services..."
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OPD Consultation Fees</Text>
        <Card style={styles.card}>
           <View style={styles.inlineInputs}>
              <View style={{ flex: 1 }}>
                <Input 
                  label="Min Fee"
                  value={String(formData.fee_opd.min)}
                  onChangeText={(t) => setFormData(p => ({ ...p, fee_opd: { ...p.fee_opd, min: parseInt(t) || 0 } }))}
                  keyboardType="numeric"
                  leftIcon={<IndianRupee size={16} color={palette.navy[400]} />}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input 
                  label="Max Fee"
                  value={String(formData.fee_opd.max)}
                  onChangeText={(t) => setFormData(p => ({ ...p, fee_opd: { ...p.fee_opd, max: parseInt(t) || 0 } }))}
                  keyboardType="numeric"
                  leftIcon={<IndianRupee size={16} color={palette.navy[400]} />}
                />
              </View>
           </View>
           <View style={styles.infoBox}>
              <Info size={16} color={palette.teal[700]} />
              <Text style={styles.infoText}>
                Fee increases require review from Travel Health Bridge ops and will update within 24 hours. Decreases are immediate.
              </Text>
           </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        <Card style={styles.card}>
           {DAYS.map(day => (
             <View key={day} style={styles.dayRow}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                  <Switch 
                     value={formData.opd_hours[day]?.open} 
                     onValueChange={(v) => handleDayToggle(day, v)}
                     trackColor={{ false: palette.navy[100], true: palette.teal[600] }}
                  />
                </View>
                {formData.opd_hours[day]?.open && (
                  <View style={styles.timeInputs}>
                    <TextInput 
                       style={styles.timeInput} 
                       value={formData.opd_hours[day].from}
                       onChangeText={(v) => updateTime(day, 'from', v)}
                    />
                    <Text style={styles.toSeparator}>to</Text>
                    <TextInput 
                       style={styles.timeInput}
                       value={formData.opd_hours[day].to}
                       onChangeText={(v) => updateTime(day, 'to', v)}
                    />
                  </View>
                )}
             </View>
           ))}
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Doctors List</Text>
          <TouchableOpacity onPress={addDoctor} style={styles.addBtn}>
            <Plus size={16} color={palette.teal[600]} />
            <Text style={styles.addText}>Add Doctor</Text>
          </TouchableOpacity>
        </View>
        
        {formData.doctors.map((doc, idx) => (
          <Card key={idx} style={[styles.card, { marginBottom: spacing.md }]}>
             <View style={styles.doctorHeader}>
                <Stethoscope size={20} color={palette.teal[600]} />
                <TouchableOpacity onPress={() => removeDoctor(idx)}>
                  <Trash2 size={18} color={palette.red[600]} />
                </TouchableOpacity>
             </View>
             <Input 
                label="Full Name"
                value={doc.name}
                onChangeText={(t) => updateDoctor(idx, 'name', t)}
                placeholder="Dr. Name"
             />
             <View style={{ height: spacing.md }} />
             <View style={styles.inlineInputs}>
                <View style={{ flex: 1 }}>
                  <Input 
                    label="Qualification"
                    value={doc.qualification}
                    onChangeText={(t) => updateDoctor(idx, 'qualification', t)}
                    placeholder="MBBS/MD"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input 
                    label="Specialty"
                    value={doc.specialty}
                    onChangeText={(t) => updateDoctor(idx, 'specialty', t)}
                    placeholder="General"
                  />
                </View>
             </View>
          </Card>
        ))}
      </View>

      <Button 
        title="Save Profile Changes"
        onPress={handleSave}
        loading={isLoading}
        variant="primary"
        style={styles.mainSaveBtn}
        leftIcon={<Save size={20} color="#fff" />}
      />

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.navy[900],
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: palette.teal[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: palette.teal[900],
    flex: 1,
    lineHeight: 18,
  },
  dayRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.navy[700],
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.navy[100],
    padding: 8,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    color: palette.navy[900],
    textAlign: 'center',
  },
  toSeparator: {
    fontSize: 12,
    color: palette.navy[400],
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.teal[700],
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mainSaveBtn: {
    marginBottom: spacing.xxl,
  }
});
