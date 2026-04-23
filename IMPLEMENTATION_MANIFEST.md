# Travel Health Bridge — Complete Implementation Manifest

**Document Purpose**: Single source of truth for ALL implementation work across 12 prompts.
**Status**: ACTIVE BUILD - Phases 1-2 execution started

---

## PHASE 1: FOUNDATION (PROMPT 1)
**Target**: Complete shared utilities, types, constants
**Status**: 80% complete — filling remaining gaps

### Prompt 1 Checklist

- [x] `packages/shared/types/index.ts` — All interfaces defined (Provider, TriageSession, Feedback with Amendment 1, WhatsappCase with Amendment 2, etc.)
- [x] `packages/shared/constants/index.ts` — CITIES (6), LANGUAGES (5), SPECIALTIES (15), SYMPTOM_TO_CLUSTER, NON_COVERED_CITY_CHECKLIST
- [x] `packages/shared/utils/rankProviders.ts` — 17-factor algorithm with Amendment 3 implemented
- [x] `packages/shared/utils/reliability.ts` — Amendment 4, 4-component reliability score
- [ ] `packages/shared/utils/displacement.ts` — TRUE displacement formula (per Amendment 1)
- [ ] `packages/shared/utils/distance.ts` — haversineDistance() function
- [ ] `packages/shared/utils/openStatus.ts` — isOpenNow() function
- [ ] `packages/shared/utils/formatFee.ts` — formatFeeRange() function
- [ ] `packages/shared/utils/staleness.ts` — computeStalenessTier() function
- [ ] `packages/shared/api/supabase.ts` — Complete React Query hooks for ALL tables
- [ ] `packages/shared/api/analytics.ts` — PostHog setup with all 28 events stub
- [ ] `.env.local.template` — Created with all required variables
- [ ] `eas.json` — Verify/complete 3 profiles (development, preview, production)
- [ ] Root `vercel.json` — Verify/complete for both PWA and admin console
- [ ] Root `package.json` — Verify workspaces, scripts, dependencies
- [ ] Unit tests for rankProviders() — 6 mock providers covering all 17 scoring paths

---

## PHASE 2: DESIGN SYSTEM (PROMPT 2)
**Target**: Complete UI component library (shared/ui + native/web variants)
**Status**: 10% complete — web Input, OTPInput, Button exist

### Prompt 2 Checklist

**Design Tokens & Theming:**
- [ ] `packages/shared/ui/tokens.ts` — Color constants (navy, teal, blue, red, amber, green + semantic mappings)
- [ ] `packages/shared/ui/useColorScheme.ts` — Dark mode hook

**Core Components (Native + Web):**
- [x] Button (primary, secondary, danger, ghost, emergency) — web exists
- [ ] Button.native.tsx — React Native version
- [ ] Card (white bg, shadow, border-radius, padding variants)
- [ ] Card.native.tsx
- [ ] Input — web exists, need native
- [ ] OTPInput — web exists, need native
- [ ] Modal (bottom sheet with react-native-reanimated)
- [ ] Modal.native.tsx + Modal.web.tsx
- [ ] Toast (imperative API)
- [ ] Skeleton (shimmer animation)

**Domain Components:**
- [ ] ProviderCard (name, area, languages, OpenStatusBadge, fee, distance, VerifiedBadge, staleness label)
- [ ] ProviderCard.native.tsx + ProviderCard.web.tsx
- [ ] OfflineProviderCard (same + cache timestamp + amber border)
- [ ] Tag/Chip (colored pill)
- [ ] LanguagePill (Tag variant, color-coded per language)
- [ ] Badge ('Travel Health Bridge Verified' + checkmark + date)
- [ ] OpenStatusBadge (green 'open' | amber 'opening_soon' | red 'closed' | grey 'unconfirmed')
- [ ] VerifiedBadge (checkmark + "Travel Health Bridge Verified" + date)
- [ ] HelplineCTA (CRITICAL: plain text number visible without tapping, WhatsApp button, accessibility label)
- [ ] FailureBottomSheet (reason, primaryProviderName, onTryAlternative, onOpenHelpline, onSearchAll)
- [ ] ConsentMessageModal (contactName, contactPhone, userCity, providerName, providerAddress, exact message preview)
- [ ] QuickCaseModal (admin web only — Severity preset buttons, Category chips, notes, auto-generates case_id)
- [ ] DailySummaryCard (admin web only — 4 metric tiles with color coding)

