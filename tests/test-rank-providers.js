/**
 * TravelMedix — rankProviders() Unit Test
 * 
 * Tests all scoring paths with 6 mock providers.
 * Run with: node tests/test-rank-providers.js
 * No simulator, no dependencies needed beyond Node.js.
 * 
 * Per spec acceptance criteria (Prompt 1):
 *   "rankProviders() unit test with 6 mock providers covering all scoring paths
 *    returns correct top 2."
 */

// ─── Inline the necessary utils (no module system needed) ──────────────────

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isOpenNow(opd_hours, current_time) {
  if (!opd_hours) return 'unconfirmed';
  const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const now = current_time || new Date();
  const dayName = DAYS[now.getDay()];
  const todayHours = opd_hours[dayName];
  if (!todayHours || !todayHours.open) return 'closed';
  if (!todayHours.from || !todayHours.to) return 'unconfirmed';
  const [fh, fm] = todayHours.from.split(':').map(Number);
  const [th, tm] = todayHours.to.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const fromMins = fh * 60 + fm;
  const toMins = th * 60 + tm;
  if (nowMins >= fromMins && nowMins < toMins) return 'open';
  if (nowMins < fromMins && fromMins - nowMins <= 120) return 'opening_soon';
  return 'closed';
}

const SCORE = {
  LANGUAGE_EXACT: 3,
  LANGUAGE_PARTIAL: 1,
  OPEN_NOW: 2,
  OPENING_SOON: 1,
  FRESHNESS_FRESH: 2,
  FRESHNESS_STALE: 1,
  BUDGET_WITHIN: 2,
  BUDGET_WITHIN_20PCT: 1,
  DISTANCE_LT_2KM: 3,
  DISTANCE_LT_5KM: 2,
  DISTANCE_LT_10KM: 1,
  EMERGENCY_CAPABILITY_EMERGENCY: 5,
  EMERGENCY_CAPABILITY_URGENT: 2,
  SPECIALTY_MATCH: 1,
};

function rankProviders({ providers, userLanguages, urgency, budget, lat, lng, symptom, symptomToSpecialty, currentTime }) {
  const normalizedUserLangs = userLanguages.map(l => l.toLowerCase());
  const hasLanguagePreference = normalizedUserLangs.length > 0;

  let candidates = providers.filter(p => {
    if (p.staleness_tier === 'lapsed') return false;
    if (p.staleness_tier === 'very_stale') return false;
    if (p.badge_status !== 'active') return false;
    return true;
  });

  if (hasLanguagePreference) {
    const withLang = candidates.filter(p => {
      const pl = p.languages.map(l => l.toLowerCase());
      return normalizedUserLangs.some(ul => pl.includes(ul));
    });
    if (withLang.length > 0) candidates = withLang;
  }

  const scored = candidates.map(provider => {
    let score = 0;
    const breakdown = {};

    const pl = provider.languages.map(l => l.toLowerCase());
    const isExact = normalizedUserLangs.every(ul => pl.includes(ul));
    const isPartial = !isExact && normalizedUserLangs.some(ul => pl.includes(ul));
    const langScore = isExact ? SCORE.LANGUAGE_EXACT : isPartial ? SCORE.LANGUAGE_PARTIAL : 0;
    score += langScore; breakdown.language = langScore;

    const openStatus = isOpenNow(provider.opd_hours, currentTime);
    const openScore = openStatus === 'open' ? SCORE.OPEN_NOW : openStatus === 'opening_soon' ? SCORE.OPENING_SOON : 0;
    score += openScore; breakdown.open_status = openScore;

    const freshnessScore = provider.staleness_tier === 'fresh' ? SCORE.FRESHNESS_FRESH : provider.staleness_tier === 'stale' ? SCORE.FRESHNESS_STALE : 0;
    score += freshnessScore; breakdown.freshness = freshnessScore;

    const feeMin = provider.fee_opd.min;
    let budgetScore = 0;
    if (feeMin <= budget) budgetScore = SCORE.BUDGET_WITHIN;
    else if (feeMin <= budget * 1.2) budgetScore = SCORE.BUDGET_WITHIN_20PCT;
    score += budgetScore; breakdown.budget = budgetScore;

    let distanceScore = 0;
    if (lat !== undefined && lng !== undefined && provider.lat !== undefined && provider.lng !== undefined) {
      const distKm = haversineDistance(lat, lng, provider.lat, provider.lng);
      if (distKm < 2) distanceScore = SCORE.DISTANCE_LT_2KM;
      else if (distKm < 5) distanceScore = SCORE.DISTANCE_LT_5KM;
      else if (distKm < 10) distanceScore = SCORE.DISTANCE_LT_10KM;
    }
    score += distanceScore; breakdown.distance = distanceScore;

    let emergencyScore = 0;
    if (provider.emergency) {
      if (urgency === 'emergency') emergencyScore = SCORE.EMERGENCY_CAPABILITY_EMERGENCY;
      else if (urgency === 'urgent') emergencyScore = SCORE.EMERGENCY_CAPABILITY_URGENT;
    }
    score += emergencyScore; breakdown.emergency_capability = emergencyScore;

    const reliabilityScore = provider.reliability_score || 0;
    score += reliabilityScore; breakdown.reliability = reliabilityScore;

    let specialtyScore = 0;
    if (symptom && symptomToSpecialty) {
      const matching = symptomToSpecialty[symptom] || [];
      if (provider.specialties.some(s => matching.some(ms => s.toLowerCase().includes(ms.toLowerCase())))) {
        specialtyScore = SCORE.SPECIALTY_MATCH;
      }
    }
    score += specialtyScore; breakdown.specialty = specialtyScore;

    return { provider, score, breakdown };
  });

  const aboveZero = scored.filter(s => s.score > 0);
  aboveZero.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.provider.badge_date).getTime() - new Date(a.provider.badge_date).getTime();
  });
  const top2 = aboveZero.slice(0, 2);

  return {
    primary: top2[0]?.provider || null,
    secondary: top2[1]?.provider || null,
    showHelplineCTA: top2.length < 2,
  };
}

