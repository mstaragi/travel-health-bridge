import { track } from '@travelhealthbridge/shared';
import { useRef, useEffect } from 'react';

export default function TriageLayout() {
  const segments = useSegments();
  const router = useRouter();
  const hasFinished = useRef(false);
  
  // Basic Progress Bar mapping. 'stepX' corresponds to segment name
  const currentStep = segments[segments.length - 1];
  
  let progress = 0;
  if (currentStep === 'step1-urgency') progress = 0.2;
  if (currentStep === 'step2-city') progress = 0.4;
  if (currentStep === 'step3-language') progress = 0.6;
  if (currentStep === 'step4-symptom') progress = 0.8;
  if (currentStep === 'step5-budget') progress = 1.0;

  useEffect(() => {
    if (progress === 1.0) hasFinished.current = true;
  }, [progress]);

  useEffect(() => {
    return () => {
      if (!hasFinished.current) {
        track('triage_abandoned', {
          last_step_number: Math.round(progress * 5),
          progress_pct: progress * 100
        });
      }
    };
  }, []);

  const showProgress = progress > 0;
  // Spec: No back button on Step 1.
  const showBack = progress > 0.2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} /> // Placeholder
        )}
        
        {/* Progress Bar Container */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>

      <Stack 
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right', // Expo Router uses native stack animations automatically
          contentStyle: { backgroundColor: palette.gray[50] },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center progress bar relative to screen
    paddingHorizontal: spacing.md,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.md,
    backgroundColor: palette.gray[50],
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md, 
    zIndex: 10,
    width: 60,
  },
  backText: {
    color: palette.teal[700],
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  progressContainer: {
    width: '50%',
    height: 8,
    backgroundColor: palette.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.teal[500],
  },
});