---

## PHASE 3: AUTH & ONBOARDING (PROMPT 3)
**Target**: Authentication flow + guest mode + onboarding
**Depends**: PHASE 2 (UI components)

### Prompt 3 Checklist

- [ ] Zustand `authStore.ts` — Complete authState (hasSeenOnboarding, isGuest, session, lockUntil)
- [ ] Phone auth flow — Country picker, phone validation, OTP entry, 15-min lockout on 3 failures
- [ ] Guest mode toggle — isGuest flag, guest permissions (triage/emergency/search OK, vault/save NOT OK)
- [ ] Onboarding 3-slide screen — Slide 1: sick in city, Slide 2: verified doctors, Slide 3: free 24/7
- [ ] First-launch consent modal — Cannot bypass (Amendment 5 exact message)
- [ ] Session persistence — SecureStore on native, localStorage on web
- [ ] useAuthStore hook — Complete auth logic
- [ ] Auth routes — (auth)/phone, (auth)/otp, (auth)/onboarding
- [ ] Protected route middleware — Check session, redirect to auth if needed

---

## PHASE 4: TRIAGE FLOW (PROMPT 4)
**Target**: 5-step triage + result + offline support
**Depends**: PHASE 3 (auth), PHASE 2 (UI)

### Prompt 4 Checklist

- [ ] Zustand `triageStore.ts` — triageState (step, urgency, city, languages, symptom, budget, offline flag)
- [ ] Offline detection — NetInfo hook to detect connectivity
- [ ] Step 1: Urgency — Emergency (red), Urgent (amber), Can wait (green) buttons
- [ ] Step 2: City — 6 chips, auto-detect via expo-location, fallback manual picker
- [ ] Step 3: Language — Multi-select pills, at least one required
- [ ] Step 4: Symptom — 3x3 grid with emoji + text, category grouping
- [ ] Step 5: Budget — 4 preset chips + optional WhatsApp number input
- [ ] Result screen — rankProviders() called, renders primary + secondary cards, showHelplineCTA if needed
- [ ] Failure timer — 2 min after "Call Now" tapped → FailureBottomSheet modal
- [ ] User-alone flow — ConsentMessageModal when user doesn't have someone to notify
- [ ] City not covered screen — Shows NON_COVERED_CITY_CHECKLIST with red-flag symptoms
- [ ] WatermelonDB integration — Offline cache lookup when no connectivity
- [ ] Triage session logging — TriageSession record created + linked to user (or guest token)

---

## PHASE 5: EMERGENCY SCREEN (PROMPT 5)
**Target**: Emergency route, never requires auth/internet
**Depends**: PHASE 2 (UI)

### Prompt 5 Checklist

- [ ] Route: `/(tabs)/emergency` — Always accessible, no auth check
- [ ] City detection — GPS (expo-location) preferred, manual fallback selector
- [ ] Hardcoded emergency contacts — 6 cities, plaintext phone numbers visible on screen
- [ ] SOS button — Triggers ConsentMessageModal, location share, event logged
- [ ] Layout — Large tap targets, high contrast text, +72px min height per spec
- [ ] Offline support — Hardcoded cities work without network
- [ ] Emergency events — sos_triggered, emergency_contact_notified events to PostHog

---

## PHASE 6: PROVIDER PROFILE & SEARCH (PROMPT 6)
**Target**: Provider detail view, search with filters, save functionality
**Depends**: PHASE 4 (triage), PHASE 2 (UI)

### Prompt 6 Checklist

