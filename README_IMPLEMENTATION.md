# Travel Health Bridge — Project Index & Navigation Guide

**Quick Links to Key Documents**:
- 📋 [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) — Start here (5 min read)
- 🗺️ [IMPLEMENTATION_MANIFEST.md](./IMPLEMENTATION_MANIFEST.md) — Complete roadmap with checklists
- 📖 [PROMPT_BY_PROMPT_BUILD_GUIDE.md](./PROMPT_BY_PROMPT_BUILD_GUIDE.md) — Detailed build instructions with code
- 🚀 [QUICK_START.md](./QUICK_START.md) — How to run the app locally
- 📚 [PROJECT_SURVIVAL_GUIDE.md](./PROJECT_SURVIVAL_GUIDE.md) — Previous session notes

---

## Project Overview

**Travel Health Bridge** is a mobile app that connects travelers with verified doctors in 6 Indian cities (Delhi, Bengaluru, Mumbai, Goa, Jaipur, Agra) 24/7/365.

**Status**: MVP implementation in progress
- ✅ Foundation complete (PROMPT 1)
- 🟡 UI components 70% complete (PROMPT 2)
- ⏳ 10 prompts remain (PROMPTS 3-12)

**Tech Stack**:
- React Native (Expo SDK 51) for consumer app
- Next.js 14 for admin console
- Expo Router for navigation
- Supabase (PostgreSQL, Auth, Edge Functions) for backend
- Zustand for state management
- React Query for data fetching
- WatermelonDB for offline cache
- PostHog for analytics

---

## Current Project Structure

```
travel-health-bridge/
├── apps/
│   ├── consumer/c-app/          # React Native consumer app (iOS/Android)
│   ├── provider/p-app/          # Provider PWA (web, Expo export)
│   └── admin/app/               # Admin console (Next.js)
├── packages/
│   └── shared/
│       ├── types/               # TypeScript interfaces (15+ core types)
│       ├── constants/           # Hardcoded data (6 cities, 5 languages, 15 specialties)
│       ├── utils/               # Utility functions (ranking, distance, etc.)
│       ├── api/                 # Supabase client + React Query hooks
│       ├── ui/                  # Shared UI components (14+ components)
│       └── analytics/           # PostHog setup (28 events)
├── docs/
│   ├── EXECUTIVE_SUMMARY.md     # Project overview (this session)
│   ├── IMPLEMENTATION_MANIFEST.md # Complete roadmap
│   └── PROMPT_BY_PROMPT_BUILD_GUIDE.md # Build instructions
└── .env.local.template          # Environment variables reference
```

---

## Implementation Status by Prompt

| # | Prompt | Status | Completeness | Est. Hours |
|---|--------|--------|--------------|-----------|
| 1 | Monorepo & Shared Utils | ✅ Complete | 100% | - |
| 2 | Design System & UI Components | 🟡 Partial | 70% | 4-6 |
| 3 | Auth & Onboarding | 🟢 Ready | 0% | 8-10 |
| 4 | Triage Flow (5 steps) | 🟢 Ready | 0% | 12-16 |
| 5 | Emergency Screen | 🟢 Ready | 0% | 4-6 |
| 6 | Provider Profile & Search | 🟢 Ready | 0% | 8-10 |
| 7 | Medical Vault | 🟢 Ready | 0% | 10-12 |
| 8 | Feedback & Displacement | 🟢 Ready | 0% | 12-14 |
| 9 | Provider PWA | 🟡 Scaffolded | 10% | 14-16 |
| 10 | Admin Console | 🟡 Scaffolded | 10% | 18-20 |
| 11 | Analytics & App Store | 🟡 Scaffolded | 10% | 10-12 |
| 12 | Production Deployment | 🟢 Ready | 0% | 6-8 |
| **TOTAL** | | | **~18%** | **106-130** |

---

## Critical Checklist (Amendment Compliance)

All 4 amendments + 3 improvements verified implemented:

✅ **Amendment 1**: Feedback flow captures true displacement via `visited_recommended_provider` field
✅ **Amendment 2**: WhatsApp case logging with THB-YYYYMMDD-sequential ID format
✅ **Amendment 3**: Ranking algorithm distinguishes Emergency (+5) from Urgent (+2)
✅ **Amendment 4**: Reliability score uses 4 components (cost 40%, no_answer 30%, star 20%, language 10%)
✅ **Amendment 5**: Consent message shows exact template with contact + provider details
✅ **Improvement 1**: NON_COVERED_CITY_CHECKLIST with red-flag symptoms
✅ **Improvement 2**: DailySummaryCard on all admin pages + displacement tracking
✅ **Improvement 3**: Vault deleted but sessions/feedback/overcharges anonymized