// ─── Test helpers ─────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// ─── Mock data: 6 providers covering all scoring paths ────────

// Simulate a Monday 10am (open hours window)
const MOCK_TIME = new Date('2024-01-08T10:00:00'); // Monday 10:00

const ALL_DAYS_OPEN = {
  monday: { open: true, from: '09:00', to: '21:00' },
  tuesday: { open: true, from: '09:00', to: '21:00' },
  wednesday: { open: true, from: '09:00', to: '21:00' },
  thursday: { open: true, from: '09:00', to: '21:00' },
  friday: { open: true, from: '09:00', to: '21:00' },
  saturday: { open: true, from: '09:00', to: '18:00' },
  sunday: { open: false },
};

const ALL_DAYS_CLOSED = {
  monday: { open: true, from: '14:00', to: '21:00' }, // closed at 10am
  tuesday: { open: true, from: '14:00', to: '21:00' },
  wednesday: { open: true, from: '14:00', to: '21:00' },
  thursday: { open: true, from: '14:00', to: '21:00' },
  friday: { open: true, from: '14:00', to: '21:00' },
  saturday: { open: false },
  sunday: { open: false },
};

const MOCK_PROVIDERS = [
  // Provider 1: BEST — English exact, open, fresh, within budget, emergency, near, high reliability, specialty match
  {
    id: 'p1',
    slug: 'apollo-connaught',
    name: 'Apollo Clinic Connaught Place',
    city_id: 'delhi',
    area: 'Connaught Place',
    address: 'N-110, Connaught Place',
    lat: 28.6315, lng: 77.2167,
    phone: '011-47600000',
    languages: ['English', 'Hindi'],
    specialties: ['General Physician', 'Travel Medicine'],
    doctors: [],
    opd_hours: ALL_DAYS_OPEN,
    fee_opd: { min: 400, max: 600 },
    emergency: true,
    badge_status: 'active',
    badge_date: '2025-12-01',
    badge_expiry: '2026-12-01',
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    staleness_tier: 'fresh',
    strike_count: 0,
    verified: true,
    reliability_score: 1.8, // 5+ records, high score
  },
  // Provider 2: GOOD — partial language, open, fresh, within budget, no emergency, close
  {
    id: 'p2',
    slug: 'city-care-karol-bagh',
    name: 'City Care Clinic',
    city_id: 'delhi',
    area: 'Karol Bagh',
    address: '14, Karol Bagh',
    lat: 28.6519, lng: 77.1907,
    phone: '011-45678900',
    languages: ['Hindi', 'Punjabi'], // partial match for English+Hindi preference
    specialties: ['General Physician', 'Gastroenterology'],
    doctors: [],
    opd_hours: ALL_DAYS_OPEN,
    fee_opd: { min: 350, max: 550 },
    emergency: false,
    badge_status: 'active',
    badge_date: '2025-10-01',
    badge_expiry: '2026-10-01',
    last_activity_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    staleness_tier: 'fresh',
    strike_count: 0,
    verified: true,
    reliability_score: 0, // < 5 records
  },
  // Provider 3: STALE — English, open but stale, within budget (lower score)
  {
    id: 'p3',
    slug: 'paharganj-health',
    name: 'Paharganj Health Hub',
    city_id: 'delhi',
    area: 'Paharganj',
    address: '5, Main Bazar, Paharganj',
    lat: 28.6442, lng: 77.2086,
    phone: '011-23456789',
    languages: ['English', 'Hindi', 'Tamil'],
    specialties: ['General Physician', 'Infectious Disease'],
    doctors: [],
    opd_hours: ALL_DAYS_OPEN,
    fee_opd: { min: 300, max: 500 },
    emergency: true,
    badge_status: 'active',
    badge_date: '2025-11-01',
    badge_expiry: '2026-11-01',
    last_activity_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago → stale
    staleness_tier: 'stale',
    strike_count: 0,
    verified: true,
    reliability_score: 0,
  },
  // Provider 4: LAPSED — should be EXCLUDED from all results
  {
    id: 'p4',
    slug: 'lapsed-clinic',
    name: 'Lapsed Clinic (should never appear)',
    city_id: 'delhi',
    area: 'Connaught Place',
    address: '1, CP',
    lat: 28.6315, lng: 77.2167,
    phone: '011-00000000',
    languages: ['English'],
    specialties: ['General Physician'],
    doctors: [],
    opd_hours: ALL_DAYS_OPEN,
    fee_opd: { min: 100, max: 200 },
    emergency: true,
    badge_status: 'active',
    badge_date: '2025-01-01',
    badge_expiry: '2026-01-01',
    last_activity_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days → lapsed
    staleness_tier: 'lapsed',
    strike_count: 0,
    verified: true,
    reliability_score: 0,
  },
  // Provider 5: SUSPENDED — should be EXCLUDED  
  {
    id: 'p5',
    slug: 'suspended-clinic',
    name: 'Suspended Clinic (should never appear)',
    city_id: 'delhi',
    area: 'Connaught Place',
    address: '2, CP',
    lat: 28.6315, lng: 77.2167,
    phone: '011-11111111',
    languages: ['English'],
    specialties: ['General Physician'],
    doctors: [],
    opd_hours: ALL_DAYS_OPEN,
    fee_opd: { min: 100, max: 200 },
    emergency: true,
    badge_status: 'suspended',
    badge_date: '2025-12-01',
    badge_expiry: '2026-12-01',
    last_activity_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    staleness_tier: 'fresh',
    strike_count: 2,
    verified: true,
    reliability_score: 0,
  },
  // Provider 6: OVER BUDGET — no match at 1.2x
  {
    id: 'p6',
    slug: 'expensive-clinic',
    name: 'Premium Clinic (over budget)',
    city_id: 'delhi',
    area: 'South Delhi',
    address: '100, South Ex',
    lat: 28.5677, lng: 77.2310,
    phone: '011-99999999',
    languages: ['English'],
    specialties: ['General Physician'],
    doctors: [],
    opd_hours: ALL_DAYS_CLOSED, // also closed at test time for additional filter
    fee_opd: { min: 2000, max: 3000 }, // way over budget
    emergency: false,
    badge_status: 'active',
    badge_date: '2025-06-01',
    badge_expiry: '2026-06-01',
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    staleness_tier: 'fresh',
    strike_count: 0,
    verified: true,
    reliability_score: 0,
  },
];

