# Implementation Quick Reference

## Phase 1: Integration & Completion (Week 1)

### PROMPT 4: Triage Integration (8 hours)

**Task**: Integrate WatermelonDB offline cache + 2-minute timer

**Files to Modify**:
1. `apps/consumer/c-app/(triage)/_layout.tsx` - Add WatermelonDB sync
2. `apps/consumer/c-app/(triage)/result.tsx` - Add 2-min timer logic
3. `apps/consumer/c-app/store/triageStore.ts` - Add timer state

**Code Snippets**:

```typescript
// result.tsx - 2-minute timer implementation
useEffect(() => {
  if (!result || result.length === 0) return;
  
  const timer = setTimeout(() => {
    // Check provider availability at 2-min mark
    checkProviderAvailability();
  }, 2 * 60 * 1000);
  
  return () => clearTimeout(timer);
}, [result]);

// Trigger FailureBottomSheet if no-answer
const checkProviderAvailability = async () => {
  const topProvider = result[0];
  const available = await supabase
    .from('providers')
    .select('status')
    .eq('id', topProvider.id)
    .single();
  
  if (available.data?.status === 'no-answer') {
    triggerFailureBottomSheet({
      reason: 'Top provider not answering',
      primaryProviderName: topProvider.name,
      onRetry: () => rankProviders() // Re-rank
    });
  }
};
```

**Commit Message**: `feat: Complete PROMPT 4 triage integration with offline cache and 2-min timer`

---

### PROMPT 5: Emergency SOS Integration (4 hours)

**Task**: Add vault data integration + location sharing

**Files to Modify**:
1. `apps/consumer/c-app/(tabs)/emergency.tsx` - Add vault lookup + location share
2. `apps/consumer/c-app/components/ConsentMessageModal.tsx` - Integrate real data

**Code Snippets**:

