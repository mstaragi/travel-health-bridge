# Travel Health Bridge — Complete Build & Implementation Guide
**Status**: Prompts 1-2 Foundational Complete | Prompts 3-12 Ready for Implementation

---

## QUICK START CHECKLIST

Before starting any prompt, ensure:
- [ ] Copy `.env.local.template` → `.env.local` and fill in credentials
- [ ] Run `yarn install` to ensure all dependencies installed
- [ ] Run `yarn dev` to start all development servers
- [ ] Verify Supabase project created and schema initialized
- [ ] Read the relevant PROMPT section below completely before coding

---

## PROMPT 1 STATUS: ✅ COMPLETE
**Foundation Phase**: All shared utilities, types, constants completed.
- ✅ 15+ TypeScript interfaces (Provider, Feedback with Amendment 1, WhatsappCase, etc.)
- ✅ 6 hardcoded cities with emergency contacts
- ✅ 5 languages, 15 specialties, symptom mappings
- ✅ 17-factor ranking algorithm (Amendment 3 implemented)
- ✅ 4-component reliability score (Amendment 4)
- ✅ True displacement formula (Amendment 1)
- ✅ Utility functions: distance, openStatus, formatFee, staleness
- ✅ React Query hooks stub + key factory
- ✅ PostHog analytics setup (28 events stubbed)
- ✅ `.env.local.template` with all required variables
- ✅ rankProviders() unit tests (6 mock providers, all 17 factors covered)

**Next Step**: Proceed to PROMPT 2 if UI components need completion, otherwise jump to PROMPT 3.

---

## PROMPT 2 STATUS: 🟡 70% COMPLETE
**Design System Phase**: Core components built, needs native variants.

### What's Done
- ✅ Design tokens (colors, typography, sizing, z-index, shadows)
- ✅ Button (web variant exists, needs native)
- ✅ Input (web variant exists, needs native)
- ✅ OTPInput (web variant exists, needs native)
- ✅ ProviderCard, OfflineProviderCard
- ✅ OpenStatusBadge, VerifiedBadge
- ✅ LanguagePill, Tag
- ✅ HelplineCTA (plaintext number visible, WhatsApp button)
- ✅ ConsentMessageModal (exact message preview per Amendment 5)
- ✅ FailureBottomSheet (reason, actions)

### What's Needed

**For Web Apps (Provider PWA + Admin)**:
All components above are web-ready. No additional work needed.

**For Consumer Native App (iOS/Android)**:

1. **Copy web components to platform-specific files**:
   ```bash
   packages/shared/ui/Button.web.tsx   # Already exists
   packages/shared/ui/Button.native.tsx  # CREATE — React Native StyleSheet version
   ```

2. **Create native versions** using React Native (no HTML):
   ```typescript
   // Button.native.tsx example
   import { TouchableOpacity, Text } from 'react-native';
   import { StyleSheet } from 'react-native';
   
   export function Button({
     label,
     variant = 'primary',
     onPress,
     disabled,
   }: ButtonProps) {
     const styles = StyleSheet.create({
       button: {
         minHeight: 44,
         borderRadius: 8,
         justifyContent: 'center',
         alignItems: 'center',
         paddingHorizontal: 16,
       },
       primary: { backgroundColor: '#0F9B8E' },
       emergency: { minHeight: 72, backgroundColor: '#E53935' },
       text: { fontSize: 16, fontWeight: '600', color: '#FFF' },
     });

     return (
       <TouchableOpacity
         style={[styles.button, styles[variant]]}
         onPress={onPress}
         disabled={disabled}
       >
         <Text style={styles.text}>{label}</Text>
       </TouchableOpacity>
     );
   }
   ```

3. **Create missing native components** (if needed for native-only features):
   - Modal (bottom sheet with react-native-reanimated)
   - Toast (react-native-toast-message or custom)
   - Skeleton (shimmer animation)

4. **Test Tailwind CSS usage** (for web apps only):
   ```bash
   # Provider PWA & Admin use Tailwind
   # Consumer app uses React Native StyleSheet
   ```

**Estimated Time**: 4-6 hours to create all native variants
**Dependencies**: react-native, react-native-reanimated already in package.json

---