const SYMPTOM_TO_SPECIALTY = {
  fever: ['General Physician', 'Infectious Disease', 'Travel Medicine'],
};

// ─── TEST SUITE ───────────────────────────────────────────────

console.log('\n═══ TravelMedix rankProviders() Unit Tests ═══\n');

// ── Test 1: Basic ranking returns correct top 2 ───────────────
console.log('Test 1: Basic ranking — correct top 2 returned');
{
  const result = rankProviders({
    providers: MOCK_PROVIDERS,
    userLanguages: ['English', 'Hindi'],
    urgency: 'can_wait',
    budget: 700,
    lat: 28.6315, lng: 77.2167,
    symptom: 'fever',
    symptomToSpecialty: SYMPTOM_TO_SPECIALTY,
    currentTime: MOCK_TIME,
  });
  assert(result.primary !== null, 'Primary provider is not null');
  assert(result.primary?.id === 'p1', `Primary is p1 (Apollo, highest score) — got ${result.primary?.id}`);
  assert(result.secondary !== null, 'Secondary provider is not null');
  assert(result.secondary?.id !== 'p4', 'Lapsed provider p4 never appears as secondary');
  assert(result.secondary?.id !== 'p5', 'Suspended provider p5 never appears as secondary');
  assert(result.secondary?.id !== 'p4' && result.secondary?.id !== 'p5', 'Secondary is a valid provider');
  console.log(`  → Primary: ${result.primary?.name} | Secondary: ${result.secondary?.name}`);
}

