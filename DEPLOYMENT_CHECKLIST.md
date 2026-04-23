# Travel Health Bridge - Deployment & Launch Checklist

## Pre-Launch Phase (Weeks 1-2)

### 1. Infrastructure Setup (Day 1-2)
- [ ] **Supabase Production Environment**
  - [ ] Create production Supabase project
  - [ ] Configure database backups (daily, 30-day retention)
  - [ ] Set up read replicas for high-traffic queries
  - [ ] Enable Point-in-Time Recovery (PITR)
  - [ ] Configure Row-Level Security policies for all tables
  - [ ] Test authentication flows (SMS OTP, Email OTP)
  - [ ] Configure rate limiting on RLS policies (SMS: 3 per 15min, Email: 5 per 15min)

- [ ] **PostHog Analytics**
  - [ ] Create production project
  - [ ] Configure data retention (default: 90 days)
  - [ ] Set up feature flags for gradual rollout
  - [ ] Create team dashboards for daily metrics
  - [ ] Configure alerts for anomalies

- [ ] **GitHub Repository**
  - [ ] Create private repository (or use existing)
  - [ ] Configure branch protection on main (require PR reviews)
  - [ ] Set up automatic deploys via GitHub Actions
  - [ ] Configure secrets management

### 2. App Store Configuration (Day 2-3)
- [ ] **Apple App Store**
  - [ ] Create Apple Developer account
  - [ ] Create app bundle identifier (com.travelhealthbridge.consumer)
  - [ ] Create app signing certificates and provisioning profiles
  - [ ] Prepare privacy policy (GDPR compliant, mention: OTP, location, vault encryption)
  - [ ] Create 5x screenshot assets per spec (1170×2532 pixels)
  - [ ] Write compelling app description
  - [ ] Configure app pricing (free tier only)
  - [ ] Age rating: 4+
  - [ ] Keywords: "triage", "doctors", "emergency", "medical", "travel"

- [ ] **Google Play Store**
  - [ ] Create Google Play Developer account
  - [ ] Create app package ID (com.travelhealthbridge.consumer)
  - [ ] Generate signed APK/AAB via EAS
  - [ ] Prepare identical assets (1080×1920 minimum)
  - [ ] Privacy policy linking
  - [ ] Content rating questionnaire
  - [ ] Configuration: Target API 34+, min API 21

### 3. Build & Release (Day 3-4)
- [ ] **EAS Build Configuration**
  - [ ] Test build: `eas build --platform android --profile preview`
  - [ ] Test build: `eas build --platform ios --profile preview`
  - [ ] Review build logs for warnings
  - [ ] Test APK/IPA on physical devices
  - [ ] Verify offline mode (WatermelonDB, 50 providers cached)

- [ ] **Native Build Requirements**
  - [ ] iOS: Set deployment target to 15.0+
  - [ ] Android: Target API 34, min API 21
  - [ ] iOS signing: Code signing identity + provisioning profile
  - [ ] Android signing: Keystore file (secure & backed up)

### 4. QA Testing (Day 4-5)

#### Consumer App (3 devices: iOS, Android, web)
- [ ] **Authentication Flow**
  - [ ] Phone +91 validation working
  - [ ] OTP sent within 30 seconds
  - [ ] OTP verification succeeds on correct code
  - [ ] 3-failure lockout enforced
  - [ ] Guest mode bypass accessible
  - [ ] Session persisted to SecureStore

- [ ] **Onboarding**
  - [ ] 3-slide carousel displays correctly
  - [ ] Skip link only shows before last slide
  - [ ] "Get Started" navigates to home
  - [ ] Onboarding not re-shown after completion

- [ ] **Triage Flow (End-to-End)**
  - [ ] Step 1 (Urgency): 3 buttons functional
  - [ ] Step 2 (City): 6 cities + GPS auto-detect
  - [ ] Step 3 (Language): Multi-select min 1 required
  - [ ] Step 4 (Symptom): 24 symptoms in 8 clusters
  - [ ] Step 5 (Budget): 4 preset + optional WhatsApp
  - [ ] Results show top 2 providers ranked correctly
  - [ ] Provider cards show all fields (fee, hours, languages, doctors)