## PROMPT 3: AUTHENTICATION & ONBOARDING
**Dependency**: PROMPT 2 (UI components)
**Estimated Time**: 8-10 hours
**Files to Create/Update**:
- `apps/consumer/c-app/store/authStore.ts` ← Already exists, needs phone auth implementation
- `apps/consumer/c-app/(auth)/phone.tsx` ← Phone entry screen
- `apps/consumer/c-app/(auth)/otp.tsx` ← OTP entry screen
- `apps/consumer/c-app/(auth)/onboarding/index.tsx` ← 3-slide onboarding
- `packages/shared/hooks/usePhoneAuth.ts` ← Phone auth logic
- `apps/consumer/c-app/_layout.tsx` ← Route protection middleware

### Implementation Steps

#### Step 1: Phone Authentication Setup
```typescript
// apps/consumer/c-app/(auth)/phone.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '@travelhealthbridge/shared';
import { supabase } from '@travelhealthbridge/shared';
import { useAuthStore } from '../store/authStore';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter a valid 10-digit number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Send OTP via SMS
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`, // India prefix
      });

      if (err) {
        setError(err.message);
        return;
      }

      // Navigate to OTP screen with phone number
      navigation.navigate('OTP', { phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        Enter your phone number
      </Text>
      <Input
        placeholder="+91 98765 43210"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />
      {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <Button
        label="Send OTP"
        onPress={handleSendOTP}
        disabled={loading}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}
```

#### Step 2: OTP Verification
```typescript
// apps/consumer/c-app/(auth)/otp.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { OTPInput, Button } from '@travelhealthbridge/shared';
import { supabase } from '@travelhealthbridge/shared';
import { useAuthStore } from '../store/authStore';

export default function OTPScreen({ route }: any) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { authenticate } = useAuthStore();

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Per spec: 15-min lockout on 3 failures
      if (failedAttempts >= 3) {
        useAuthStore.setState({ lockUntil: Date.now() + 15 * 60 * 1000 });
        setError('Too many attempts. Try again in 15 minutes.');
        return;
      }

      const result = await authenticate(phone, otp);
      if (!result.success) {
        setFailedAttempts(f => f + 1);
        setError(result.error || 'Invalid OTP');
        return;
      }

      // Success — navigate to onboarding
      // (handled by app navigation logic)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Enter OTP sent to {phone}
      </Text>
      <OTPInput
        value={otp}
        onChangeText={setOtp}
        editable={!loading}
      />
      {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <Button
        label="Verify"
        onPress={handleVerifyOTP}
        disabled={loading || otp.length !== 6}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}
```

#### Step 3: Onboarding (3 slides)
```typescript
// apps/consumer/c-app/(auth)/onboarding/index.tsx
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Button } from '@travelhealthbridge/shared';
import { useAuthStore } from '../../store/authStore';

const slides = [
  {
    title: 'Get sick in any city?',
    description: 'Find a doctor without knowing anyone local.',
    emoji: '🏥',
  },
  {
    title: 'Verified doctors',
    description: 'Every doctor personally verified by Travel Health Bridge.',
    emoji: '✅',
  },
  {
    title: 'Free, 24/7',
    description: 'In 6 cities, open 24 hours a day, every day. No signup fee.',
    emoji: '🌍',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { completeOnboarding } = useAuthStore();

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      scrollRef.current?.scrollTo({
        x: (currentSlide + 1) * Dimensions.get('window').width,
        animated: true,
      });
    } else {
      await completeOnboarding();
      // Navigate to main app
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {slides.map((slide, idx) => (
          <View
            key={idx}
            style={{
              width: Dimensions.get('window').width,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 64, marginBottom: 24 }}>{slide.emoji}</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
              {slide.title}
            </Text>
            <Text style={{ fontSize: 18, color: '#666', textAlign: 'center' }}>
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 }}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={{
              width: idx === currentSlide ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === currentSlide ? '#0F9B8E' : '#DDD',
            }}
          />
        ))}
      </View>

      {/* Next button */}
      <View style={{ padding: 16 }}>
        <Button
          label={currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}
```

#### Step 4: Route Protection
```typescript
// apps/consumer/c-app/_layout.tsx (modify to protect routes)
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

export default function RootLayout() {
  const { isLoading, hasSeenOnboarding, session, isGuest, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) return <LoadingScreen />;

  // Not authenticated → show auth stack
  if (!session && !isGuest && !hasSeenOnboarding) {
    return <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
    </Stack>;
  }

  // Main app
  return <Tabs />;
}
```

**Next Step**: After implementing PROMPT 3, proceed to PROMPT 4 (Triage).

---

## PROMPT 4: FIVE-STEP TRIAGE FLOW
**Dependency**: PROMPT 3 (auth)
**Estimated Time**: 12-16 hours
**Key Feature**: Offline detection + WatermelonDB caching

### Implementation Overview

The triage flow is the **core feature** of the app. It must work offline and sync when online.

#### Architecture
```
Step 1: Urgency picker (3 buttons)
  ↓
Step 2: City selector (6 chips + auto-detect)
  ↓
Step 3: Language selector (multi-select pills)
  ↓
Step 4: Symptom picker (3x3 grid)
  ↓
Step 5: Budget input (4 chips + optional contact)
  ↓
rankProviders() call
  ↓
Result screen (show primary + secondary)
  ↓
(If Call Now tapped) → 2-min timer → FailureBottomSheet
  ↓
(If user alone) → ConsentMessageModal
```

#### Files to Create
1. `apps/consumer/c-app/(triage)/index.tsx` - Triage entry point
2. `apps/consumer/c-app/(triage)/step1-urgency.tsx` - Emergency/Urgent/CanWait picker
3. `apps/consumer/c-app/(triage)/step2-city.tsx` - City selector with GPS auto-detect
4. `apps/consumer/c-app/(triage)/step3-language.tsx` - Multi-select language picker
5. `apps/consumer/c-app/(triage)/step4-symptom.tsx` - 3x3 symptom grid
6. `apps/consumer/c-app/(triage)/step5-budget.tsx` - Budget picker + optional contact
7. `apps/consumer/c-app/(triage)/result.tsx` - Result screen with provider cards
8. `packages/shared/hooks/useNetworkStatus.ts` - Offline detection hook
9. `packages/shared/hooks/useWatermelonDB.ts` - Offline cache integration

#### Sample Implementation: Step 1 (Urgency)
```typescript
// apps/consumer/c-app/(triage)/step1-urgency.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTriageStore } from '../store/triageStore';
import { useRouter } from 'expo-router';

export default function UrgencyStep() {
  const { setUrgency } = useTriageStore();
  const router = useRouter();

  const options = [
    { urgency: 'emergency', label: '🔴 EMERGENCY', color: '#E53935', desc: 'Severe illness or injury' },
    { urgency: 'urgent', label: '🟠 URGENT', color: '#FFA726', desc: 'High fever or pain' },
    { urgency: 'can_wait', label: '🟢 CAN WAIT', color: '#66BB6A', desc: 'Minor symptoms' },
  ];

  const handleSelect = (urgency: any) => {
    setUrgency(urgency);
    router.push('/(triage)/step2-city');
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        How urgent is this?
      </Text>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.urgency}
          onPress={() => handleSelect(opt.urgency)}
          style={{
            backgroundColor: opt.color,
            borderRadius: 12,
            padding: 24,
            marginBottom: 12,
            minHeight: 80,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>
            {opt.label}
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.8 }}>
            {opt.desc}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

#### Offline Detection & WatermelonDB Cache
```typescript
// packages/shared/hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  return { isOnline };
}
```

**Key Implementation Notes**:
- Use `expo-location` for GPS auto-detect (requires permission)
- Implement WatermelonDB cache for offline symptom lookup
- Call `rankProviders()` after step 5 collected
- Handle 2-minute failure timer after "Call Now"
- Show FailureBottomSheet after 2-min timeout
- Show ConsentMessageModal if user alone

**Next Step**: After PROMPT 4, proceed to PROMPT 5 (Emergency Screen).

---

## PROMPT 5: EMERGENCY SCREEN
**Dependency**: PROMPT 2 (UI)
**Estimated Time**: 4-6 hours
**Route**: `/(tabs)/emergency` (always accessible, no auth)

### Key Requirements
- ✅ NEVER requires authentication
- ✅ NEVER requires internet (hardcoded cities)
- ✅ Large tap targets (72px min height)
- ✅ City detection (GPS preferred, manual fallback)
- ✅ 6 hardcoded emergency contacts with plaintext numbers
- ✅ SOS button → ConsentMessageModal → location share

### Files to Create
```typescript
// apps/consumer/c-app/(tabs)/emergency.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ConsentMessageModal, Button } from '@travelhealthbridge/shared';
import { useLocation } from 'expo-location';
import * as Sharing from 'expo-sharing';
import { CITIES } from '@travelhealthbridge/shared/constants';

export default function EmergencyScreen() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [location, setLocation] = useState(null);

  // Detect city from GPS
  useEffect(() => {
    (async () => {
      const { status } = await requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await getCurrentPositionAsync({});
        setLocation(loc);
        
        // Find nearest city (simplified)
        const nearest = CITIES[0];
        setSelectedCity(nearest.id);
      }
    })();
  }, []);

  const handleSOS = () => {
    setShowConsentModal(true);
    // Log analytics
    track('sos_triggered', { city_id: selectedCity });
  };

  const handleConfirmSOS = async () => {
    // Share location
    if (location) {
      const url = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      await Sharing.shareAsync(url);
    }
    
    // Log emergency_contact_notified
    track('emergency_contact_notified', { city_id: selectedCity });
    setShowConsentModal(false);
  };

  const city = CITIES.find(c => c.id === selectedCity);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0D2137', padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 24 }}>
        🚨 EMERGENCY
      </Text>

      {/* City selector (if GPS didn't work) */}
      {!selectedCity && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#FFF', marginBottom: 12 }}>Select your city:</Text>
          {CITIES.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCity(c.id)}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, marginBottom: 8 }}
            >
              <Text style={{ color: '#FFF' }}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Emergency contact info */}
      {city && (
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: '#FFF', fontSize: 18, marginBottom: 8 }}>
            📞 {city.emergency_hospital}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>
            {city.emergency_phone}
          </Text>
          {city.ambulance && (
            <Text style={{ color: '#FFF', fontSize: 16, marginTop: 8 }}>
              🚑 Ambulance: {city.ambulance}
            </Text>
          )}
        </View>
      )}

      {/* SOS Button — 72px minimum height per spec */}
      <Button
        label="🆘 SEND SOS"
        variant="emergency"
        onPress={handleSOS}
        style={{ minHeight: 72 }}
      />

      {/* Consent Modal */}
      <ConsentMessageModal
        visible={showConsentModal}
        onConfirm={handleConfirmSOS}
        onCancel={() => setShowConsentModal(false)}
        userCity={city?.name}
        providerName="" // Emergency screen doesn't have provider
        providerAddress="" 
      />
    </ScrollView>
  );
}
```

**Next Step**: After PROMPT 5, proceed to PROMPT 6 (Provider Profile & Search).

---

## PROMPT 6: PROVIDER PROFILE & SEARCH
**Dependency**: PROMPT 4 (triage provides providers list)
**Estimated Time**: 8-10 hours
**Files to Create**:
- `apps/consumer/c-app/(providers)/[id].tsx` - Provider detail screen
- `apps/consumer/c-app/(providers)/search.tsx` - Search with filters
- `apps/consumer/c-app/(visits)/saved.tsx` - Saved providers list
- `packages/shared/ui/OverchargeReportForm.tsx` - Overcharge report form
- `apps/consumer/store/savedProvidersStore.ts` - Zustand store for saved providers

### Implementation Guide

#### Provider Detail Screen
```typescript
// apps/consumer/c-app/(providers)/[id].tsx
export default function ProviderScreen({ route }: any) {
  const { id } = route.params;
  const { data: provider } = useProvider(id);

  if (!provider) return <LoadingScreen />;

  const handleCallNow = () => {
    Linking.openURL(`tel:${provider.phone}`);
    track('call_now_tapped', { provider_id: id });
  };

  const handleGetDirections = () => {
    const url = `https://maps.google.com/?q=${provider.lat},${provider.lng}`;
    Linking.openURL(url);
    track('directions_tapped', { provider_id: id });
  };

  const handleSave = () => {
    // Toggle save in zustand store
    track('provider_saved', { provider_id: id });
  };

  const handleReportOvercharge = () => {
    // Navigate to overcharge form with provider_id pre-filled
  };

  return (
    <ScrollView>
      {/* Header with badge */}
      <View style={{ padding: 16 }}>
        <ProviderCard provider={provider} onPress={() => {}} />
        
        {/* Details */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16 }}>
          {provider.name}
        </Text>
        <Text style={{ color: '#666' }}>{provider.area}</Text>

        {/* Languages */}
        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Languages</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {provider.languages.map(lang => (
            <LanguagePill key={lang} language={lang} />
          ))}
        </View>

        {/* OPD Hours */}
        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>OPD Hours</Text>
        {/* Show hours */}

        {/* CTA Buttons */}
        <View style={{ gap: 8, marginTop: 24 }}>
          <Button label="📞 Call Now" onPress={handleCallNow} variant="primary" />
          <Button label="🗺️ Get Directions" onPress={handleGetDirections} />
          <Button label="💾 Save" onPress={handleSave} variant="secondary" />
          <Button label="⚠️ Report Overcharge" onPress={handleReportOvercharge} variant="ghost" />
        </View>
      </View>
    </ScrollView>
  );
}
```

#### Search Screen with Filters
```typescript
// apps/consumer/c-app/(providers)/search.tsx
export default function SearchScreen() {
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [openOnly, setOpenOnly] = useState(false);

  const { data: providers } = useProviderSearch({
    city,
    language,
    open_now: openOnly,
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Filters */}
      <Input placeholder="City" value={city} onChangeText={setCity} />
      <Input placeholder="Language" value={language} onChangeText={setLanguage} />
      <Button
        label={openOnly ? '✓ Open now' : 'Open now'}
        onPress={() => setOpenOnly(!openOnly)}
        variant={openOnly ? 'primary' : 'secondary'}
      />

      {/* Results */}
      <FlatList
        data={providers}
        renderItem={({ item }) => (
          <ProviderCard provider={item} onPress={() => navigate(`/(providers)/${item.id}`)} />
        )}
      />
    </View>
  );
}
```

**Next Step**: After PROMPT 6, proceed to PROMPT 7 (Medical Vault).

---

## PROMPT 7: MEDICAL VAULT
**Dependency**: PROMPT 3 (auth required)
**Estimated Time**: 10-12 hours
**Encryption**: expo-secure-store (native) + Supabase Vault (web)

### Files to Create
```
apps/consumer/c-app/vault/index.tsx        - Main vault screen
apps/consumer/c-app/vault/blood-group.tsx  - Blood group editor
apps/consumer/c-app/vault/allergies.tsx    - Allergies editor
apps/consumer/c-app/vault/medications.tsx  - Medications editor
apps/consumer/c-app/vault/emergency-contacts.tsx
apps/consumer/c-app/vault/insurance.tsx
apps/consumer/store/vaultStore.ts
```

### Key Implementation: Vault Store
```typescript
// apps/consumer/store/vaultStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { VaultEntry } from '@travelhealthbridge/shared';

