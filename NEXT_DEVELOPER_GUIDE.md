# 🎯 QUICK START — Next Developer Tasks

**Current Status**: PROMPT 2 ✅ + PROMPT 3 ✅ Complete  
**Last Updated**: April 23, 2026  
**Time Estimate to MVP**: ~70-80 hours (Prompts 4-12)

---

## ⚡ Immediate Setup (10 minutes)

```bash
# 1. Navigate to project
cd C:\Users\MAHENDRA TARAGI\Downloads\travel-health-bridge-main

# 2. Install dependencies (if not done)
yarn install

# 3. Copy environment variables
cp .env.local.template .env.local
# Fill in: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, etc.

# 4. Start consumer app dev server
yarn consumer:web
# Opens on http://localhost:8081

# 5. Start in Android/iOS simulator
yarn consumer:android   # or :ios
```

---

## 🚀 Your Assignment: PROMPT 4 (Triage Flow)

**Estimated Time**: 12-16 hours  
**Complexity**: HIGH (most complex feature)  
**Dependencies**: PROMPT 2 ✅, PROMPT 3 ✅  
**Files to Create/Modify**: 8-10 files

### The 5-Step Triage Flow

Users go through: **Urgency → City → Language → Symptom → Budget → Results**

```
Step 1: Choose urgency level
  [🔴 EMERGENCY]  [🟡 URGENT]  [🟢 CAN WAIT]
  → Save to triageStore.urgency

Step 2: Select city
  [Delhi] [Bengaluru] [Mumbai] [Goa] [Jaipur] [Agra]
  + GPS auto-detect button
  → Save to triageStore.city_id + city_name

Step 3: Choose languages (multi-select, min 1 required)
  [English] [Hindi] [Tamil] [Bengali] [Other]
  → Save to triageStore.languages[]

Step 4: Describe symptom (grid of 27 common symptoms + "Other")
  [Fever] [Cold] [Headache] [Stomach Pain] [Rash] ... [Other]
  → Save to triageStore.symptom + symptom_cluster

Step 5: Enter budget (optional WhatsApp contact)
  4 preset chips: [≤₹500] [₹500-1000] [₹1000-1500] [Custom]
  Optional: WhatsApp number to contact if provider doesn't answer
  → Save to triageStore.budget_max + whatsapp_number

RESULT:
  Call rankProviders() with all inputs
  → Top 2 providers shown
  → If < 2 providers score >0: Show HelplineCTA
  → Show "Call Now" button
```

### Key Requirements (from spec)

- [ ] Step 1 buttons must be **VERY RED for emergency** (variant="emergency", height 72px)
- [ ] Step 2: GPS auto-detect (use expo-location)
  - On failure: Show manual city picker
- [ ] Step 3: Multi-select with toggle animation
  - Red error if 0 languages selected
- [ ] Step 4: 3x3 grid with emoji icons
  - Map to 8 offline cache clusters
  - Shows "Loading cached providers..." if offline
- [ ] Step 5: Budget chips with currency formatting
  - Validate WhatsApp number if entered
- [ ] **Result Screen**:
  - Top 2 provider cards (name, area, fee, distance, languages, verified badge)
  - "Call Now" button on primary provider
  - 2-minute timer starts on "Call Now"
  - If timer expires without call completing → FailureBottomSheet
  - If only 1 provider (or < 2 scoring >0) → Show HelplineCTA
- [ ] **Non-covered city**: 
  - If selected city not in CITIES → Show red warning modal
  - List 8 red-flag symptoms from NON_COVERED_CITY_CHECKLIST
  - "View emergency hospitals" button
- [ ] **Offline mode**:
  - WatermelonDB cache lookup for same city+symptom+urgency
  - Show OfflineProviderCard (amber border + "Cached" timestamp)
  - Sync when connectivity restored

### Files to Create

```
apps/consumer/c-app/
├── (triage)/
│   ├── _layout.tsx                    # Triage wrapper
│   ├── index.tsx or step1.tsx         # Urgency screen
│   ├── step2-city.tsx                 # City selection
│   ├── step3-language.tsx             # Language multi-select
│   ├── step4-symptom.tsx              # Symptom grid
│   ├── step5-budget.tsx               # Budget + WhatsApp
│   ├── result.tsx                     # Top 2 providers + actions
│   └── hooks/
│       └── useTriage.ts               # Triage state + ranking
```

### Code Entry Point (Minimal Example)