- [ ] **Provider Profile**
  - [ ] All fields load from Supabase
  - [ ] Call Now button triggers phone dialer
  - [ ] Directions button opens maps
  - [ ] Save provider to local list
  - [ ] Report overcharge flow: amount validation → review → submit

- [ ] **Emergency Screen**
  - [ ] GPS auto-detects city
  - [ ] All 6 hospitals display with plaintext numbers
  - [ ] SOS button: min 72px, full-width, red
  - [ ] ConsentMessageModal shows exact template
  - [ ] Location sharing prompt works
  - [ ] emergency_contact_notified_at logged

- [ ] **Vault**
  - [ ] All 5 sections collapsible and editable
  - [ ] Data persists to SecureStore (native) / localStorage (web)
  - [ ] Max 10 medications enforced
  - [ ] Max 2 emergency contacts enforced
  - [ ] Insurance helpline field optional

- [ ] **Feedback Flow (Amendment 1)**
  - [ ] Step 1 asked FIRST: prior_recommendation_source
  - [ ] Step 2: visited boolean
  - [ ] Step 3: visited_recommended_provider (true displacement field)
  - [ ] Step 4: cost_accurate (only if Step 3 = true)
  - [ ] Step 5: star_rating (only if Step 3 = true)
  - [ ] Step 6: language_comfort (only if Step 3 = true)
  - [ ] Step 7: reuse_intent
  - [ ] Step 8: notes (200 char max)

- [ ] **Offline Mode**
  - [ ] WatermelonDB has 50+ providers cached
  - [ ] Triage works with cached data
  - [ ] Offline provider cards show amber border + timestamp
  - [ ] Data syncs when connection restored

#### Provider App PWA
- [ ] **Authentication**
  - [ ] Email OTP verification works
  - [ ] Session persists across page reloads

- [ ] **Availability Toggle**
  - [ ] Toggle updates Supabase in <1 second
  - [ ] last_activity_at updates immediately
  - [ ] Toggle state reflects in UI

- [ ] **Referrals Tab**
  - [ ] Loads referral data correctly
  - [ ] Shows triage details + patient contact

- [ ] **Feedback Tab**
  - [ ] Displays all feedback submitted
  - [ ] Shows star ratings, language comfort, cost accuracy

- [ ] **Profile Tab**
  - [ ] Edit fields: name, bio, opd_hours, fee range, languages
  - [ ] Save updates to Supabase

#### Admin Console
- [ ] **Dashboard**
  - [ ] DailySummaryCard refreshes every 5 min
  - [ ] Shows 4 metrics: displacement, reuse_intent, no_answer_events, city_gaps
  - [ ] Metrics calculate correctly from feedback data

- [ ] **Providers Page**
  - [ ] Search by name works
  - [ ] Filter by status (active/suspended)
  - [ ] Suspension action works
  - [ ] Pagination functional

- [ ] **Overcharges Page**
  - [ ] List all reports with status
  - [ ] Approve action: suspends provider 7 days
  - [ ] Reject action: marks as rejected
  - [ ] 24-hour review SLA visible

- [ ] **Sessions Page**
  - [ ] Search by city, urgency, language
  - [ ] Date range filtering
  - [ ] Shows joined feedback data
  - [ ] Pagination

- [ ] **Reviews Page**
  - [ ] Displays all feedback
  - [ ] Flags low ratings (< 3 stars)
  - [ ] Shows language complaints

### 5. Security & Compliance (Day 5-6)
- [ ] **Data Privacy**
  - [ ] Privacy policy available in-app and web
  - [ ] GDPR consent for location tracking (iOS/Android)
  - [ ] Clarify: OTP not stored, vault encrypted, sessions anonymous after 30 days