export interface VaultState {
  entry: VaultEntry | null;
  isLoading: boolean;

  loadVault: (userId: string) => Promise<void>;
  saveVaultEntry: (entry: Partial<VaultEntry>) => Promise<void>;
  deleteAccount: (userId: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set) => ({
  entry: null,
  isLoading: false,

  loadVault: async (userId: string) => {
    set({ isLoading: true });
    try {
      const key = `vault-${userId}`;
      const encrypted = await SecureStore.getItemAsync(key);
      if (encrypted) {
        const entry = JSON.parse(encrypted);
        set({ entry });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  saveVaultEntry: async (updates: Partial<VaultEntry>) => {
    const current = useVaultStore.getState().entry;
    const updated = { ...current, ...updates, last_synced_at: new Date().toISOString() };
    
    try {
      // Save to SecureStore
      await SecureStore.setItemAsync(`vault-${current?.user_id}`, JSON.stringify(updated));
      
      // Sync to Supabase
      // await supabase.from('vault').upsert([updated]);
      
      set({ entry: updated });
    } catch (err) {
      console.error('Vault save failed:', err);
    }
  },

  deleteAccount: async (userId: string) => {
    try {
      // Delete vault
      await SecureStore.deleteItemAsync(`vault-${userId}`);
      
      // Delete from Supabase + anonymize sessions/feedback (PROMPT 8 logic)
      // Per Improvement 3: anonymize, don't delete
      
      set({ entry: null });
    } catch (err) {
      console.error('Account deletion failed:', err);
    }
  },
}));
```

**Next Step**: After PROMPT 7, proceed to PROMPT 8 (Feedback & Displacement).

---

## PROMPT 8: FEEDBACK & DISPLACEMENT TRACKING
**Dependency**: PROMPT 4 (triage sessions), PROMPT 7 (vault for delete logic)
**Estimated Time**: 12-14 hours
**Critical Feature**: Amendment 1 - 8-step feedback with Step 0 (prior source) FIRST

### Implementation Overview

#### Amendment 1 Feedback Flow (EXACT ORDER)
```
Step 0: "How did you first learn about [provider_name]?"
        → prior_recommendation_source (MANDATORY, asked BEFORE anything)
Step 1: "Did you get medical help?"
        → visited (boolean)
Step 1b: "Did you visit [Provider Name]?"
        → visited_recommended_provider (boolean|null) [TRUE DISPLACEMENT FIELD]
Step 2 (if 1b=yes): "Was the fee within the range shown?"
        → cost_accurate
Step 3 (if 1b=yes): "Rate your experience 1-5 stars"
        → star_rating
Step 4 (if 1b=yes): "Doctor spoke your language?"
        → language_comfort
Step 5: "Would you use Travel Health Bridge again?"
        → reuse_intent
Step 6: "Any feedback? (200 chars)"
        → notes
```

#### Files to Create
```
apps/consumer/c-app/feedback/index.tsx
apps/consumer/c-app/feedback/step0-prior-source.tsx
apps/consumer/c-app/feedback/step1-visited.tsx
apps/consumer/c-app/feedback/step1b-visited-provider.tsx
apps/consumer/c-app/feedback/step2-cost.tsx
apps/consumer/c-app/feedback/step3-rating.tsx
apps/consumer/c-app/feedback/step4-language.tsx
apps/consumer/c-app/feedback/step5-reuse.tsx
apps/consumer/c-app/feedback/step6-notes.tsx
packages/shared/hooks/useFeedbackNotification.ts
```

#### Key Store
```typescript
// apps/consumer/store/feedbackStore.ts
import { create } from 'zustand';
import { Feedback } from '@travelhealthbridge/shared';

export interface FeedbackState {
  sessionId: string | null;
  step: number;
  feedback: Partial<Feedback>;
  
  startFeedback: (sessionId: string) => void;
  setStep: (step: number) => void;
  updateFeedback: (updates: Partial<Feedback>) => void;
  submitFeedback: () => Promise<void>;
  reset: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  sessionId: null,
  step: 0,
  feedback: {},

  startFeedback: (sessionId: string) => {
    set({ sessionId, step: 0, feedback: { session_id: sessionId } });
  },

  setStep: (step: number) => {
    set({ step });
  },

  updateFeedback: (updates: Partial<Feedback>) => {
    set(state => ({
      feedback: { ...state.feedback, ...updates },
    }));
  },

  submitFeedback: async () => {
    const { feedback } = get();
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('feedback')
        .insert([{ ...feedback, submitted_at: new Date().toISOString() }]);
      
      if (error) throw error;
      
      // Track analytics
      track('feedback_submitted', {
        displacement: feedback.visited_recommended_provider,
        reuse_intent: feedback.reuse_intent,
      });
      
      set({ feedback: {}, step: 0 });
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  },

  reset: () => {
    set({ sessionId: null, step: 0, feedback: {} });
  },
}));
```

#### Feedback Notification Trigger
```typescript
// packages/shared/hooks/useFeedbackNotification.ts
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

const QUIET_HOURS_START = 22; // 10pm IST
const QUIET_HOURS_END = 7;    // 7am IST

export function useFeedbackNotification() {
  useEffect(() => {
    // Check for incomplete triage sessions
    const checkAndNotify = async () => {
      const sessions = await fetchTriageSessions({
        feedback_sent: false,
        created_at: { range: [4, 6], unit: 'hours' }, // 4-6 hours old
      });

      const now = new Date();
      const hour = now.getHours();

      // Skip quiet hours (10pm-7am IST)
      if (hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END) {
        return;
      }

      for (const session of sessions) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'How was your visit?',
            body: 'Help us improve by sharing your feedback',
          },
          trigger: { seconds: 1 },
        });

        // Mark as feedback_sent
        await supabase
          .from('triage_sessions')
          .update({ feedback_sent: true })
          .eq('id', session.id);
      }
    };

    checkAndNotify();
  }, []);
}
```

#### True Displacement Calculation (Admin Dashboard use)
```typescript
// Implemented in PROMPT 10, but defined here:
// displacement_rate = COUNT(prior_recommendation_source != 'No — TravelHealthBridge was first' AND visited_recommended_provider=true)
//                     / COUNT(prior_recommendation_source != 'No — TravelHealthBridge was first')
// Minimum threshold: denominator >= 1
```

**Next Step**: After PROMPT 8, proceed to PROMPT 9 (Provider PWA).

---

## PROMPT 9: PROVIDER PWA (apps/provider)
**Platform**: Web only (Expo web export)
**Estimated Time**: 14-16 hours
**Dependencies**: PROMPT 1 shared utilities

### Files to Create
```
apps/provider/p-app/(dashboard)/availability.tsx
apps/provider/p-app/(dashboard)/stats.tsx
apps/provider/p-app/(dashboard)/referrals.tsx
apps/provider/p-app/(dashboard)/feedback.tsx
apps/provider/p-app/profile/edit.tsx
apps/provider/p-app/auth/login.tsx
packages/shared/hooks/useProviderAvailability.ts
```

### Key Component: Availability Toggle
```typescript
// apps/provider/p-app/(dashboard)/availability.tsx
import React, { useState } from 'react';
import { Button } from '@travelhealthbridge/shared';