- [ ] Provider profile screen `/(providers)/[id]` — VerifiedBadge, languages, OPD hours, fee ranges, doctors, about
- [ ] Get Directions button — Opens Apple Maps (iOS) or Google Maps (Android) with provider address
- [ ] Call Now button — Initiates phone call to provider
- [ ] Save button — Zustand savedProvidersStore, persisted to expo-secure-store
- [ ] Report Overcharge button — Navigation to overcharge form
- [ ] Search screen `/(providers)/search` — City filter, language filter, open_now toggle
- [ ] Saved providers list `/(visits)/saved` — Shows all saved providers per user
- [ ] Overcharge report form — Quoted min/max pre-filled from provider, actual_amount, description, receipt photo upload
- [ ] Location/maps integration — expo-location for user GPS, react-native-maps for display (consumer native only)

---

## PHASE 7: MEDICAL VAULT (PROMPT 7)
**Target**: Encrypted personal health data storage + sharing
**Depends**: PHASE 3 (auth), PHASE 2 (UI)

### Prompt 7 Checklist

- [ ] Auth requirement — Cannot access vault as guest, shows "Login to access vault" modal
- [ ] Zustand `vaultStore.ts` — VaultEntry state, persistence via Supabase + expo-secure-store
- [ ] 5 collapsible card sections:
  - [ ] Blood Group (8 types + Unknown)
  - [ ] Allergies (max 20, tags)
  - [ ] Medications (max 10, each with name/dosage/frequency)
  - [ ] Emergency Contacts (max 2, name/relationship/phone)
  - [ ] Insurance (2 fields: insurer_name, insurer_helpline) — Layer 3 deferred
- [ ] Edit functionality — Each section has edit mode with validation
- [ ] Share with Doctor — Plain-text export via Share API (NOT sent to servers)
- [ ] Encryption — expo-secure-store on native, Supabase Vault on web
- [ ] Delete account flow:
  - [ ] Immediate vault deletion
  - [ ] TriageSession records anonymized (user_id nulled)
  - [ ] Feedback records anonymized (user_id nulled, personal fields cleared)
  - [ ] Overcharge reports anonymized (user_id nulled, provider_id nulled)
  - [ ] Per Improvement 3 spec

---

## PHASE 8: FEEDBACK & DISPLACEMENT (PROMPT 8)
**Target**: Post-visit feedback flow + true displacement tracking
**Depends**: PHASE 4 (triage), PHASE 2 (UI)

### Prompt 8 Checklist

**Amendment 1 — Exact Flow:**
- [ ] Step 0: "How did you first learn about [provider_name]?" — Prior source selector (MANDATORY, asked FIRST before all others)
  - Hotel/guesthouse reception
  - Google Maps or internet search
  - A friend or local person
  - My insurance helpline
  - No — Travel Health Bridge was my first step
- [ ] Step 1: "Did you get medical help?" → boolean (visited)
- [ ] Step 1b: "Did you visit [Provider Name]?" → boolean | null (visited_recommended_provider) — TRUE DISPLACEMENT FIELD
- [ ] Step 2 (conditional on 1b=true): "Was the fee within the range shown?" → CostAccurate (yes|no|not_sure)
- [ ] Step 3 (conditional on 1b=true): "Rate your experience 1-5 stars" → number (star_rating)
- [ ] Step 4 (conditional on 1b=true): "Doctor spoke your language?" → LanguageComfort (yes|partial|no)
- [ ] Step 5: "Would you use Travel Health Bridge again?" → ReuseIntent (yes|no|maybe)
- [ ] Step 6: "Any feedback?" → Optional 200-char notes

**Notification Trigger:**
- [ ] 4-6 hours after triage completion
- [ ] Respects quiet hours (10pm-7am IST)
- [ ] Only sent if visited=true
- [ ] Uses push notifications (expo-notifications)

**True Displacement Tracking:**
- [ ] Formula: COUNT(prior_recommendation_source != 'No — Travel Health Bridge was my first step' AND visited_recommended_provider=true) / COUNT(prior_recommendation_source != 'No — Travel Health Bridge was my first step')
- [ ] Minimum threshold: only count when denominator ≥ 1
- [ ] Displayed on admin dashboard (Improvement 2)

