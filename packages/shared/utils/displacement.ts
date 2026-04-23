import { Feedback } from '../types';

/**
 * Calculates the TRUE displacement rate per the Final Specification.
 * 
 * Formula:
 * COUNT where prior_recommendation_source != 'Travel Health Bridge was my first step'
 * AND visited_recommended_provider = true
 * DIVIDED BY 
 * COUNT where prior_recommendation_source != 'Travel Health Bridge was my first step'
 */
export function calculateDisplacementRate(feedbackRecords: Feedback[]): number {
  const displacementCandidates = feedbackRecords.filter(
    (f) => f.prior_recommendation_source !== 'No — Travel Health Bridge was my first step'
  );

  if (displacementCandidates.length === 0) return 0;

  const successfulDisplacements = displacementCandidates.filter(
    (f) => f.visited_recommended_provider === true
  );

  return (successfulDisplacements.length / displacementCandidates.length) * 100;
}

/**
 * Calculates the reuse intent rate (PMF signal).
 */
export function calculateReuseIntentRate(feedbackRecords: Feedback[]): number {
  if (feedbackRecords.length === 0) return 0;
  
  const intendedReuse = feedbackRecords.filter((f) => f.reuse_intent === 'yes');
  return (intendedReuse.length / feedbackRecords.length) * 100;
}
