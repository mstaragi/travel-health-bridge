/**
 * packages/shared/utils/analytics.ts
 * PostHog event tracking for Travel Health Bridge
 * All 28 events from specification instrumented here
 */

import { PostHog } from 'posthog-js';

// Initialize PostHog (call this in app initialization)
let posthog: PostHog | null = null;

export const initAnalytics = (apiKey: string) => {
  if (typeof window !== 'undefined' && !posthog) {
    const PostHogBrowser = require('posthog-js');
    posthog = new PostHogBrowser(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    });
  }
};

/**
 * CONSUMER APP EVENTS (17)
 */

// Lifecycle Events
export const trackAppOpened = (props?: { version?: string; device_os?: string }) => {
  posthog?.capture('app_opened', props || {});
};

export const trackAppClosed = (props?: { session_duration_seconds?: number }) => {
  posthog?.capture('app_closed', props || {});
};

// Authentication Events
export const trackPhoneNumberEntered = (props?: { country_code?: string }) => {
  posthog?.capture('phone_number_entered', props || {});
};

export const trackOtpSent = (props?: { carrier?: string }) => {
  posthog?.capture('otp_sent', props || {});
};

export const trackOtpVerified = () => {
  posthog?.capture('otp_verified', {});
};

export const trackOnboardingStarted = () => {
  posthog?.capture('onboarding_started', {});
};

export const trackOnboardingCompleted = () => {
  posthog?.capture('onboarding_completed', {});
};

export const trackGuestModeSelected = () => {
  posthog?.capture('guest_mode_selected', {});
};

// Triage Flow Events
export const trackTriageStarted = (props?: { source?: 'home' | 'emergency' | 'vault' }) => {
  posthog?.capture('triage_started', props || { source: 'home' });
};

export const trackTriageStepCompleted = (props?: {
  step_number: 1 | 2 | 3 | 4 | 5;
  step_name?: 'urgency' | 'city' | 'language' | 'symptom' | 'budget';
  urgency?: string;
  city_id?: string;
  languages?: string[];
  symptom?: string;
  budget_max?: number;
}) => {
  posthog?.capture('triage_step_completed', props || {});
};

export const trackTriageAbandoned = (props?: {
  last_completed_step?: number;
  reason?: string;
}) => {
  posthog?.capture('triage_abandoned', props || {});
};

export const trackProviderRankingDisplayed = (props?: {
  total_providers_ranked: number;
  top_providers_count: number;
  user_city_id?: string;
}) => {
  posthog?.capture('provider_ranking_displayed', props || {});
};

export const trackProviderNoAnswerReported = (props?: {
  provider_id: string;
  provider_name?: string;
  attempted_calls?: number;
}) => {
  posthog?.capture('provider_no_answer_reported', props || {});
};

export const trackProviderCallInitiated = (props?: {
  provider_id: string;
  provider_name?: string;
}) => {
  posthog?.capture('provider_call_initiated', props || {});
};

// Emergency Events
export const trackEmergencyScreenViewed = (props?: { current_city?: string }) => {
  posthog?.capture('emergency_screen_viewed', props || {});
};

export const trackEmergencyContactNotified = (props?: {
  contact_method: 'call' | 'sms' | 'whatsapp';
  location_shared: boolean;
  user_city?: string;
}) => {
  posthog?.capture('emergency_contact_notified', props || {});
};

export const trackSOSTriggered = (props?: { button_tap_count?: number }) => {
  posthog?.capture('sos_triggered', props || {});
};

// Vault Events
export const trackVaultOpened = () => {
  posthog?.capture('vault_opened', {});
};

export const trackVaultDataSaved = (props?: {
  data_type: 'blood_group' | 'allergies' | 'medications' | 'emergency_contacts' | 'insurance';
  field_count?: number;
}) => {
  posthog?.capture('vault_data_saved', props || {});
};

/**
 * PROVIDER APP EVENTS (6)
 */

export const trackProviderLoginAttempted = () => {
  posthog?.capture('provider_login_attempted', {});
};

export const trackProviderEmailOtpVerified = () => {
  posthog?.capture('provider_email_otp_verified', {});
};

export const trackProviderAvailabilityToggled = (props?: {
  available_now: boolean;
  toggle_duration_ms?: number;
}) => {
  posthog?.capture('provider_availability_toggled', props || {});
};

export const trackProviderProfileUpdated = (props?: {
  fields_updated: number;
  timestamp_ms?: number;
}) => {
  posthog?.capture('provider_profile_updated', props || {});
};

export const trackProviderReferralViewed = (props?: {
  referral_count: number;
  source?: string;
}) => {
  posthog?.capture('provider_referral_viewed', props || {});
};

export const trackProviderFeedbackViewed = (props?: {
  feedback_count: number;
  avg_star_rating?: number;
}) => {
  posthog?.capture('provider_feedback_viewed', props || {});
};

/**
 * FEEDBACK EVENTS (5)
 */

export const trackFeedbackStarted = (props?: {
  visit_provider_id?: string;
  session_id?: string;
}) => {
  posthog?.capture('feedback_started', props || {});
};

export const trackFeedbackStep1Answered = (props?: {
  prior_source: string;
}) => {
  posthog?.capture('feedback_step1_answered', props || {});
};

export const trackFeedbackVisitedToggle = (props?: {
  visited: boolean;
}) => {
  posthog?.capture('feedback_visited_toggle', props || {});
};

export const trackFeedbackCostAccuracyAnswered = (props?: {
  cost_accurate: 'yes' | 'no' | 'not_sure';
}) => {
  posthog?.capture('feedback_cost_accuracy_answered', props || {});
};

export const trackFeedbackSubmitted = (props?: {
  prior_source?: string;
  visited?: boolean;
  cost_accurate?: string;
  star_rating?: number;
  language_comfort?: string;
  reuse_intent?: string;
  feedback_length?: number;
}) => {
  posthog?.capture('feedback_submitted', props || {});
};

/**
 * ADMIN CONSOLE EVENTS
 */

export const trackAdminCaseReviewed = (props?: {
  case_type: 'overcharge' | 'complaint' | 'quality_issue';
  action_taken: 'approve' | 'reject' | 'escalate';
}) => {
  posthog?.capture('admin_case_reviewed', props || {});
};

export const trackAdminProviderSuspended = (props?: {
  provider_id: string;
  reason: string;
  suspension_duration_days?: number;
}) => {
  posthog?.capture('admin_provider_suspended', props || {});
};

export const trackAdminDailySummaryViewed = (props?: {
  metrics_count?: number;
}) => {
  posthog?.capture('admin_daily_summary_viewed', props || {});
};

/**
 * USER IDENTIFICATION
 */

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  posthog?.identify(userId, {
    ...traits,
    identified_at: new Date().toISOString(),
  });
};

export const setUserProperties = (traits: Record<string, any>) => {
  posthog?.setPersonProperties(traits);
};

/**
 * UTILITY: Track timing
 */
export const trackEventWithTiming = (
  eventName: string,
  startTime: number,
  properties?: Record<string, any>
) => {
  const duration = Date.now() - startTime;
  posthog?.capture(eventName, {
    ...properties,
    duration_ms: duration,
  });
};