**Notification Settings:**
- [ ] Post-visit feedback notifications toggle
- [ ] Announcements toggle
- [ ] Quiet hours (10pm-7am IST configurable)
- [ ] Push token management

---

## PHASE 9: PROVIDER PWA (PROMPT 9)
**Target**: Provider availability management + referral tracking
**Platform**: Web only (Expo web export)
**Scope**: Layer 2B (full provider feature set)

### Prompt 9 Checklist

- [ ] Authentication — Email OTA (no phone required)
- [ ] Route: `/(dashboard)/availability` — Toggle button, <1 second Supabase update, updates last_activity_at
- [ ] Dashboard stats — Today's stats, recent 5 referrals, conversion metrics
- [ ] Profile edit — OPD hours (per day), phone, fee ranges (OPD + specialist), doctors list, about
- [ ] Referrals tab — List all referrals, filter by Today/Week/Month
- [ ] Feedback tab — Aggregate stats card, individual review cards with flag button
- [ ] Stale banner — Alert if last_activity_at > 14 days (yellow amber)
- [ ] PWA config:
  - [ ] app.json — PWA manifest settings
  - [ ] manifest.json — Icons, theme color, display mode
  - [ ] service-worker.ts — Offline support, cache strategy
- [ ] Deployment target — providers.travelhealthbridge.com

---

## PHASE 10: ADMIN CONSOLE (PROMPT 10)
**Target**: Multi-page admin dashboard for operations
**Platform**: Next.js 14
**Scope**: Layer 2A (case management, provider management, analytics)

### Prompt 10 Checklist

**Auth & Layout:**
- [ ] Authentication middleware — Session check + role='admin'
- [ ] DailySummaryCard — Visible on all pages, auto-refresh every 5 min (4 metric tiles: displacement, reuse, no-answer, city-not-covered)

**Page 1: Overview**
- [ ] Displacement rate — True formula from PROMPT 8
- [ ] Reuse intent — Aggregate of all feedback reuse_intent field (yes/no/maybe %)
- [ ] Provider no-answer events — Count from last 7 days
- [ ] City not-covered checklist views — Count from last 7 days
- [ ] Trend charts

**Page 2: Providers**
- [ ] Table: name, city, badge_status, badge_expiry, staleness_tier, strike_count, last_score
- [ ] Filters: city, badge_status, staleness, strike_count
- [ ] Actions: Award badge, Add strike, Add ops note
- [ ] Detail view: Full provider profile, feedback aggregate, referral timeline
- [ ] Mass actions: Badge expiry bulk update

**Page 3: Overcharge Reports**
- [ ] Table: all OverchargeReport records
- [ ] Status editor: Mark resolved, add resolution notes
- [ ] Strike trigger: Auto-flag provider for review when 3+ confirmed overcharges
- [ ] Export: CSV download

**Page 4: Review Intelligence**
- [ ] INTERNAL ONLY label (visible only in admin)
- [ ] List of flagged feedback records
- [ ] Flag button to mark suspicious feedback
- [ ] NO approve/publish button (review only)

**Page 5: Sessions & Cases**
- [ ] TriageSession table — Filter by city, urgency, date range
- [ ] 48h no-feedback highlight — Show sessions without feedback after 48h
- [ ] WhatsApp case log — All WhatsappCase records
- [ ] QuickCaseModal floating button — Opens to log new case immediately (severity presets, category chips, notes, auto-generates case_id)
- [ ] Case detail/edit page — Full case record view, status editor

**Page 6: Advisories**
- [ ] Create/archive advisories — Text + category
- [ ] Notification trigger — Sends to all users in specified city via push notification
- [ ] View sent advisories — History + delivery stats

---

## PHASE 11: ANALYTICS & APP STORE (PROMPT 11)
**Target**: PostHog instrumentation, store assets, privacy configuration
**Scope**: All apps (consumer, provider PWA, admin)

### Prompt 11 Checklist