- [ ] **Authentication Security**
  - [ ] SMS OTP: 4-digit length, 15-min validity
  - [ ] Email OTP: 6-digit length, 10-min validity
  - [ ] Rate limiting enforced (3 per 15min SMS, 5 per 15min email)
  - [ ] Session tokens: 30-day expiry
  - [ ] Logout: clears SecureStore + local session

- [ ] **API Security**
  - [ ] All endpoints require Authorization header
  - [ ] RLS policies verify user_id matches
  - [ ] Public tables (providers) have read-only access
  - [ ] CORS configured to allow only frontend domains

- [ ] **Infrastructure**
  - [ ] SSL/TLS on all HTTPS endpoints
  - [ ] HSTS headers configured
  - [ ] Environment variables never committed to git
  - [ ] Secrets stored in GitHub/Vercel/EAS

### 6. Performance Testing (Day 6-7)
- [ ] **App Startup**
  - [ ] Cold start: < 3 seconds
  - [ ] Hot start: < 1 second
  - [ ] Offline load: instant (WatermelonDB cached)

- [ ] **Network Performance**
  - [ ] Triage API call: < 2 seconds
  - [ ] Provider ranking: < 1 second
  - [ ] Feedback submission: < 3 seconds

- [ ] **Database**
  - [ ] Provider table queries: < 500ms for 1000 providers
  - [ ] Feedback aggregation: < 2s for daily summary
  - [ ] Search (like queries): < 1.5 seconds

- [ ] **Analytics**
  - [ ] PostHog event batching: max 100ms latency
  - [ ] Network error handling: events queued locally

---

## Launch Phase (Week 3)

### 7. Deployment to Production (Day 1)

#### Consumer App
```bash
# Build production APK/IPA
eas build --platform all --profile production

# Submit to app stores
# iOS: Transporter app or App Store Connect
# Android: Play Console upload
```

#### Provider App & Admin Console
```bash
# Deploy to Vercel
vercel deploy --prod

# Environment variables configured in Vercel dashboard
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_POSTHOG_API_KEY
```

#### Supabase
```bash
# Run migrations
psql $SUPABASE_CONNECTION_STRING < migrations/001_init.sql

# Enable RLS on all tables
# Verify pg_stat_statements enabled for query monitoring
```

- [ ] Verify all endpoints respond with 200
- [ ] Check database connections: `SELECT version();`
- [ ] Test SMS OTP to real number
- [ ] Monitor error rates (should be 0% for first hour)

### 8. Post-Launch Monitoring (Day 1-7)

#### Real-Time Dashboards
- [ ] PostHog dashboard for event funnel (app_opened → triage_started → triage_step_completed)
- [ ] Supabase dashboard: query latency, database size growth
- [ ] Vercel: function durations, error rate monitoring
- [ ] GitHub Actions: build success rate

#### Critical Alerts (Configure in each service)
- [ ] App Store review status (email notification)
- [ ] Supabase: Query latency > 1000ms
- [ ] Vercel: Function duration > 5 seconds
- [ ] PostHog: Event processing latency > 500ms
- [ ] Error rate > 1% in any service

#### Metrics to Track (First 7 Days)
- [ ] Total users (app_opened events)
- [ ] Onboarding completion rate
- [ ] Triage completion rate: min 40% (target 60%)
- [ ] Emergency screen views: < 5% (good sign)
- [ ] Feedback submission rate: min 20%
- [ ] Avg app session duration: target 3-5 min
- [ ] Crash rate: target < 0.5%

---

## Maintenance & Scaling (Week 4+)

### 9. Ongoing Operations

#### Weekly
- [ ] Review PostHog dashboards for anomalies
- [ ] Check app store reviews (respond to feedback)
- [ ] Monitor database query performance
- [ ] Verify scheduled backups completed

#### Monthly
- [ ] Security audit (dependencies: `npm audit`)
- [ ] Database optimization (analyze query plans)
- [ ] Cost analysis (Supabase, Vercel, EAS)
- [ ] Performance profiling (identify bottlenecks)
- [ ] Review feedback data for product improvements