export default function AvailabilityScreen({ provider_id }: any) {
  const [status, setStatus] = useState<'available' | 'busy'>('available');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleToggle = async () => {
    try {
      setLoading(true);
      const newStatus = status === 'available' ? 'busy' : 'available';
      
      // CRITICAL: Update Supabase in < 1 second
      const start = Date.now();
      const { error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id,
          status: newStatus,
          updated_at: new Date().toISOString(),
        });

      const elapsed = Date.now() - start;
      if (elapsed > 1000) {
        console.warn(`Availability update took ${elapsed}ms (target: <1s)`);
      }

      if (error) throw error;

      setStatus(newStatus);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Availability Status</h1>
      <Button
        label={status === 'available' ? '🟢 Available' : '🔴 Busy'}
        onClick={handleToggle}
        disabled={loading}
        variant={status === 'available' ? 'primary' : 'secondary'}
      />
      <p style={{ marginTop: '16px', color: '#666' }}>
        Last updated: {lastUpdate.toLocaleTimeString()}
      </p>
    </div>
  );
}
```

**Next Step**: After PROMPT 9, proceed to PROMPT 10 (Admin Console).

---

## PROMPT 10: ADMIN CONSOLE (apps/admin)
**Platform**: Next.js 14
**Estimated Time**: 18-20 hours
**6 Pages + DailySummaryCard on all pages**

### Page Overview

#### Page 1: Overview (Home)
```typescript
// apps/admin/app/(console)/page.tsx
import { DailySummaryCard } from '@travelhealthbridge/shared';
import { useAdminDailySummary } from '@travelhealthbridge/shared/api';

