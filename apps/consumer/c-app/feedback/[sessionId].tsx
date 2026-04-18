import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react-native';
import { supabase, TABLES } from '@travelhealthbridge/shared';
import { palette, typography, spacing, borderRadius, shadows } from '@travelhealthbridge/shared/ui/tokens';
import { Button } from '@travelhealthbridge/shared/ui/Button';

// Step 0 Options
const PRIOR_SOURCES = [
  'Travel Health Bridge was my first step',
  'Hotel recommended somewhere',
  'I already had a doctor in mind',
  'I found it myself on Google'
];

export default function FeedbackScreen() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  // Form State
  const [priorSource, setPriorSource] = useState('');
  const [visited, setVisited] = useState<boolean | null>(null);
  const [visitedRecommended, setVisitedRecommended] = useState<boolean | null>(null);
  const [costAccurate, setCostAccurate] = useState<string | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  const [languageComfort, setLanguageComfort] = useState<string | null>(null);
  const [reuseIntent, setReuseIntent] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRIAGE_SESSIONS)
        .select(`
          *,
          recommended_provider:recommended_provider_id (name)
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSessionData(data);
      
      // Mark as feedback_opened
      await supabase
        .from(TABLES.TRIAGE_SESSIONS)
        .update({ feedback_sent: true }) // Re-using this flag to mean 'interaction started' or we can add feedback_opened
        .eq('id', sessionId);

    } catch (e) {
      console.error('Failed to load session:', e);
      Alert.alert('Error', 'Could not find this session.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Branching logic
    if (step === 1 && visited === false) {
      setStep(5); // Skip to reuse intent
      return;
    }
    if (step === 1 && visited === true) {
      setStep(1.5); // 1b
      return;
    }
    if (step === 1.5 && visitedRecommended === false) {
      setStep(3); // Skip cost/accuracy and go to rating
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        session_id: sessionId,
        prior_recommendation_source: priorSource,
        visited,
        visited_recommended_provider: visitedRecommended,
        cost_accurate: costAccurate,
        star_rating: starRating,
        language_comfort: languageComfort,
        reuse_intent: reuseIntent,
        notes: notes.slice(0, 200),
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(TABLES.FEEDBACK)
        .upsert(payload);

      if (error) throw error;

      setStep(7); // Thank you step
    } catch (e) {
      console.error(e);
      Alert.alert('Submission Failed', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.teal[600]} />
      </View>
    );
  }

  // Multi-step Content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Before contacting us, did you have another recommendation?</Text>
            {PRIOR_SOURCES.map(source => (
              <TouchableOpacity 
                key={source} 
                style={[styles.option, priorSource === source && styles.optionSelected]}
                onPress={() => setPriorSource(source)}
              >
                <Text style={[styles.optionText, priorSource === source && styles.optionTextSelected]}>{source}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Did you get medical help after this?</Text>
            <View style={styles.binaryRow}>
              <TouchableOpacity 
                style={[styles.binaryBtn, visited === true && styles.binaryBtnSelected]}
                onPress={() => setVisited(true)}
              >
                <Text style={[styles.binaryText, visited === true && styles.binaryTextSelected]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.binaryBtn, visited === false && styles.binaryBtnSelected]}
                onPress={() => setVisited(false)}
              >
                <Text style={[styles.binaryText, visited === false && styles.binaryTextSelected]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 1.5: // 1b
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Did you go to {sessionData?.recommended_provider?.name || 'the recommended clinic'}?</Text>
            <TouchableOpacity 
              style={[styles.option, visitedRecommended === true && styles.optionSelected]}
              onPress={() => setVisitedRecommended(true)}
            >
              <Text style={[styles.optionText, visitedRecommended === true && styles.optionTextSelected]}>Yes, I went there</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.option, visitedRecommended === false && styles.optionSelected]}
              onPress={() => setVisitedRecommended(false)}
            >
              <Text style={[styles.optionText, visitedRecommended === false && styles.optionTextSelected]}>No, I went somewhere else</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Was the cost within the predicted range?</Text>
            {['yes', 'no', 'not_sure'].map(val => (
              <TouchableOpacity 
                key={val} 
                style={[styles.option, costAccurate === val && styles.optionSelected]}
                onPress={() => setCostAccurate(val)}
              >
                <Text style={[styles.optionText, costAccurate === val && styles.optionTextSelected]}>
                  {val === 'not_sure' ? 'Not sure' : val.charAt(0).toUpperCase() + val.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>How was your overall experience?</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(nu => (
                <TouchableOpacity key={nu} onPress={() => setStarRating(nu)}>
                  <Star size={40} color={nu <= starRating ? palette.amber[400] : palette.gray[200]} fill={nu <= starRating ? palette.amber[400] : 'transparent'} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Was communication in your language comfortable?</Text>
            {['yes', 'partial', 'no'].map(val => (
              <TouchableOpacity 
                key={val} 
                style={[styles.option, languageComfort === val && styles.optionSelected]}
                onPress={() => setLanguageComfort(val)}
              >
                <Text style={[styles.optionText, languageComfort === val && styles.optionTextSelected]}>
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Would you use Travel Health Bridge again in another city?</Text>
            {['yes', 'maybe', 'no'].map(val => (
              <TouchableOpacity 
                key={val} 
                style={[styles.option, reuseIntent === val && styles.optionSelected]}
                onPress={() => setReuseIntent(val)}
              >
                <Text style={[styles.optionText, reuseIntent === val && styles.optionTextSelected]}>
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Anything else you'd like to share?</Text>
            <TextInput 
              style={styles.textArea}
              placeholder="Tell us about your visit (Optional)"
              multiline
              maxLength={200}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        );

      case 7:
        return (
          <View style={styles.thankYou}>
            <CheckCircle2 size={80} color={palette.teal[600]} style={{ marginBottom: spacing.xl }} />
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouSub}>Your feedback helps us remain the most reliable medical resource for travellers in India.</Text>
            <Button label="Back to Home" onPress={() => router.replace('/')} variant="primary" fullWidth style={{ marginTop: spacing.xxl }} />
          </View>
        );

      default:
        return null;
    }
  };

  const canGoNext = () => {
    if (step === 0) return priorSource !== '';
    if (step === 1) return visited !== null;
    if (step === 1.5) return visitedRecommended !== null;
    if (step === 2) return costAccurate !== null;
    if (step === 3) return starRating > 0;
    if (step === 4) return languageComfort !== null;
    if (step === 5) return reuseIntent !== null;
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Feedback', 
        headerLeft: step > 0 && step < 7 ? () => (
          <TouchableOpacity onPress={() => setStep(prev => prev === 1.5 ? 1 : prev - 1)}>
            <ChevronLeft size={24} color={palette.navy[900]} />
          </TouchableOpacity>
        ) : undefined
      }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {step < 7 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${(step / 6) * 100}%` }]} />
            </View>
          )}

          {renderStep()}

          {step < 6 && (
            <Button 
              label="Continue" 
              onPress={handleNext} 
              variant="primary" 
              disabled={!canGoNext()}
              fullWidth
              style={{ marginTop: spacing.xl }}
            />
          )}

          {step === 6 && (
            <Button 
              label={isSubmitting ? "Submitting..." : "Submit Feedback"} 
              onPress={handleSubmit} 
              variant="primary" 
              isLoading={isSubmitting}
              fullWidth
              style={{ marginTop: spacing.xl }}
            />
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
  scroll: {
    padding: spacing.xl,
  },
  progressContainer: {
    height: 4,
    backgroundColor: palette.gray[100],
    borderRadius: 2,
    marginBottom: spacing.xxl,
  },
  progressBar: {
    height: '100%',
    backgroundColor: palette.teal[600],
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  option: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  optionSelected: {
    borderColor: palette.teal[600],
    backgroundColor: palette.teal[50],
  },
  optionText: {
    fontSize: 16,
    color: palette.navy[900],
    fontWeight: typography.fontWeight.medium,
  },
  optionTextSelected: {
    color: palette.teal[800],
    fontWeight: typography.fontWeight.bold,
  },
  binaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  binaryBtn: {
    flex: 1,
    height: 100,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  binaryBtnSelected: {
    borderColor: palette.teal[600],
    backgroundColor: palette.teal[50],
  },
  binaryText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  binaryTextSelected: {
    color: palette.teal[800],
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  textArea: {
    backgroundColor: palette.gray[50],
    borderRadius: 16,
    padding: spacing.lg,
    height: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    color: palette.navy[900],
    borderWidth: 1,
    borderColor: palette.gray[200],
  },
  thankYou: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  thankYouTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
  },
  thankYouSub: {
    fontSize: 16,
    color: palette.navy[400],
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.md,
  }
});