#### Quarterly
- [ ] Major version updates (React Native, Next.js)
- [ ] Scaling assessment (provider count growth)
- [ ] Feature roadmap review
- [ ] Security penetration testing

### 10. Scaling Considerations

**Database**
- When: Users > 10k or triage_sessions > 100k/month
- Action: Add read replicas, migrate to managed PostgreSQL

**Storage**
- When: Vault data > 100GB
- Action: Migrate media to Supabase Storage or Cloudinary

**Provider App Performance**
- When: Referrals > 1000/day
- Action: Implement caching (ISR), optimize queries

**Admin Console**
- When: Sessions > 1M
- Action: Archive old sessions, implement materialized views

---

## App Store Submission Checklist

### All Platforms
- [ ] App name: "Travel Health Bridge"
- [ ] Version: 1.0.0
- [ ] Build number: 1001
- [ ] Privacy policy accepted by reviewer
- [ ] No hard-coded API keys in binary
- [ ] Required permissions justified in copy
- [ ] Crash-free rate > 99%

### iOS Specific
- [ ] App sandbox enabled
- [ ] Minimum iOS version: 15.0
- [ ] No private APIs used
- [ ] TestFlight tested by 100+ users (if possible)
- [ ] Screenshots in 1170×2532 resolution
- [ ] Marketing website linked in metadata

### Android Specific
- [ ] Min SDK: 21, Target SDK: 34
- [ ] 64-bit support included
- [ ] Google Play policies reviewed
- [ ] Screenshots in 1080×1920 resolution
- [ ] Content rating completed

---

## Post-Launch Improvements (Improvement 1-4)

### [Improvement 1] Offline Triage Suggestions (Week 4)
- [ ] Pre-cache top 50 providers in each city
- [ ] Implement local ranking algorithm (offline ranking without API)
- [ ] UI: "Showing cached results (no internet)"
- [ ] PostHog: Track offline triage sessions separately

### [Improvement 2] Multi-Language Support (Week 5)
- [ ] i18n setup: translations for Hindi, Tamil, Telugu (user's device language)
- [ ] Provider app: English + provider's listed languages
- [ ] Admin: English + Hindi
- [ ] Test: All critical flows in each language

### [Improvement 3] Vault Delete Account Flow (Week 6)
- [ ] New screen: "Delete Account" in Vault settings
- [ ] Confirmation: "All data will be anonymized"
- [ ] Action: Delete vault records, anonymize feedback (keep star_rating only)
- [ ] Completion: Success message + logout

### [Improvement 4] 2-Minute Timer for No-Answer (Week 6)
- [ ] Triage result screen: Show 2-min countdown timer
- [ ] API: Check provider availability at 2-min mark
- [ ] If no response: Trigger FailureBottomSheet
- [ ] User option: Try next provider or save provider for later

---

## Estimated Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Pre-Launch | 7 days | Infrastructure, builds, QA |
| Launch | 1 day | App store submissions |
| Post-Launch Monitoring | 7 days | Analytics review, bug fixes |
| Feature Completions | 14 days | Improvements 1-4 |
| **Total** | **~4 weeks** | Production-ready app |

---

## Success Criteria (30-Day Mark)

✅ **Metrics**
- [ ] 1,000+ app installs
- [ ] 500+ active users (DAU)
- [ ] 40%+ onboarding completion
- [ ] 60%+ triage completion rate
- [ ] 20%+ feedback submission rate
- [ ] < 0.5% crash rate
- [ ] < 1% error rate on all APIs

✅ **Stability**
- [ ] Zero downtime incidents
- [ ] All critical alerts cleared
- [ ] 99.9%+ service uptime

✅ **Quality**
- [ ] App Store rating: 4.0+ stars
- [ ] User feedback: "Easy to use, solved my problem"
- [ ] No security incidents
