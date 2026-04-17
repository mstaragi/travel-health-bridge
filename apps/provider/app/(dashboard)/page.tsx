import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@travelhealthbridge/shared';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Tag } from '@travelhealthbridge/shared/ui/Tag';
import { palette, typography, spacing, borderRadius, shadows } from '@travelhealthbridge/shared/ui/tokens';

type TriagePatient = {
  id: string;
  userName: string;
  symptom: string;
  etaMinutes: number;
  status: 'routing' | 'arrived' | 'finalizing' | 'completed';
};

export default function ProviderDashboardScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const [queue, setQueue] = useState<TriagePatient[]>([
    { id: 'v1', userName: 'Mahendra Taragi', symptom: 'Fever & Cough', etaMinutes: 12, status: 'routing' },
    { id: 'v2', userName: 'Sarah Miller', symptom: 'Ankle Sprain', etaMinutes: 5, status: 'routing' },
  ]);
  const [activePatient, setActivePatient] = useState<TriagePatient | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [fees, setFees] = useState('');
  
  const providerId = 'p1'; // Mock current provider ID

  const toggleStatus = async (value: boolean) => {
    setIsOpen(value);
    try {
      // Mock Supabase update
      console.log(`Updating provider ${providerId} status to ${value}`);
      // await supabase.from('providers').update({ is_open_manual: value }).eq('id', providerId);
    } catch (e) {
      Alert.alert('Error', 'Failed to update status.');
      setIsOpen(!value);
    }
  };

  const markArrived = (patientId: string) => {
    setQueue(prev => prev.map(p => p.id === patientId ? { ...p, status: 'arrived' } : p));
    const patient = queue.find(p => p.id === patientId);
    if (patient) {
      setActivePatient({ ...patient, status: 'arrived' });
    }
  };

  const finalizeVisit = async () => {
    if (!diagnosis || !fees) {
      Alert.alert('Missing Info', 'Please enter diagnosis and final fees.');
      return;
    }

    try {
      console.log(`Finalizing visit for ${activePatient?.userName}`);
      // await supabase.from('visit_history').insert({...})
      Alert.alert('Success', 'Visit finalized and recorded.');
      setQueue(prev => prev.filter(p => p.id !== activePatient?.id));
      setActivePatient(null);
      setDiagnosis('');
      setFees('');
    } catch (e) {
      Alert.alert('Error', 'Failed to save visit.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'STABILIZED OPERATIONAL CENTER', headerShown: true }} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* SECTION 1: Status Toggle */}
        <View style={styles.statusSection}>
           <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Live Clinic Status</Text>
              <Text style={[styles.statusValue, { color: isOpen ? palette.teal[700] : palette.red[600] }]}>
                {isOpen ? 'RECEIVING PATIENTS' : 'CLOSED TO NEW PATIENTS'}
              </Text>
           </View>
           <Switch 
             value={isOpen} 
             onValueChange={toggleStatus}
             trackColor={{ false: palette.gray[300], true: palette.teal[600] }}
             thumbColor="white"
             style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
           />
        </View>

        {/* SECTION 2: Active Triage Queue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incoming Travelers</Text>
          {queue.filter(p => p.status === 'routing').length > 0 ? (
            queue.filter(p => p.status === 'routing').map(p => (
              <View key={p.id} style={styles.patientCard}>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{p.userName}</Text>
                    <Text style={styles.patientSymptom}>{p.symptom}</Text>
                    <Text style={styles.patientEta}>Arriving in ~{p.etaMinutes} mins</Text>
                 </View>
                 <TouchableOpacity style={styles.arrivedBtn} onPress={() => markArrived(p.id)}>
                    <Text style={styles.arrivedBtnText}>Patient Arrived</Text>
                 </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
               <Text style={styles.emptyText}>No travelers currently routed to this location.</Text>
            </View>
          )}
        </View>

        {/* SECTION 3: Visit Finalization */}
        {activePatient && (
          <View style={styles.finalizationSection}>
            <View style={styles.activeHeader}>
               <Text style={styles.activeLabel}>Finalizing Visit:</Text>
               <Text style={styles.activeName}>{activePatient.userName}</Text>
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.formLabel}>Diagnosis & Treatment Summary</Text>
               <TextInput 
                 style={styles.textArea}
                 multiline
                 numberOfLines={4}
                 placeholder="Enter clinical findings..."
                 value={diagnosis}
                 onChangeText={setDiagnosis}
               />
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.formLabel}>Final Amount Charged (INR)</Text>
               <TextInput 
                 style={styles.input}
                 placeholder="e.g. 1200"
                 keyboardType="numeric"
                 value={fees}
                 onChangeText={setFees}
               />
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.formLabel}>Upload Medical Documents</Text>
               <TouchableOpacity style={styles.uploadBtn}>
                  <Text style={styles.uploadText}>+ Add Files (Prescription, Receipt...)</Text>
               </TouchableOpacity>
            </View>

            <Button 
               title="Complete & Record Visit" 
               variant="primary" 
               onPress={finalizeVisit}
               style={styles.completeBtn}
            />
            
            <TouchableOpacity onPress={() => setActivePatient(null)} style={styles.cancelBtn}>
               <Text style={styles.cancelBtnText}>Discard Finalization</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scroll: {
    padding: spacing.xl,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.gray[50],
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: palette.gray[200],
    marginBottom: spacing['2xl'],
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: palette.gray[500],
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    marginTop: 4,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    color: palette.gray[900],
    marginBottom: spacing.lg,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: 'white',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: palette.gray[200],
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  patientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: palette.gray[900],
  },
  patientSymptom: {
    fontSize: typography.fontSize.md,
    color: palette.gray[600],
    marginTop: 2,
  },
  patientEta: {
    fontSize: typography.fontSize.xs,
    color: palette.teal[700],
    fontWeight: 'bold',
    marginTop: 4,
  },
  arrivedBtn: {
    backgroundColor: palette.teal[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  arrivedBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  emptyCard: {
    padding: spacing['3xl'],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.gray[100],
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
  },
  emptyText: {
    color: palette.gray[400],
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
  finalizationSection: {
    backgroundColor: palette.navy[900],
    padding: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    marginTop: spacing.xl,
  },
  activeHeader: {
    marginBottom: spacing.xl,
  },
  activeLabel: {
    color: palette.teal[400],
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeName: {
    color: 'white',
    fontSize: typography.fontSize['2xl'],
    fontWeight: '900',
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  formLabel: {
    color: palette.gray[300],
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: typography.fontSize.base,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: palette.gray[600],
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadText: {
    color: palette.gray[400],
    fontSize: typography.fontSize.sm,
  },
  completeBtn: {
    height: 64,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  cancelBtnText: {
    color: palette.gray[500],
    fontSize: typography.fontSize.xs,
    textDecorationLine: 'underline',
  },
});