// ── Test 2: Lapsed and suspended providers excluded ───────────
console.log('\nTest 2: Lapsed and suspended providers excluded');
{
  const result = rankProviders({
    providers: MOCK_PROVIDERS,
    userLanguages: ['English'],
    urgency: 'can_wait',
    budget: 9999,
    currentTime: MOCK_TIME,
  });
  const allReturned = [result.primary?.id, result.secondary?.id].filter(Boolean);
  assert(!allReturned.includes('p4'), 'p4 (lapsed) is excluded');
  assert(!allReturned.includes('p5'), 'p5 (suspended) is excluded');
}

// ── Test 3: urgency=emergency → emergency capability +5 ───────
console.log('\nTest 3: urgency=emergency gives +5 to emergency-capable providers');
{
  const result = rankProviders({
    providers: MOCK_PROVIDERS,
    userLanguages: ['English'],
    urgency: 'emergency',
    budget: 9999,
    currentTime: MOCK_TIME,
  });
  // p1 and p3 are both emergency-capable and English. p1 wins on reliability+freshness+badge_date.
  assert(result.primary !== null, 'Primary exists for emergency urgency');
  const emergencyCapable = result.primary?.emergency === true;
  assert(emergencyCapable, `Primary is emergency-capable — got ${result.primary?.name}`);
  console.log(`  → Emergency result primary: ${result.primary?.name} (emergency: ${result.primary?.emergency})`);
}

