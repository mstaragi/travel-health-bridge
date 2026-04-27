import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { palette, typography, spacing, borderRadius, shadows } from '@travelhealthbridge/shared/ui/tokens';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { Card } from '@travelhealthbridge/shared/ui/Card';
import { track, supabase } from '@travelhealthbridge/shared';
import { useAuthStore } from 'store/authStore';

interface FeedbackData {
  provider_id: string;
  user_id: string;
  session_id: string;
  // Amendment 1 fields - EXACT ORDER MUST BE PRESERVED
  prior_recommendation_source?: string; // FIRST FIELD - Mandatory
  language_comfort?: string;
  visited_recommended_provider?: boolean; // Displacement field
  cost_accurate?: string;
  star_rating?: number;
  notes?: string;
  // Metadata
  created_at: string;
  amended_1_compliant: boolean;
}

export default function FeedbackScreen() {
  const { providerId, sessionId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuthStore();

  // Amendment 1 Fields in exact order
  const [priorSource, setPriorSource] = useState<string | null>(null); // MANDATORY FIRST
  const [languageComfort, setLanguageComfort] = useState<string | null>(null);
  const [visitedRecommended, setVisitedRecommended] = useState<boolean | null>(null);
  const [costAccurate, setCostAccurate] = useState<string | null>(null);
  const [starRating, setStarRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    track('feedback_form_opened', { 
      provider_id: providerId,
      session_id: sessionId
    });
    setIsLoading(false);
  }, [providerId, sessionId]);

  const showSourcePrompt = !priorSource;
  const showLanguagePrompt = priorSource && !languageComfort;
  const showVisitedPrompt = priorSource && languageComfort && visitedRecommended === null;
  // Only show cost/rating/notes if visited=true AND visited_recommended_provider=true
  const shouldShowConditionalFields = visitedRecommended === true;
  const showCostPrompt = showConditionalFields && costAccurate === null;
  const showRatingPrompt = showConditionalFields && starRating === null;
  const showNotesField = showConditionalFields;

  const handleSourceSelect = (source: string) => {
    setPriorSource(source);
    track('feedback_prior_source_selected', { source });
  };

  const handleLanguageSelect = (comfort: string) => {
    setLanguageComfort(comfort);
    track('feedback_language_comfort_selected', { comfort });
  };

  const handleVisitedSelect = (visited: boolean) => {
    setVisitedRecommended(visited);
    track('feedback_visited_recommended_provider_selected', { visited });
  };

  const handleCostSelect = (accurate: string) => {
    setCostAccurate(accurate);
    track('feedback_cost_accurate_selected', { accurate });
  };

  const handleStarSelect = (stars: number) => {
    setStarRating(stars);
    track('feedback_star_rating_selected', { rating: stars });
  };

  const canSubmit = priorSource && languageComfort && visitedRecommended !== null;
  const canSubmitFull = canSubmit && (
    !shouldShowConditionalFields || 
    (costAccurate && starRating)
  );

  const handleSubmit = async () => {
    if (!session?.user?.id || !providerId || !sessionId) return;

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }

    setIsSubmitting(true);

    try {
      const feedbackPayload: FeedbackData = {
        provider_id: providerId as string,
        user_id: session.user.id,
        session_id: sessionId as string,
        prior_recommendation_source: priorSource,
        language_comfort: languageComfort,
        visited_recommended_provider: visitedRecommended,
        cost_accurate: shouldShowConditionalFields ? costAccurate : undefined,
        star_rating: shouldShowConditionalFields ? starRating : undefined,
        notes: shouldShowConditionalFields ? notes : undefined,
        created_at: new Date().toISOString(),
        amended_1_compliant: true, // Mark as Amendment 1 compliant
      };

      // Submit to Supabase
      const { error } = await supabase
        .from('feedback')
        .insert([feedbackPayload]);

      if (error) throw error;

      // Track successful submission
      track('feedback_submitted', {
        prior_source: priorSource,
        has_conditional_fields: shouldShowConditionalFields,
        star_rating: starRating,
        amendment_1_compliant: true,
      });

      Alert.alert('Thank You!', 'Your feedback helps us improve service quality.');
      router.back();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={palette.teal[600]} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* STEP 1: Prior Recommendation Source (MANDATORY FIRST) */}
      {showSourcePrompt && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>How did you find this provider?</Text>
          <Text style={styles.sectionSubtitle}>This helps us understand provider discovery patterns</Text>
          
          <View style={styles.buttonGroup}>
            {['Search', 'Recommendation', 'Previous Visit', 'Emergency', 'Other'].map(source => (
              <TouchableOpacity
                key={source}
                style={[
                  styles.optionButton,
                  priorSource === source && styles.optionButtonActive
                ]}
                onPress={() => handleSourceSelect(source)}
              >
                <Text style={[
                  styles.optionText,
                  priorSource === source && styles.optionTextActive
                ]}>
                  {source}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* STEP 2: Language Comfort */}
      {showLanguagePrompt && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Language Comfort</Text>
          <Text style={styles.sectionSubtitle}>How comfortable were you with the language used?</Text>
          
          <View style={styles.buttonGroup}>
            {['Very Comfortable', 'Comfortable', 'Neutral', 'Uncomfortable', 'Very Uncomfortable'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  languageComfort === option && styles.optionButtonActive
                ]}
                onPress={() => handleLanguageSelect(option)}
              >
                <Text style={[
                  styles.optionText,
                  languageComfort === option && styles.optionTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* STEP 3: Visited Recommended Provider (Displacement Field) */}
      {showVisitedPrompt && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Did you visit this recommended provider?</Text>
          <Text style={styles.sectionSubtitle}>This helps us track provider utilization</Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.largeButton,
                visitedRecommended === true && styles.largeButtonActive
              ]}
              onPress={() => handleVisitedSelect(true)}
            >
              <Text style={[
                styles.largeButtonText,
                visitedRecommended === true && styles.largeButtonTextActive
              ]}>
                ✓ Yes, I Visited
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.largeButton,
                visitedRecommended === false && styles.largeButtonActive
              ]}
              onPress={() => handleVisitedSelect(false)}
            >
              <Text style={[
                styles.largeButtonText,
                visitedRecommended === false && styles.largeButtonTextActive
              ]}>
                ✗ No, Did Not Visit
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* STEP 4: Conditional Fields (Only show if visited=true AND visited_recommended_provider=true) */}
      {shouldShowConditionalFields && (
        <>
          {showCostPrompt && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Was the cost accurate?</Text>
              <Text style={styles.sectionSubtitle}>Did the provider quote match what you paid?</Text>
              
              <View style={styles.buttonGroup}>
                {['Accurate', 'Somewhat', 'Inaccurate'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      costAccurate === option && styles.optionButtonActive
                    ]}
                    onPress={() => handleCostSelect(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      costAccurate === option && styles.optionTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {showRatingPrompt && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Rate this provider</Text>
              <Text style={styles.sectionSubtitle}>0 stars = poor, 5 stars = excellent</Text>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarSelect(star)}
                  >
                    <Text style={[
                      styles.star,
                      star <= (starRating || 0) && styles.starActive
                    ]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {showNotesField && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Any additional feedback?</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={palette.slate[400]}
              />
            </Card>
          )}
        </>
      )}

      {/* Submit Button */}
      {canSubmit && (
        <Button
          label={canSubmitFull ? 'Submit Feedback' : 'Continue'}
          onPress={handleSubmit}
          variant="primary"
          fullWidth
          style={styles.submitButton}
          disabled={isSubmitting}
        />
      )}

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={palette.teal[600]} size="large" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    color: palette.navy[800],
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body2,
    color: palette.slate[600],
    marginBottom: spacing.md,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  optionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.slate[200],
    backgroundColor: palette.slate[50],
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: palette.teal[50],
    borderColor: palette.teal[600],
  },
  optionText: {
    ...typography.body2,
    color: palette.navy[700],
  },
  optionTextActive: {
    color: palette.teal[600],
    fontWeight: '600',
  },
  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: palette.slate[300],
    backgroundColor: palette.slate[50],
    alignItems: 'center',
  },
  largeButtonActive: {
    backgroundColor: palette.teal[50],
    borderColor: palette.teal[600],
  },
  largeButtonText: {
    ...typography.heading3,
    color: palette.navy[800],
  },
  largeButtonTextActive: {
    color: palette.teal[600],
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  star: {
    fontSize: 48,
    color: palette.slate[300],
  },
  starActive: {
    color: palette.amber[400],
  },
  notesInput: {
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body2,
    color: palette.navy[900],
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
});