**PostHog Integration:**
- [x] `packages/shared/api/analytics.ts` — Setup (stub)
- [ ] track() function — track(eventName, properties) with app_version + platform
- [ ] 28 events instrumented:
  1. `app_opened` — Native/web app launch
  2. `onboarding_completed` — After 3-slide onboarding
  3. `auth_completed` — Phone auth + OTP success
  4. `triage_started` — User enters step 1
  5. `triage_step_completed` — Each step finish
  6. `triage_abandoned` — User exits without finishing
  7. `triage_offline_hit` — Offline mode activated during triage
  8. `triage_result_viewed` — Result screen shown
  9. `call_now_tapped` — Call Now button pressed
  10. `directions_tapped` — Get Directions button pressed
  11. `provider_no_answer_reported` — User reports no answer from provider
  12. `helpline_cta_tapped` — User taps HelplineCTA
  13. `failure_bottom_sheet_action` — User takes action on failure modal (try_alternative, open_helpline, search_all)
  14. `emergency_screen_opened` — Emergency tab accessed
  15. `sos_triggered` — SOS button pressed
  16. `emergency_contact_notified` — Emergency contact notification sent
  17. `non_covered_city_hit` — User enters city not in CITIES list
  18. `provider_profile_viewed` — Provider detail screen opened
  19. `provider_saved` — User saves provider
  20. `overcharge_report_submitted` — Overcharge form completed
  21. `feedback_submitted` — Feedback 8-step form completed
  22. `vault_opened` — User opens vault
  23. `vault_section_saved` — User saves vault section (blood_group, allergies, etc.)
  24. `vault_share_tapped` — User taps Share with Doctor
  25. `guest_login_prompt_shown` — Guest user shown login prompt for vault
  26. `provider_availability_updated` — Provider toggles availability
  27. `search_filter_applied` — User applies search filters
  28. `stale_provider_label_shown` — UI displays "Provider info not updated for X days"

**App Store Assets:**
- [ ] Icon (1024x1024 PNG)
- [ ] Splash screen (scaled for all resolutions)
- [ ] 6 screenshots (Portrait, representative of triage/result/vault/profile flows)
- [ ] App descriptions (English + Hindi)
  - Short: "Find verified doctors in 6 cities, 24/7, free"
  - Long: Full 2-3 paragraph description highlighting features
- [ ] Keywords: doctor, telemedicine, health, travel, emergency, verified, free, 24/7
- [ ] Data safety page — "What gets deleted" vs "What gets anonymised" (exact copy from Improvement 3)

**App Configuration:**
- [ ] app.json permissions:
  - iOS: NSLocationWhenInUseUsageDescription, NSContactsUsageDescription
  - Android: ACCESS_FINE_LOCATION, READ_CONTACTS, CAMERA (for receipt photo)
- [ ] Google Services files (Firebase config for iOS + Android)
- [ ] Privacy policy URL — https://travelhealthbridge.com/privacy
- [ ] Terms of service URL — https://travelhealthbridge.com/terms
- [ ] Support email — support@travelhealthbridge.com

**EAS Build Configuration:**
- [ ] eas.json profiles: development, preview, production
- [ ] Build triggers: auto-build on git push to main
- [ ] OTA update configuration — Expo Updates for 60-second deployment

---

## PHASE 12: PRODUCTION DEPLOYMENT (PROMPT 12)
**Target**: GitHub + Vercel + Supabase production setup
**Scope**: Infrastructure + deployment pipeline

### Prompt 12 Checklist

