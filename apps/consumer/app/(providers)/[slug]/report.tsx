import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase, track } from '@travelhealthbridge/shared';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Input } from '@travelhealthbridge/shared/ui/Input';
import { palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui/tokens';

export default function ReportOverchargeScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  
  const [actualAmount, setActualAmount] = useState('');
  const [description, setDescription] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock data for provider info
  const providerName = "Apollo Spectra Hospital";
  const quotedRange = "₹800 - ₹1200";

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!actualAmount) {
      Alert.alert('Error', 'Please enter the actual amount charged.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Map to overcharge_reports table
      const { error } = await supabase.from('overcharge_reports').insert({
        provider_id: slug,
        user_id: user?.id || null,
        amount_paid: parseFloat(actualAmount),
        has_receipt: hasReceipt,
        description,
        visit_date: new Date().toISOString(),
        // Photo upload would involve supabase.storage here
      });

      if (error) throw error;
      setSuccess(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Stack.Screen options={{ title: 'Report Submitted', headerLeft: () => null }} />
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Report Received</Text>
          <Text style={styles.successBody}>
            We investigate within 24 hours and take corrective action against providers who charge beyond their committed range. 
            We will update you on the outcome.
          </Text>
          <Button 
            title="Done" 
            onPress={() => router.back()} 
            variant="primary" 
            style={{ width: '100%', marginTop: spacing.xl }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ title: 'Report Overcharge' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.infoBox}>
           <Text style={styles.infoLabel}>Provider</Text>
           <Text style={styles.infoValue}>{providerName}</Text>
           <View style={{ height: spacing.md }} />
           <Text style={styles.infoLabel}>Committed Range</Text>
           <Text style={[styles.infoValue, { color: palette.teal[700] }]}>{quotedRange}</Text>
        </View>

        <Text style={styles.sectionTitle}>Visit Details</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>How much were you charged? (INR)</Text>
          <Input 
             value={actualAmount}
             onChangeText={setActualAmount}
             placeholder="e.g. 1500"
             keyboardType="numeric"
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Do you have a receipt?</Text>
            <TouchableOpacity 
              style={[styles.toggle, hasReceipt && styles.toggleActive]}
              onPress={() => setHasReceipt(!hasReceipt)}
            >
               <View style={[styles.toggleCircle, hasReceipt && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {hasReceipt && (
          <View style={styles.imageSection}>
             {image ? (
               <View style={styles.imagePreviewContainer}>
                 <Image source={{ uri: image }} style={styles.imagePreview} />
                 <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                    <Text style={styles.removeText}>Remove</Text>
                 </TouchableOpacity>
               </View>
             ) : (
               <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                  <Text style={styles.uploadEmoji}>📷</Text>
                  <Text style={styles.uploadText}>Upload receipt photo</Text>
               </TouchableOpacity>
             )}
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput 
            value={description}
            onChangeText={setDescription}
            placeholder="Share what happened..."
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.textArea}
            placeholderTextColor={palette.gray[400]}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        <View style={{ height: spacing.xxl }} />
        
        <Button 
          title="Submit Report" 
          onPress={handleSubmit} 
          isLoading={isSubmitting} 
          variant="primary" 
          disabled={!actualAmount}
        />
        
        <Text style={styles.footerNote}>
          Travel Health Bridge enforces price transparency. Your report helps protect other travelers.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  scrollContent: {
    padding: spacing.xl,
  },
  infoBox: {
    backgroundColor: palette.gray[0],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: palette.gray[200],
    marginBottom: spacing.xl,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: palette.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[900],
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[900],
    marginBottom: spacing.md,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: palette.gray[700],
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.gray[300],
    padding: 2,
  },
  toggleActive: {
    backgroundColor: palette.teal[600],
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  uploadBtn: {
    height: 120,
    borderWidth: 2,
    borderColor: palette.gray[300],
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.gray[0],
  },
  uploadEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadText: {
    color: palette.gray[500],
    fontSize: typography.fontSize.sm,
  },
  imagePreviewContainer: {
    height: 160,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  textArea: {
    backgroundColor: palette.gray[0],
    borderWidth: 1,
    borderColor: palette.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: typography.fontSize.base,
    color: palette.gray[900],
  },
  charCount: {
    textAlign: 'right',
    fontSize: 10,
    color: palette.gray[400],
    marginTop: 4,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: palette.gray[400],
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  successContainer: {
    flex: 1,
    backgroundColor: palette.gray[50],
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successCard: {
    backgroundColor: palette.gray[0],
    padding: spacing['2xl'],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: palette.gray[900],
    marginBottom: spacing.md,
  },
  successBody: {
    fontSize: typography.fontSize.md,
    color: palette.gray[700],
    textAlign: 'center',
    lineHeight: 24,
  },
});
