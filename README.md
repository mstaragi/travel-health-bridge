# Travel Health Bridge

> Medical triage for travelers. Verified doctors in any city. Free 24/7.

A complete mobile and web application ecosystem for connecting travelers with verified medical providers in their current city, with offline-first architecture, real-time provider ranking, and comprehensive medical history management.

## 📋 Project Status

**Latest Release**: v1.0.0 (In Development)  
**Architecture**: Full-stack React Native + Next.js + Supabase  
**Last Updated**: January 2025

### Completion Status
- ✅ **PROMPT 1-3**: Foundation, UI components, authentication (100%)
- 🟡 **PROMPT 4-10**: Core features (80-90% scaffolded, needs integration polish)
- 🟡 **PROMPT 11**: Analytics (instrumentation complete, needs app integration)
- 🟡 **PROMPT 12**: Deployment (checklist complete, ready for submission)

---

## 🏗️ Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native (Expo 51) | iOS/Android consumer app |
| **Web** | Next.js 14 | Provider PWA + Admin console |
| **Backend** | Supabase (PostgreSQL) | Data, auth, real-time APIs |
| **Database** | WatermelonDB | Offline-first mobile caching |
| **State** | Zustand | Cross-app state management |
| **Data Fetch** | React Query | Server state + caching |
| **Analytics** | PostHog | Event tracking (28 events) |
| **Auth** | SMS OTP + Email OTP | Phone + provider authentication |
| **Deployment** | EAS + Vercel + Supabase | App stores + web hosting |

### Monorepo Structure

```
travel-health-bridge/
├── apps/
│   ├── consumer/              # React Native (Expo) iOS/Android app
│   │   └── c-app/
│   │       ├── (auth)/        # Phone + OTP + Onboarding
│   │       ├── (tabs)/        # Main app (home, emergency, vault)
│   │       ├── (triage)/      # 5-step medical intake
│   │       ├── (providers)/   # Provider profile + overcharge report
│   │       ├── (visits)/      # Visit history + feedback
│   │       └── store/         # Zustand stores
│   ├── provider/              # Next.js provider PWA
│   │   └── p-app/
│   │       ├── auth/          # Email OTP verification
│   │       ├── dashboard/     # Provider dashboard
│   │       └── api/           # Backend routes
│   └── admin/                 # Next.js admin console
│       └── app/
│           ├── (console)/     # Admin pages (6 dashboards)
│           └── api/           # Admin API routes
└── packages/
    └── shared/                # Shared types, utils, constants, UI
        ├── types/             # TypeScript interfaces
        ├── utils/             # Business logic (ranking, reliability)
        ├── constants/         # Cities, languages, symptoms
        ├── ui/                # Shared components (mobile + web)
        ├── hooks/             # Custom hooks (usePhoneAuth)
        └── api/               # Supabase client + query keys
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and yarn
- Xcode 15+ (iOS development)
- Android Studio (Android development)
- EAS CLI: `npm install -g eas-cli`
- Supabase account (free tier sufficient for development)

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/yourusername/travel-health-bridge.git
cd travel-health-bridge
yarn install

# 2. Configure environment
# .env.local for consumer app
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_POSTHOG_API_KEY=your-posthog-key

# 3. Run development servers

# Consumer app (iOS)
cd apps/consumer && npx expo run:ios

# Consumer app (Android)
cd apps/consumer && npx expo run:android

# Consumer app (Web)
cd apps/consumer && npx expo start --web

# Provider app (PWA)
cd apps/provider && npm run dev
# Open http://localhost:3000

# Admin console
cd apps/admin && npm run dev
# Open http://localhost:3001
```

### Database Setup

```bash
# 1. Create Supabase project
# 2. Run migrations
psql $SUPABASE_CONNECTION_STRING < packages/shared/api/migrations/init.sql

# 3. Enable RLS on all tables
# 4. Seed sample data (optional)
```

---

## 📱 Features

### Consumer App (React Native)

#### 1. **Authentication & Onboarding**
- SMS OTP verification (+91 phone numbers)
- 3-slide onboarding carousel
- Route protection with session persistence
- Guest mode for instant access

#### 2. **Medical Triage (5-Step)**
- **Step 1**: Emergency level (Green/Amber/Red)
- **Step 2**: Current city (6 cities + GPS auto-detect)
- **Step 3**: Languages (multi-select, min 1)
- **Step 4**: Symptoms (24 symptoms in 8 clusters)
- **Step 5**: Budget (4 presets + WhatsApp contact)
- **Results**: Top 2 providers ranked by 17 factors

#### 3. **Provider Ranking Algorithm**
17-factor scoring system:
- Emergency severity (+5 if Red, +2 if Amber)
- Reliability score (40% cost accuracy, 30% no-answer rate, 20% star rating, 10% language)
- Staleness tier (freshness of data)
- Language match
- Fee alignment
- OPD hours availability
- Doctor count
- Review sentiment
- Distance
- Displacement effect