**GitHub Setup:**
- [ ] Repository created (travel-health-bridge-monorepo)
- [ ] Branches: main (production), develop (staging), feature/* (development)
- [ ] GitHub Actions workflows:
  - [ ] Consumer app: EAS build trigger on push to main
  - [ ] Provider PWA: Vercel auto-deploy on push to main
  - [ ] Admin console: Vercel auto-deploy on push to main
- [ ] Branch protection: main requires PR review + passing tests

**Vercel Deployments:**
- [ ] Provider PWA project:
  - [ ] Root dir: apps/provider
  - [ ] Build command: yarn build:provider
  - [ ] Environment variables: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
  - [ ] Domain: providers.travelhealthbridge.com
- [ ] Admin console project:
  - [ ] Root dir: apps/admin
  - [ ] Build command: yarn build:admin
  - [ ] Environment variables: (same + SUPABASE_SERVICE_ROLE_KEY for admin-only queries)
  - [ ] Domain: admin.travelhealthbridge.com

**Supabase Production:**
- [ ] PostgreSQL database (managed)
- [ ] Email templates (OTP, feedback reminder, advisory notification)
- [ ] Edge Functions (heavy computation offload)
- [ ] Backups (daily, 30-day retention)
- [ ] Real-time subscriptions enabled
- [ ] Row-level security (RLS) policies for all tables
- [ ] Indexes on frequently queried columns

**Verification Checklist:**
- [ ] Consumer app installs from Play Store + App Store
- [ ] Provider PWA loads on providers.travelhealthbridge.com, availability toggle works
- [ ] Admin console loads on admin.travelhealthbridge.com, overview page shows real data
- [ ] OTA update deploys within 60 seconds
- [ ] All 28 analytics events fire correctly
- [ ] Vault deletion anonymizes data as specified (Improvement 3)
- [ ] Feedback notifications respect quiet hours (10pm-7am IST)

**Day-to-Day Operations:**
- [ ] Deploy consumer OTA updates: `eas update --channel production`
- [ ] Deploy provider PWA: Merge PR to main → auto-deploy
- [ ] Deploy admin console: Merge PR to main → auto-deploy
- [ ] Monitor PostHog analytics dashboard
- [ ] Daily admin review: Overview page displacement + reuse rate
- [ ] Weekly provider health check: Stale providers, strike patterns
- [ ] Monthly data export: Feedback, displacement, user retention

---

## Implementation Status Summary

| Phase | Prompt | Status | Priority | Est. Lines |
|-------|--------|--------|----------|-----------|
| 1 | 1 | 80% | CRITICAL | 2,000 |
| 2 | 2 | 10% | CRITICAL | 3,000 |
| 3 | 3 | 5% | HIGH | 1,500 |
| 4 | 4 | 5% | HIGH | 2,500 |
| 5 | 5 | 0% | HIGH | 800 |
| 6 | 6 | 0% | HIGH | 2,000 |
| 7 | 7 | 0% | MEDIUM | 1,500 |
| 8 | 8 | 0% | MEDIUM | 2,000 |
| 9 | 9 | 0% | MEDIUM | 2,500 |
| 10 | 10 | 0% | MEDIUM | 3,500 |
| 11 | 11 | 10% | MEDIUM | 1,500 |
| 12 | 12 | 0% | LOW | 500 |
| | **TOTAL** | **~12%** | | **~23,700** |

---

## Critical Dependencies

```
PROMPT 1 (Foundation)
    ↓
PROMPT 2 (UI Components)
    ├─→ PROMPT 3 (Auth)
    │   ├─→ PROMPT 4 (Triage)
    │   │   ├─→ PROMPT 6 (Provider profile)
    │   │   ├─→ PROMPT 8 (Feedback)
    │   │   └─→ PROMPT 5 (Emergency)
    │   └─→ PROMPT 7 (Vault)
    ├─→ PROMPT 9 (Provider PWA)
    └─→ PROMPT 10 (Admin) [depends on 4, 8, 9]
        ↓
PROMPT 11 (Analytics) [can start after 3]
        ↓
PROMPT 12 (Deployment) [final]
```

---

## Next Immediate Action

**Start PROMPT 1 gap-filling:**
1. Complete `displacement.ts` with true formula
2. Verify `distance.ts`, `openStatus.ts`, `formatFee.ts`, `staleness.ts` 
3. Complete Supabase React Query hooks
4. Create `.env.local.template`
5. Add rankProviders() unit tests (6 mock providers)
6. Then proceed to PROMPT 2 (UI components)

**Estimated time to PROMPT 2 completion**: 4-6 hours of focused work