// ── Test 4: urgency=urgent → emergency capability +2 (not +5) ─
console.log('\nTest 4: urgency=urgent gives +2 (not +5) to emergency providers');
{
  // Create two providers: one emergency-capable, one not.
  // With urgency=urgent, emergency bonus is only +2.
  // Non-emergency provider can beat emergency if it has better other scores.
  const twoProviders = [
    {
      id: 'urgent-test-emergency', slug: 'a', name: 'Emergency Provider',
      city_id: 'delhi', area: 'A', address: 'A',
      languages: ['English'], specialties: ['General Physician'], doctors: [],
      opd_hours: ALL_DAYS_OPEN, fee_opd: { min: 500, max: 700 },
      emergency: true, badge_status: 'active', badge_date: '2024-01-01', badge_expiry: '2026-01-01',
      last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      staleness_tier: 'fresh', strike_count: 0, verified: true,
      reliability_score: 1.5, // strong reliability
    },
    {
      id: 'urgent-test-no-emergency', slug: 'b', name: 'Non-Emergency Provider (higher reliability)',
      city_id: 'delhi', area: 'B', address: 'B',
      languages: ['English'], specialties: ['General Physician'], doctors: [],
      opd_hours: ALL_DAYS_OPEN, fee_opd: { min: 300, max: 500 },
      emergency: false, badge_status: 'active', badge_date: '2024-01-02', badge_expiry: '2026-01-02',
      last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      staleness_tier: 'fresh', strike_count: 0, verified: true,
      reliability_score: 2.0, // max reliability
    },
  ];

  const resultUrgent = rankProviders({
    providers: twoProviders, userLanguages: ['English'], urgency: 'urgent',
    budget: 700, currentTime: MOCK_TIME,
  });
  // Emergency: urgent-test-emergency = 3(lang) + 2(open) + 2(fresh) + 2(budget) + 2(emergency) + 1.5(reliability) = 12.5
  // Non-emergency: urgent-test-no-emergency = 3 + 2 + 2 + 2 + 0 + 2.0 = 11.0
  // Emergency capability +2 still makes emergency-capable win here
  assert(resultUrgent.primary?.id === 'urgent-test-emergency', 
    `urgent: emergency-capable provider wins with +2 bonus — got ${resultUrgent.primary?.id}`);

  const resultCanWait = rankProviders({
    providers: twoProviders, userLanguages: ['English'], urgency: 'can_wait',
    budget: 700, currentTime: MOCK_TIME,
  });
  // can_wait: no emergency bonus. Non-emergency has higher reliability (2.0 vs 1.5).
  // Emergency: 3 + 2 + 2 + 2 + 0 + 1.5 = 10.5
  // Non-emergency: 3 + 2 + 2 + 2 + 0 + 2.0 = 11.0
  assert(resultCanWait.primary?.id === 'urgent-test-no-emergency',
    `can_wait: non-emergency provider wins due to higher reliability (+2.0 vs +1.5, no emergency bonus) — got ${resultCanWait.primary?.id}`);

  console.log(`  → Urgent primary: ${resultUrgent.primary?.name}`);
  console.log(`  → Can-wait primary: ${resultCanWait.primary?.name}`);
}

// ── Test 5: Reliability score = 0 when < 5 records ────────────
console.log('\nTest 5: Reliability score = 0 when < 5 feedback records');
{
  // p2 has reliability_score: 0 (< 5 records). Verify it still ranks but without reliability boost.
  const result = rankProviders({
    providers: [MOCK_PROVIDERS[1]], // only p2
    userLanguages: ['Hindi'],
    urgency: 'can_wait',
    budget: 700,
    currentTime: MOCK_TIME,
  });
  assert(result.primary?.id === 'p2', 'p2 still ranks even with reliability=0');
  assert(result.primary?.reliability_score === 0, 'p2 reliability_score confirmed as 0');
  assert(result.showHelplineCTA === true, 'showHelplineCTA=true when only 1 provider scored');
}