```typescript
// emergency.tsx - Load emergency contact from vault
useEffect(() => {
  const loadEmergencyContact = async () => {
    const vault = await vaultStore.getVault();
    setEmergencyContact(vault.emergency_contacts[0] || null);
  };
  loadEmergencyContact();
}, []);

// Location sharing with ConsentMessageModal
const handleSOSButton = async () => {
  const location = await Location.getCurrentPositionAsync();
  showConsentModal({
    city: currentCity,
    provider: topProvider,
    address: topProvider.address,
    user: {
      phone: session.user.phone,
      emergencyContact: emergencyContact?.name
    },
    location: location,
    onAccept: async () => {
      // Share location + log emergency
      await supabase.from('emergency_events').insert({
        user_id: session.user.id,
        provider_id: topProvider.id,
        city_id: currentCity,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        emergency_contact_notified_at: new Date().toISOString()
      });
      
      // Trigger WhatsApp/SMS to emergency contact
      Linking.openURL(`whatsapp://send?phone=${emergencyContact.phone}`);
    }
  });
};
```

**Commit Message**: `feat: Complete PROMPT 5 emergency SOS with vault integration and location sharing`

---

### PROMPT 6: Provider Data Loading (4 hours)

**Task**: Load provider data from Supabase + integrate report flow

**Files to Modify**:
1. `apps/consumer/c-app/(providers)/[slug].tsx` - Add Supabase data loading
2. `apps/consumer/c-app/(providers)/[slug]/report.tsx` - Already created ✅

**Code Snippets**:

```typescript
// [slug].tsx - Load provider from Supabase
useEffect(() => {
  const loadProvider = async () => {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        reviews: feedback(
          id,
          star_rating,
          language_comfort,
          cost_accurate,
          notes
        ),
        overcharge_reports: overcharge_reports(count)
      `)
      .eq('id', slug)
      .single();
    
    if (data) {
      setProvider(data);
      setReviews(data.reviews);
      setOverchargeCount(data.overcharge_reports[0]?.count || 0);
    }
  };
  loadProvider();
}, [slug]);

// Call action
const handleCall = () => {
  Linking.openURL(`tel:${provider.phone}`);
  track('provider_call_initiated', { provider_id: slug });
};

// Save action
const handleSave = async () => {
  const savedProviders = await AsyncStorage.getItem('saved_providers');
  const saved = JSON.parse(savedProviders || '[]');
  if (!saved.find(p => p.id === slug)) {
    saved.push(provider);
    await AsyncStorage.setItem('saved_providers', JSON.stringify(saved));
  }
};
```

**Commit Message**: `feat: Complete PROMPT 6 provider profile with Supabase data loading`

---

### PROMPT 7: Vault Encryption & Persistence (5 hours)

**Task**: Add encryption + Supabase persistence + delete account flow

**Files to Modify**:
1. `apps/consumer/c-app/(tabs)/vault.tsx` - Add save/delete actions
2. `packages/shared/hooks/useVault.ts` - Create vault persistence hook

**Code Snippets**:

```typescript
// useVault.ts - Vault persistence hook
export const useVault = () => {
  const [vault, setVault] = useState(null);
  
  const saveVault = async (data: VaultData) => {
    try {
      // Encrypt sensitive data
      const encrypted = await SecureStore.setItemAsync(
        'vault_data',
        JSON.stringify(data)
      );
      
      // Sync to Supabase (user_id from auth)
      const { error } = await supabase
        .from('vault')
        .upsert({
          user_id: session.user.id,
          ...data,
          updated_at: new Date().toISOString()
        });
      
      if (!error) setVault(data);
    } catch (err) {
      console.error('Error saving vault:', err);
    }
  };
  
  const deleteAccount = async () => {
    try {
      // Delete vault
      await supabase
        .from('vault')
        .delete()
        .eq('user_id', session.user.id);
      
      // Anonymize feedback (keep star_rating only)
      await supabase
        .from('feedback')
        .update({
          notes: null,
          language_comfort: null,
          cost_accurate: null,
          prior_recommendation_source: null,
          visited_recommended_provider: null
        })
        .eq('user_id', session.user.id);
      
      // Clear SecureStore
      await SecureStore.deleteItemAsync('vault_data');
      
      // Logout
      await authStore.logout();
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };
  
  return { vault, saveVault, deleteAccount };
};
```

**Commit Message**: `feat: Complete PROMPT 7 vault with encryption and Supabase persistence`

---

### PROMPT 8: Feedback Amendment 1 Compliance (3 hours)

**Task**: Verify Amendment 1 field order + add Supabase persistence

**Critical Verification**:
```typescript
// feedback.tsx - Amendment 1 field order CRITICAL
const FEEDBACK_STEPS = [
  {
    step: 1,
    field: 'prior_recommendation_source', // ASKED FIRST - MANDATORY
    question: 'Where did you hear about this provider?',
    options: [
      'Hotel/guesthouse reception',
      'Google Maps',
      'Friend',
      'Insurance helpline',
      'No—TravelHealthBridge was first step'
    ]
  },
  {
    step: 2,
    field: 'visited',
    question: 'Did you visit this provider?'
  },
  {
    step: 3,
    field: 'visited_recommended_provider', // TRUE DISPLACEMENT FIELD
    question: 'Was this the provider TravelHealthBridge recommended?',
    condition: step2Value === true // Only show if visited = true
  },
  {
    step: 4,
    field: 'cost_accurate',
    question: 'Was the cost accurate?',
    condition: step3Value === true // Only show if visited_recommended_provider = true
  },
  // ... steps 5-8
];
```

**Commit Message**: `feat: Complete PROMPT 8 feedback with Amendment 1 compliance verification`

---

### PROMPT 9: Provider PWA <1sec Toggle (6 hours)

**Task**: Implement sub-1-second availability toggle

**Critical Performance Requirements**:
```typescript
// p-app/components/AvailabilityToggle.tsx
const AvailabilityToggle = ({ providerId }) => {
  const [available, setAvailable] = useState(true);
  const startTime = useRef(Date.now());
  
  const handleToggle = async () => {
    const newState = !available;
    setAvailable(newState); // Optimistic update
    
    try {
      // Update Supabase directly - MUST be < 1 second
      const { error } = await supabase
        .from('providers')
        .update({
          available: newState,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', providerId)
        .single();
      
      const duration = Date.now() - startTime.current;
      console.log(`Toggle duration: ${duration}ms`); // MUST be < 1000ms
      
      if (error) {
        setAvailable(!newState); // Revert on error
      }
      
      // Track timing
      track('provider_availability_toggled', {
        available_now: newState,
        toggle_duration_ms: duration
      });
    } catch (err) {
      setAvailable(!newState);
    }
  };
  
  return (
    <button onClick={handleToggle}>
      {available ? 'Available' : 'Unavailable'}
    </button>
  );
};
```

**Performance Testing**:
```bash
# Use Chrome DevTools Network tab to verify < 1000ms
# Run 10 toggles and measure average
# Target: 500ms average, max 1000ms
```

**Commit Message**: `feat: Complete PROMPT 9 provider PWA with sub-1sec availability toggle`

---

### PROMPT 10: Admin Console Completion (8 hours)

**Task**: Implement DailySummaryCard metrics + all 6 pages

**DailySummaryCard Metrics**:
```typescript
// components/DailySummaryCard.tsx
const calculateMetrics = async () => {
  // 1. Displacement rate
  const displacementRate = await calculateDisplacementRate();
  
  // 2. Reuse intent rate
  const reuseIntentRate = await calculateReuseIntentRate();
  
  // 3. No-answer events count
  const noAnswerCount = await supabase
    .from('feedback')
    .select('count', { count: 'exact' })
    .eq('cost_accurate', 'no_answer')
    .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString());
  
  // 4. City gaps (cities with < 2 providers)
  const cityGaps = await supabase
    .from('providers')
    .select('city_id, count(*)')
    .group_by('city_id')
    .having('count < 2');
  
  return {
    displacement_rate: displacementRate,
    reuse_intent_rate: reuseIntentRate,
    no_answer_events: noAnswerCount.count,
    city_gaps: cityGaps.length
  };
};

// 5-minute auto-refresh
useEffect(() => {
  const interval = setInterval(async () => {
    const metrics = await calculateMetrics();
    setMetrics(metrics);
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

**Commit Message**: `feat: Complete PROMPT 10 admin console with metrics and all 6 pages`

---

## Phase 2: Testing & Hardening (Week 2)

### QA Testing Checklist

**Consumer App** (3 devices):
- [ ] iOS 15+ on real device
- [ ] Android 21+ on real device
- [ ] Web on Chrome/Safari

**All Flows**:
- [ ] Phone auth (real phone number)
- [ ] Onboarding (all 3 slides)
- [ ] Triage complete (urgency → city → language → symptom → budget → results)
- [ ] Provider profile + call (real phone)
- [ ] Emergency SOS (GPS auto-detect + location share)
- [ ] Vault save/load/delete (all 5 sections)
- [ ] Feedback (all 8 steps)
- [ ] Offline mode (turn off WiFi, retry)

**Performance Testing**:
- [ ] App startup < 3 sec (cold start)
- [ ] Triage API < 2 sec
- [ ] Provider ranking < 1 sec
- [ ] Feedback submit < 3 sec

**Crash Testing**:
- [ ] Kill app during triage, resume from last step
- [ ] Network interruption handling
- [ ] Invalid phone number error message
- [ ] Low disk space warning

---

## Phase 3: Launch Preparation (Week 3)

### App Store Submission

**Before Submission**:
1. [ ] Privacy policy reviewed (GDPR compliant)
2. [ ] All screenshots prepared (1170×2532 for iOS, 1080×1920 for Android)
3. [ ] App description written
4. [ ] Marketing website ready
5. [ ] Crash-free rate > 99% (via Sentry/Bugsnag)

**iOS Submission**:
```bash
eas build --platform ios --profile production
# Upload to App Store Connect via Transporter
```

**Android Submission**:
```bash
eas build --platform android --profile production
# Upload AAB to Google Play Console
```

---

## Command Reference

### Development
```bash
# Consumer app
cd apps/consumer && npx expo start --ios
cd apps/consumer && npx expo start --android
cd apps/consumer && npx expo start --web

# Provider PWA
cd apps/provider && npm run dev

# Admin console
cd apps/admin && npm run dev
```

### Git Commits
```bash
# After each task, commit:
git add .
git commit -m "feat: Complete PROMPT X [feature name]"
git push origin main
```

### Database
```bash
# Check triage sessions count
psql $SUPABASE_URL -c "SELECT COUNT(*) FROM triage_sessions;"

# Check feedback with visited_recommended_provider
psql $SUPABASE_URL -c "SELECT COUNT(*) FROM feedback WHERE visited_recommended_provider = true;"

# Check provider availability toggle timing
psql $SUPABASE_URL -c "SELECT MAX(EXTRACT(EPOCH FROM updated_at - created_at)) FROM providers WHERE available_updated_at IS NOT NULL;"
```

### PostHog Events
```bash
# Verify event capture:
# 1. Open PostHog dashboard
# 2. Go to Events
# 3. Filter by event name (e.g., "app_opened")
# 4. Verify event count increases
```

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| TypeScript errors after file edit | `yarn build` to recompile |
| App crashes on startup | Check console logs: `eas logs` |
| Offline mode not working | Clear WatermelonDB: `Settings → Clear Cache` |
| Provider toggle slow | Check Supabase status page for outages |
| PostHog events missing | Verify API key in .env.local |
| OTP not sent | Check Supabase SMS provider quota |

---

## Success Criteria per Task

### PROMPT 4 ✅
- [ ] Triage completes end-to-end
- [ ] Offline results show amber border + timestamp
- [ ] 2-min timer triggers FailureBottomSheet correctly
- [ ] No-answer count tracked

### PROMPT 5 ✅
- [ ] SOS button triggers within 2 taps
- [ ] Location share works on real device
- [ ] Emergency contact from vault pre-populated
- [ ] 6 hospitals display with plaintext numbers

### PROMPT 6 ✅
- [ ] Provider data loads from Supabase in < 2 sec
- [ ] Call button opens phone dialer
- [ ] Report screen works (3-step flow)
- [ ] Overcharge creates database record

### PROMPT 7 ✅
- [ ] Vault saves to SecureStore (native)
- [ ] Data syncs to Supabase
- [ ] Delete account anonymizes feedback
- [ ] Max 10 medications enforced

### PROMPT 8 ✅
- [ ] Prior source asked FIRST
- [ ] visited_recommended_provider is displacement field
- [ ] Fields 4-6 only show if visited=true AND visited_rec=true
- [ ] Feedback saves to Supabase

### PROMPT 9 ✅
- [ ] Availability toggle < 1000ms (target 500ms)
- [ ] last_activity_at updates immediately
- [ ] Referrals load with patient details
- [ ] Feedback displays with star ratings

### PROMPT 10 ✅
- [ ] DailySummaryCard shows 4 metrics
- [ ] 5-minute auto-refresh works
- [ ] All 6 pages functional
- [ ] Can suspend provider from UI

---

**Remember**: Commit after each task completes. Track progress in PROJECT_STATUS.md.