export default function OverviewPage() {
  const { data: summary } = useAdminDailySummary();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* DailySummaryCard visible on all pages */}
      <DailySummaryCard
        triage_sessions_today={summary?.triage_sessions_today ?? 0}
        non_covered_hits={summary?.non_covered_hits_today ?? 0}
        open_overcharges={summary?.open_overcharges ?? 0}
        open_p1_p2_cases={summary?.open_p1_p2_cases ?? 0}
      />

      {/* Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <MetricCard title="Displacement Rate" value={`${summary?.displacement_rate ?? 0}%`} />
        <MetricCard title="Reuse Intent" value={`${summary?.reuse_intent ?? 0}%`} />
        <MetricCard title="No-Answer Events (7d)" value={summary?.no_answer_events ?? 0} />
        <MetricCard title="City Coverage Gaps (7d)" value={summary?.city_gaps ?? 0} />
      </div>
    </div>
  );
}
```

#### Page 2: Providers
```typescript
// apps/admin/app/(console)/providers/page.tsx
import { useAdminProviders } from '@travelhealthbridge/shared/api';
import { DataTable, Button } from '@travelhealthbridge/shared';

export default function ProvidersPage() {
  const { data: providers } = useAdminProviders();

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'city_id', label: 'City' },
    { key: 'badge_status', label: 'Badge Status' },
    { key: 'staleness_tier', label: 'Staleness' },
    { key: 'strike_count', label: 'Strikes' },
    { key: 'actions', label: 'Actions', render: (provider) => (
      <div className="flex gap-2">
        <Button label="Award Badge" size="sm" />
        <Button label="Add Strike" size="sm" variant="danger" />
      </div>
    )},
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Providers</h2>
      <DataTable columns={columns} data={providers} />
    </div>
  );
}
```

**Complete implementation of all 6 pages would exceed token limit. See the full guide in the repo.**

**Next Step**: After PROMPT 10, proceed to PROMPT 11 (Analytics & App Store).

---

## PROMPT 11: ANALYTICS & APP STORE
**Platform**: All apps
**Estimated Time**: 10-12 hours

### PostHog Event Instrumentation

Add these 28 events throughout the codebase:

```typescript
// packages/shared/api/analytics.ts - EXPAND WITH ALL 28 EVENTS

import posthog from 'posthog-react-native'; // or 'posthog-js' for web

export function track(eventName: string, properties: Record<string, any> = {}) {
  posthog.capture(eventName, {
    ...properties,
    app_version: '1.0.0', // from package.json
    platform: Platform.OS, // 'ios' | 'android' | 'web'
    timestamp: new Date().toISOString(),
  });
}

// Usage examples:
track('app_opened', { source: 'home_screen' });
track('triage_started', { city_id: 'delhi' });
track('triage_step_completed', { step: 1, urgency: 'emergency' });
track('call_now_tapped', { provider_id: 'p123' });
track('sos_triggered', { city_id: 'delhi', has_emergency_contact: true });
track('feedback_submitted', { prior_source: 'Google Maps', displacement: true });
// ... 22 more events (see IMPLEMENTATION_MANIFEST.md section on Prompt 11)
```

### App Store Assets (to be created)

1. **Icon** (1024x1024): Design with THB logo + health cross
2. **Screenshots** (6x, Portrait):
   - Onboarding slide
   - Triage flow
   - Triage result
   - Provider profile
   - Medical vault
   - Emergency screen
3. **Descriptions**:
   - Short: "Find verified doctors in 6 cities, 24/7, free"
   - Long: "Travel Health Bridge connects travelers with verified doctors in 6 cities with 24-hour availability and emergency support"
4. **Privacy Page**:
   ```
   What gets deleted when you delete your account:
   - Your vault (blood group, medications, emergency contacts)
   - Your medical profile
   - Your saved providers list
   - Your emergency contact preferences

   What gets anonymized (NOT deleted):
   - Your triage sessions (questions you asked)
   - Your feedback (to track displacement and provider quality)
   - Your overcharge reports (to protect other travelers)
   - Your provider no-answer reports

   This data is anonymized (your phone number and name removed) so
   we can continue improving service for future travelers without
   affecting their ability to get help.
   ```

**Next Step**: After PROMPT 11, proceed to PROMPT 12 (Production Deployment).

---

## PROMPT 12: PRODUCTION DEPLOYMENT
**Estimated Time**: 6-8 hours
**Scope**: GitHub + Vercel + Supabase production setup

### GitHub Setup
```bash
git remote add origin https://github.com/your-org/travel-health-bridge-monorepo.git
git branch -M main
git push -u origin main

# Create branches
git checkout -b develop
git checkout -b feature/consumer-app
```

### Vercel Deployment

**Provider PWA** (apps/provider):
```bash
vercel --prod --cwd apps/provider --name providers --alias providers.travelhealthbridge.com
```

**Admin Console** (apps/admin):
```bash
vercel --prod --cwd apps/admin --name admin --alias admin.travelhealthbridge.com
```

### Supabase Production Setup

1. Create production database
2. Configure email templates for OTP + feedback reminders
3. Set up RLS policies on all tables
4. Configure backups (daily, 30-day retention)
5. Set up edge functions for heavy compute

### Verification Checklist

- [ ] Consumer app installs from Play Store
- [ ] Consumer app installs from App Store
- [ ] Provider PWA loads on providers.travelhealthbridge.com
- [ ] Admin console loads on admin.travelhealthbridge.com
- [ ] Phone auth works end-to-end
- [ ] Triage flow works offline and online
- [ ] Provider availability toggle updates < 1 second
- [ ] All 28 analytics events fire correctly
- [ ] Feedback notifications respect quiet hours
- [ ] Displacement calculation works correctly (0-100%)
- [ ] Vault deletion anonymizes data as specified

---

## FINAL CHECKLIST: PRE-LAUNCH

- [ ] All 12 prompts implemented and tested
- [ ] All environments (.env.local, Vercel, Supabase) configured
- [ ] All 3 apps deployed to production URLs
- [ ] 48-hour user acceptance testing completed
- [ ] Analytics dashboard set up and displaying data
- [ ] Support email and WhatsApp helpline configured
- [ ] Privacy policy and terms of service published
- [ ] App store listings (Play Store + App Store) approved
- [ ] Launch announcement ready (email, Twitter, LinkedIn)
- [ ] Day-to-day runbook created (who monitors what, incident response)

---

## Support & Troubleshooting

### Common Issues

**Issue**: Supabase auth OTP not sending
**Solution**: Check Twilio SMS configuration in Supabase settings

**Issue**: Ranking algorithm not working offline
**Solution**: Ensure WatermelonDB cache is populated with local providers

**Issue**: Vercel deployments not auto-triggering
**Solution**: Check GitHub Actions workflows and branch protection rules

For more help, refer to the original 48-page spec document or post in #dev-help on Slack.

---

**End of Implementation Guide**
**Total Estimated Development Time**: 80-100 hours (assuming experienced React/React Native developers)
**Recommendation**: Divide work across team or extend timeline as needed.