```typescript
// apps/consumer/c-app/(triage)/index.tsx
import { useTriageStore } from '../store/triageStore';
import { useNavigation } from '@react-navigation/native';

export default function TriageStep1() {
  const { setUrgency, setStep, startTriage } = useTriageStore();
  const nav = useNavigation();

  const handleUrgencySelect = (urgency: 'emergency' | 'urgent' | 'can_wait') => {
    setUrgency(urgency);
    setStep(2);
    nav.navigate('step2');  // or whatever router pattern
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>What's your situation?</Text>
      
      <Button
        label="🔴 EMERGENCY"
        variant="emergency"
        onPress={() => handleUrgencySelect('emergency')}
      />
      
      <Button
        label="🟡 URGENT"
        variant="danger"
        onPress={() => handleUrgencySelect('urgent')}
      />
      
      <Button
        label="🟢 CAN WAIT"
        variant="primary"
        onPress={() => handleUrgencySelect('can_wait')}
      />
    </View>
  );
}
```

### Testing Your Work

```bash
# Run the triage screens
yarn consumer:android   # or :ios or :web

# Manual test checklist:
- [ ] Click emergency → red button (height 72px)
- [ ] Emergency → urgency='emergency' in store
- [ ] Select city → GPS prompt appears
- [ ] Pick symptom → cached providers appear if offline
- [ ] Enter budget → 4 chips show correct values
- [ ] Call Now → 2-minute timer starts
- [ ] Timer expires → FailureBottomSheet appears
- [ ] Non-covered city → Red warning with checklist
```

### Resources

| Resource | Location |
|----------|----------|
| Triage Store API | [apps/consumer/c-app/store/triageStore.ts](./apps/consumer/c-app/store/triageStore.ts) |
| Ranking Algorithm | [packages/shared/utils/rankProviders.ts](./packages/shared/utils/rankProviders.ts) |
| City Data | [packages/shared/constants/index.ts](./packages/shared/constants/index.ts) |
| UI Components | [packages/shared/ui/](./packages/shared/ui/) |
| Spec Document | Original spec in conversation (or request from PM) |
| Build Guide | [PROMPT_BY_PROMPT_BUILD_GUIDE.md](./PROMPT_BY_PROMPT_BUILD_GUIDE.md) — Section "PROMPT 4" |
| Test Examples | [packages/shared/utils/rankProviders.test.ts](./packages/shared/utils/rankProviders.test.ts) |

### Debugging Tips

**"Provider not showing in results?"**
- Check rankProviders.ts for hard exclusions (lapsed, very_stale, suspended)
- Verify language[] matches provider.languages[]
- Check budget: if maxBudget < provider.fee_min, score is 0
- If < 2 results, HelplineCTA should show

**"OTP not verifying?"**
- Supabase SMS config (check project settings)
- Verify phone format: +91XXXXXXXXXX (10 digits after code)
- Check auth lockout: lockUntil timestamp > Date.now()?

**"App won't start?"**
- `yarn install` (clear node_modules if needed)
- Check .env.local has EXPO_PUBLIC_SUPABASE_URL
- Clear Expo cache: `rm -rf .expo`

### Questions?

1. **"How do I run tests?"** → `yarn test` (uses Jest)
2. **"How do I debug?"** → Use React Native Debugger or Chrome DevTools
3. **"Where's the API?"** → [packages/shared/api/supabase.ts](./packages/shared/api/supabase.ts)
4. **"Can I add custom logic?"** → Always via stores/hooks, shared across native+web

---

## 📋 PROMPT Sequence

After PROMPT 4, continue in this order:

| # | Prompt | Hrs | Dependencies |
|---|--------|-----|--------------|
| 4 | Triage (5-step flow) | 12-16 | PROMPT 3 ✅ |
| 5 | Emergency (SOS + hospitals) | 4-6 | PROMPT 3 ✅ |
| 6 | Provider Profile (search + save) | 8-10 | PROMPT 4 ✅ |
| 7 | Medical Vault (5 collapsibles) | 10-12 | PROMPT 3 ✅ |
| 8 | Feedback (8-step Amendment 1) | 12-14 | PROMPT 4 ✅ |
| 9 | Provider PWA (availability + OTA) | 14-16 | PROMPT 4 ✅ |
| 10 | Admin Console (Next.js + dashboards) | 18-20 | PROMPT 8 ✅ |
| 11 | Analytics + Store Assets | 10-12 | All above |
| 12 | Deployment + Launch Checklist | 6-8 | All above |

---

## ✨ Success Criteria for PROMPT 4

- ✅ 5 triage screens navigate in sequence
- ✅ rankProviders() called with correct inputs
- ✅ Top 2 providers displayed correctly
- ✅ HelplineCTA shows when < 2 providers score >0
- ✅ FailureBottomSheet triggers after 2-minute timeout
- ✅ Non-covered city shows warning + checklist
- ✅ WatermelonDB offline cache works for same city+symptom
- ✅ TriageSession saved to Supabase with timestamp + user_id
- ✅ All UI components match design tokens (colors, spacing)
- ✅ TypeScript strict mode passes
- ✅ Runs on iOS, Android, and Web simultaneously

---

Good luck! 🚀