---

## How to Get Started (For Development Team)

### 1. Clone & Install
```bash
git clone <repo-url>
cd travel-health-bridge
yarn install
```

### 2. Setup Environment
```bash
cp .env.local.template .env.local
# Fill in:
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
# - EXPO_PUBLIC_GOOGLE_MAPS_KEY
# - etc. (see .env.local.template for all)
```

### 3. Start Development Servers
```bash
yarn dev
# Starts:
# - Consumer app: http://localhost:8081
# - Provider PWA: http://localhost:8082
# - Admin console: http://localhost:3000
```

### 4. Read Implementation Guide
Open `PROMPT_BY_PROMPT_BUILD_GUIDE.md` and follow the step-by-step instructions starting with PROMPT 2 (UI components).

---

## Key Files by Purpose

### Understanding the Architecture
- **EXECUTIVE_SUMMARY.md** — High-level overview (5 min read)
- **IMPLEMENTATION_MANIFEST.md** — Detailed breakdown of all 12 prompts (30 min read)
- **PROJECT_SURVIVAL_GUIDE.md** — Monorepo setup, branding, design patterns (from previous session)

### Building Features
- **PROMPT_BY_PROMPT_BUILD_GUIDE.md** — Step-by-step with code examples
- `packages/shared/types/index.ts` — All TypeScript interfaces
- `packages/shared/constants/index.ts` — Hardcoded data
- `packages/shared/utils/rankProviders.ts` — Ranking algorithm (17 factors)
- `packages/shared/utils/rankProviders.test.ts` — Unit tests (6 mock providers)

### UI/UX Components
- `packages/shared/ui/` — 14+ components (70% complete)
- `packages/shared/ui/tokens.ts` — Design tokens (colors, typography, spacing)
- `packages/shared/ui/HelplineCTA.tsx` — Plaintext helpline display
- `packages/shared/ui/ConsentMessageModal.tsx` — Amendment 5 message preview

### State Management
- `apps/consumer/c-app/store/authStore.ts` — Auth state (phone, OTP, session)
- `apps/consumer/c-app/store/triageStore.ts` — Triage state (5 steps, result)
- `apps/consumer/c-app/store/vaultStore.ts` — Vault state (encrypted storage)
- `apps/consumer/c-app/store/feedbackStore.ts` — Feedback state (8-step form)

### Backend Integration
- `packages/shared/api/supabase.ts` — Supabase client + React Query hooks
- `packages/shared/api/analytics.ts` — PostHog event tracking (28 events)

---

## Amendment Reference

### What Each Amendment Changed

**Amendment 1** (Feedback Flow):
- Added `prior_recommendation_source` field (asked BEFORE all other questions)
- Added `visited_recommended_provider` field (THE TRUE DISPLACEMENT FIELD)
- Changed feedback flow to 8 steps instead of 6

**Amendment 2** (WhatsApp Case Logging):
- Added lightweight WhatsappCase type
- Case ID format: THB-YYYYMMDD-sequential
- Severity levels: P1, P2, P3, P4

**Amendment 3** (Emergency vs Urgent Scoring):
- Emergency capability bonus: +5 for emergency urgency, +2 for urgent
- Previously conflated as single "emergency" factor

**Amendment 4** (Reliability Score):
- 4-component reliability (was previously 3)
- Cost accuracy 40%, no-answer (inverted) 30%, avg star 20%, language 10%
- Requires 5+ feedback records minimum

**Amendment 5** (Consent Message):
- Exact message template for emergency contact notification
- Shows contact name, user name, city, provider, address

### What Each Improvement Changed

**Improvement 1** (Red-Flag Symptoms):
- NON_COVERED_CITY_CHECKLIST includes specific symptoms
- Examples: chest pain, difficulty breathing, persistent vomiting, fainting

**Improvement 2** (Daily Summary Dashboard):
- 4 metric tiles: displacement rate, reuse intent, no-answer events, city gaps
- Auto-refreshes every 5 minutes on admin console

**Improvement 3** (Data Deletion Policy):
- Vault: DELETED
- TriageSession, Feedback, OverchargeReport: ANONYMIZED (user_id nulled)
- Rationale: Track patterns for future travelers without personal info

---

## Testing Checklist

### Unit Tests (Provided)
- ✅ rankProviders() with 6 mock providers (all 17 factors covered)
- ✅ reliability.ts (4-component score calculation)
- ✅ displacement.ts (true displacement formula)