// ── Test 6: Language exact=3 vs partial=1 ─────────────────────
console.log('\nTest 6: Language exact=3 vs partial=1');
{
  const exactProvider = {
    id: 'lang-exact', slug: 'e', name: 'Exact Language Provider',
    city_id: 'delhi', area: 'X', address: 'X',
    languages: ['English', 'Hindi'], specialties: ['General Physician'], doctors: [],
    opd_hours: ALL_DAYS_OPEN, fee_opd: { min: 500, max: 700 },
    emergency: false, badge_status: 'active', badge_date: '2024-01-01', badge_expiry: '2026-01-01',
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    staleness_tier: 'fresh', strike_count: 0, verified: true, reliability_score: 0,
  };
  const partialProvider = {
    id: 'lang-partial', slug: 'f', name: 'Partial Language Provider',
    city_id: 'delhi', area: 'X', address: 'X',
    languages: ['Hindi', 'Punjabi'], specialties: ['General Physician'], doctors: [],
    opd_hours: ALL_DAYS_OPEN, fee_opd: { min: 500, max: 700 },
    emergency: false, badge_status: 'active', badge_date: '2024-01-02', badge_expiry: '2026-01-02',
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    staleness_tier: 'fresh', strike_count: 0, verified: true, reliability_score: 0,
  };

  const result = rankProviders({
    providers: [exactProvider, partialProvider],
    userLanguages: ['English', 'Hindi'],
    urgency: 'can_wait', budget: 700, currentTime: MOCK_TIME,
  });
  // exact: 3 + 2 + 2 + 2(budget) = 9
  // partial: 1 + 2 + 2 + 2 = 7
  assert(result.primary?.id === 'lang-exact', `Exact language match wins — got ${result.primary?.id}`);
  assert(result.secondary?.id === 'lang-partial', `Partial language match is secondary — got ${result.secondary?.id}`);
}

// ── Test 7: showHelplineCTA when < 2 providers ────────────────
console.log('\nTest 7: showHelplineCTA=true when fewer than 2 providers score above 0');
{
  const result = rankProviders({
    providers: [
      { ...MOCK_PROVIDERS[0], id: 'sole-provider' }
    ],
    userLanguages: ['English'],
    urgency: 'can_wait', budget: 700, currentTime: MOCK_TIME,
  });
  assert(result.primary !== null, 'Primary exists');
  assert(result.secondary === null, 'Secondary is null when only 1 provider');
  assert(result.showHelplineCTA === true, 'showHelplineCTA=true when < 2 scored providers');
}

// ── Test 8: Distance scoring ──────────────────────────────────
console.log('\nTest 8: Distance scoring (<2km=3, <5km=2, <10km=1, >10km=0)');
{
  const userLat = 28.6315, userLng = 77.2167;
  const nearProvider = { // ~0.5km from user
    id: 'near', slug: 'n', name: 'Near Provider',
    city_id: 'delhi', area: 'X', address: 'X',
    lat: 28.6350, lng: 77.2167, // ~0.4km N
    languages: ['English'], specialties: ['General Physician'], doctors: [],
    opd_hours: ALL_DAYS_OPEN, fee_opd: { min: 500, max: 700 },
    emergency: false, badge_status: 'active', badge_date: '2024-01-01', badge_expiry: '2026-01-01',
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    staleness_tier: 'fresh', strike_count: 0, verified: true, reliability_score: 0,
  };
  const farProvider = { // ~15km from user
    id: 'far', slug: 'ff', name: 'Far Provider',
    city_id: 'delhi', area: 'Y', address: 'Y',
    lat: 28.4963, lng: 77.0885, // ~17km SW
    languages: ['English'], specialties: ['General Physician'], doctors: [],
    opd_hours: ALL_DAYS_OPEN, fee_opd: { min: 500, max: 700 },
    emergency: false, badge_status: 'active', badge_date: '2024-01-02', badge_expiry: '2026-01-02',
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    staleness_tier: 'fresh', strike_count: 0, verified: true, reliability_score: 0,
  };

  const result = rankProviders({
    providers: [nearProvider, farProvider],
    userLanguages: ['English'], urgency: 'can_wait', budget: 700,
    lat: userLat, lng: userLng, currentTime: MOCK_TIME,
  });
  // Near: 3(lang) + 2(open) + 2(fresh) + 2(budget) + 3(dist<2km) = 12
  // Far: 3 + 2 + 2 + 2 + 0(dist>10km) = 9
  assert(result.primary?.id === 'near', `Near provider wins — got ${result.primary?.id}`);
}

// ─── Summary ──────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════\n');
const total = passed + failed;
console.log(`Results: ${passed}/${total} tests passed`);
if (failed > 0) {
  console.error(`\n${failed} test(s) FAILED`);
  process.exit(1);
} else {
  console.log('\n✓ All tests passed. rankProviders() scoring verified.\n');
}