#### 4. **Emergency SOS**
- 6 city-specific emergency hospitals
- Plaintext phone numbers (no tapping required to dial)
- Consent modal + location sharing
- Emergency contact notification flow

#### 5. **Medical Vault** (Encrypted)
- Blood group
- Allergies (array)
- Medications (max 10)
- Emergency contacts (max 2)
- Insurance details
- SecureStore encryption on native
- SessionStorage on web

#### 6. **Feedback (Amendment 1 Compliant)**
8-step flow:
1. Prior recommendation source (MANDATORY, asked FIRST)
2. Whether visited provider
3. **Visited recommended provider** (TRUE DISPLACEMENT FIELD)
4. Cost accuracy (only if #3 = true)
5. Star rating (only if #3 = true)
6. Language comfort (only if #3 = true)
7. Reuse intent
8. Additional notes

#### 7. **Offline-First Architecture**
- WatermelonDB syncs 50+ cached providers
- Works without internet
- Auto-syncs when connection restored
- Amber border indicates offline data

### Provider App (Next.js PWA)

#### Authentication
- Email OTP (6-digit code)
- Session persistence
- Email + provider ID login

#### Dashboard
- Availability toggle (< 1 second Supabase sync)
- last_activity_at immediate update
- Real-time referral notifications
- Referrals tab: All triage sessions sent to provider
- Feedback tab: Patient ratings + cost accuracy
- Profile tab: Edit name, bio, languages, fee range, OPD hours

### Admin Console (Next.js)

#### 1. **Dashboard**
- DailySummaryCard (4 metrics, 5-min refresh)
  - Displacement rate (% of users we diverted from Google/hotel)
  - Reuse intent rate (% planning to use again)
  - No-answer events count
  - City gaps (cities with < 2 providers)

#### 2. **Providers Management**
- Search by name
- Filter by status (active/suspended)
- View reliability score
- Suspend provider (7-day default)
- View overcharge reports + feedback

#### 3. **Overcharge Report Handling**
- 24-hour review SLA
- Approve: Suspends provider 7 days
- Reject: Marks report as invalid
- Admin notes
- Status: pending → approved/rejected

#### 4. **Sessions & Feedback Analytics**
- Search by city, urgency, language, date range
- View all triage sessions + joined feedback
- Export for analysis
- Identify patterns in feedback

#### 5. **Reviews Intelligence**
- All feedback displayed with star ratings
- Flag low ratings (< 3 stars)
- Language complaints identification
- Sentiment analysis triggers

#### 6. **Advisories & Alerts**
- System-level alerts
- Provider performance alerts
- City-level gaps

---

## 📊 Analytics (PostHog - 28 Events)

### Consumer App (17 Events)
```
1. app_opened - Session start
2. app_closed - Session end + duration
3. phone_number_entered - Auth start
4. otp_sent - OTP delivery
5. otp_verified - Auth success
6. onboarding_started - Onboarding initiated
7. onboarding_completed - Onboarding end
8. guest_mode_selected - Guest mode activation
9. triage_started - Triage funnel entry
10. triage_step_completed - Each step completion
11. triage_abandoned - Triage funnel exit
12. provider_ranking_displayed - Results shown
13. provider_no_answer_reported - No-answer issue
14. provider_call_initiated - User calls provider
15. emergency_screen_viewed - SOS access
16. emergency_contact_notified - SOS triggered
17. sos_triggered - Emergency activation
18. vault_opened - Vault access
19. vault_data_saved - Vault update
```

### Provider App (6 Events)
```
20. provider_login_attempted - Auth attempt
21. provider_email_otp_verified - Auth success
22. provider_availability_toggled - Availability changed
23. provider_profile_updated - Profile changes
24. provider_referral_viewed - Referral opened
25. provider_feedback_viewed - Feedback reviewed
```

### Feedback Events (5 Events)
```
26. feedback_started - Feedback flow initiated
27. feedback_step1_answered - Prior source answered
28. feedback_visited_toggle - Visited provider toggle
29. feedback_cost_accuracy_answered - Cost feedback
30. feedback_submitted - Feedback complete
```

### Admin Events (3 Events)
```
31. admin_case_reviewed - Case action taken
32. admin_provider_suspended - Provider suspended
33. admin_daily_summary_viewed - Dashboard viewed
```

---

## 🗄️ Database Schema

### Core Tables

#### `providers`
```sql
id, name, city_id, address, phone, email, 
fee_min, fee_max, opd_hours, languages[], doctor_count,
specialties[], rating, verified_at, 
reliability_score, staleness_tier, badge_status,
emergency, status, created_at, updated_at
```

#### `triage_sessions`
```sql
id, user_id, urgency, city_id, languages[], symptom,
budget_max, whatsapp_number, result[], 
call_now_tapped_at, feedback_submitted_at, created_at
```

#### `feedback`
```sql
id, session_id, user_id, provider_id,
prior_recommendation_source, visited, visited_recommended_provider,
cost_accurate, star_rating, language_comfort, reuse_intent,
notes, created_at
```

#### `overcharge_reports`
```sql
id, provider_id, user_id, amount_charged, 
overcharge_amount, notes, status, admin_notes,
created_at, updated_at
```

#### `vault`
```sql
id, user_id, blood_group, allergies, medications[],
emergency_contacts[], insurance_name, insurance_helpline,
encrypted, created_at, updated_at
```

---

## 🔒 Security

### Authentication
- SMS OTP: 4-digit, 15-min validity, 3-failure lockout
- Email OTP: 6-digit, 10-min validity, 5-attempt limit
- Session tokens: 30-day expiry, HTTP-only cookies
- Rate limiting: 3 SMS/15min, 5 Email/15min per phone/email

### Data Protection
- Row-Level Security (RLS) on all Supabase tables
- Vault data encrypted with expo-secure-store (native)
- HTTPS/TLS on all endpoints
- HSTS headers configured
- CORS limited to frontend domains only

### Privacy
- OTP not stored, only verification flag
- Sessions anonymized after 30 days
- Delete account: All vault deleted, feedback anonymized (star_rating kept)
- GDPR compliant privacy policy

---

## 📈 Performance Targets

| Metric | Target | How Measured |
|--------|--------|--------------|
| App startup | < 3 sec | Cold start time |
| Triage API call | < 2 sec | Network waterfall |
| Provider ranking | < 1 sec | In-app profiling |
| Feedback submit | < 3 sec | Network timing |
| Offline load | Instant | WatermelonDB query |
| Database query | < 500ms | PostgreSQL pg_stat_statements |
| PostHog latency | < 100ms | Event batch processing |
| App crash rate | < 0.5% | Sentry/Bugsnag |
| API error rate | < 1% | CloudWatch logs |

---

## 🚢 Deployment

### Consumer App (App Stores)
```bash
# Build production APK/IPA
eas build --platform all --profile production

# Submit to App Store (via Transporter)
# Submit to Google Play Console
```

### Provider App & Admin Console
```bash
# Deploy to Vercel
vercel deploy --prod

# Environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_POSTHOG_API_KEY
```

### Supabase
```bash
# Run migrations
psql $SUPABASE_CONNECTION_STRING < migrations/init.sql

# Enable monitoring
# Set up automated backups (daily, 30-day retention)
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed launch checklist.

---

## 📝 Key Implementation Details

### Amendment Compliance

✅ **Amendment 1: Feedback Field Order**
- `prior_recommendation_source` asked FIRST (mandatory)
- `visited_recommended_provider` is the TRUE displacement field
- Fields 4-6 only shown if `visited = true` AND `visited_recommended_provider = true`

✅ **Amendment 3: Emergency Level Scoring**
- Red (emergency): +5 points
- Amber (urgent): +2 points
- Green (non-urgent): 0 points
- Verified distinct in rankProviders() algorithm

✅ **Amendment 5: ConsentMessageModal Template**
- Shows exact message with city/provider/user contact placeholders
- Location share + optional WhatsApp share
- Triggers emergency_contact_notified_at logging

### Improvement Roadmap

1. **Offline Triage Suggestions** (Week 4)
   - Pre-cache top 50 providers per city
   - Local ranking without API
   - "Showing cached results" indicator

2. **Multi-Language Support** (Week 5)
   - i18n: Hindi, Tamil, Telugu
   - Provider app: English + provider languages
   - All critical flows in each language

3. **Vault Delete Account** (Week 6)
   - New screen: "Delete Account"
   - Anonymizes feedback (keeps star_rating only)
   - Deletes all personal vault data

4. **2-Minute No-Answer Timer** (Week 6)
   - Results screen countdown
   - Auto-check provider availability at 2-min
   - Trigger FailureBottomSheet if no response

---

## 🐛 Troubleshooting

### Common Issues

**Consumer App Won't Start**
```bash
# Clear cache and reinstall
yarn cache clean
rm -rf node_modules
yarn install
eas build --platform ios --profile preview
```

**Provider App Email OTP Not Sending**
```bash
# Check Supabase Auth configuration
# Verify email template in Email Settings
# Check spam folder for OTP code
# Test with eas-cli: eas secret list
```

**Admin Console Metrics Not Updating**
```bash
# Verify PostHog project API key
# Check RLS policies on feedback table
# Ensure triage_sessions have user_id set
# Query: SELECT COUNT(*) FROM feedback;
```

**Offline Mode Not Working**
```bash
# Verify WatermelonDB initialization
# Check provider cache is populated (50+ records)
# Clear device local storage: DevTools → Application
# Restart app in airplane mode
```

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/travel-health-bridge/issues)
- **Docs**: [Full Documentation](./docs/)
- **API Reference**: See `packages/shared/api/` for Supabase queries

---

## 📄 License

Proprietary. All rights reserved.

---

## 👥 Team

Built with precision for the Health4Travel initiative.

**Last Updated**: January 2025  
**Version**: 1.0.0-dev