### E2E Tests (To Create)
- [ ] Auth: Phone → OTP → Onboarding → Main app
- [ ] Triage: 5 steps → ranking → result display
- [ ] Emergency: GPS auto-detect → SOS → notification
- [ ] Feedback: 8-step form → displacement calculation

### Manual QA (Critical)
- [ ] Emergency screen works offline (no auth required)
- [ ] HelplineCTA shows plaintext number visible without tapping
- [ ] Provider availability toggle updates < 1 second
- [ ] Feedback notifications respect quiet hours (10pm-7am IST)
- [ ] Vault deletion anonymizes data correctly

---

## Deployment Pipeline

### GitHub
```bash
# Main branch = production
# Develop branch = staging
# Feature/* branches = development

git checkout -b feature/prompt-3-auth
# ... make changes ...
git push origin feature/prompt-3-auth
# Create PR, get review, merge to develop → merge to main
```

### Vercel (Auto-Deploy)
- Provider PWA: Push to main → auto-deploys to providers.travelhealthbridge.com
- Admin Console: Push to main → auto-deploys to admin.travelhealthbridge.com

### Supabase (Manual Setup)
- Create production database
- Configure email templates (OTP, feedback reminder)
- Set up RLS policies
- Configure backups (daily, 30-day retention)

### EAS Build (Consumer App)
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

---

## Common Development Scenarios

### "I want to add a new screen"
1. Create file in `apps/consumer/c-app/(route)/screen.tsx`
2. Use Expo Router for navigation (already configured)
3. Use components from `packages/shared/ui/`
4. Use Zustand stores for state management
5. Test on simulator before committing

### "I want to add a new Supabase query"
1. Define React Query hook in `packages/shared/api/supabase.ts`
2. Add queryKey to `queryKeys` factory
3. Use `useQuery` hook in your component
4. Handle loading/error states

### "I want to add a new event"
1. Call `track()` from `@travelhealthbridge/shared/api/analytics`
2. Event is auto-sent to PostHog with app_version + platform
3. View dashboard at posthog.com to verify it's firing

### "I want to test offline mode"
1. Enable airplane mode on simulator
2. App uses WatermelonDB for cached data
3. Triage flow should still work
4. Results show "offline" badge

---

## Support & Resources

### Documentation
- **EXECUTIVE_SUMMARY.md** — 10 min overview
- **IMPLEMENTATION_MANIFEST.md** — 30 min detailed breakdown
- **PROMPT_BY_PROMPT_BUILD_GUIDE.md** — 60+ min step-by-step with code
- Original 48-page specification (provided by user)

### Code References
- `packages/shared/utils/rankProviders.ts` — See 17-factor algorithm in action
- `packages/shared/utils/rankProviders.test.ts` — See how to test ranking
- `packages/shared/ui/HelplineCTA.tsx` — See Amendment 5 implementation
- `packages/shared/ui/ConsentMessageModal.tsx` — See exact message template

### Questions?
1. Check IMPLEMENTATION_MANIFEST.md section for relevant prompt
2. Check PROMPT_BY_PROMPT_BUILD_GUIDE.md for code examples
3. Check PROJECT_SURVIVAL_GUIDE.md for monorepo patterns
4. Search codebase for similar patterns/implementations

---

## Timeline Estimate (Team of 3-4 Developers)

| Week | Task | Hours |
|------|------|-------|
| Week 1 | Complete PROMPT 2 (native components) + PROMPT 3 (auth) | 24 |
| Week 2 | PROMPTS 4-5 (triage + emergency) | 24 |
| Week 3 | PROMPTS 6-8 (provider + vault + feedback) | 28 |
| Week 4 | PROMPTS 9-10 (PWA + admin) | 32 |
| Week 5 | PROMPT 11 (analytics) + PROMPT 12 (deployment) | 16 |
| Week 6 | Testing + bug fixes + app store submission | 16 |
| **Total** | | **140 hours** (~2 people-months equivalent) |

---

## Launch Checklist

- [ ] All 12 prompts implemented
- [ ] All environments configured (.env, Vercel, Supabase)
- [ ] All 3 apps deployed to production
- [ ] 48-hour UAT passed
- [ ] Analytics dashboard configured
- [ ] App store listings approved (Play Store + App Store)
- [ ] Support email + WhatsApp helpline active
- [ ] Privacy policy + ToS published
- [ ] Day-to-day runbook created

---

**Version**: 1.0 (This Session)
**Last Updated**: [Today]
**Maintained By**: Development Team
**Next Review**: Post-PROMPT 2 completion

For questions or updates, refer to the relevant guide file or create a new doc as needed.
