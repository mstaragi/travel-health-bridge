/**
 * Travel Health Bridge — UI Library Static Verification
 * Checks all component files for required branding and spec compliance.
 * Run: node verify-ui.js
 */

const fs = require('fs');
const path = require('path');

const UI_DIR = path.resolve(__dirname, '../packages/shared/ui');

let passed = 0;
let failed = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function readFile(filename) {
  try {
    return fs.readFileSync(path.join(UI_DIR, filename), 'utf8');
  } catch (e) {
    console.error(`  ✗ MISSING FILE: ${filename}`);
    failed++;
    return '';
  }
}

function fileExists(filename) {
  return fs.existsSync(path.join(UI_DIR, filename));
}

console.log('\n═══ Travel Health Bridge — UI Library Verification ═══\n');

// ─── 1. All Files Exist ─────────────────────────────────────────────────────
console.log('[ 1 ] File existence checks');
const requiredFiles = [
  'tokens.ts', 'useTheme.ts', 'index.ts', 'Gallery.tsx',
  'Button.tsx', 'Card.tsx', 'Tag.tsx', 'LanguagePill.tsx',
  'Badge.tsx', 'OpenStatusBadge.tsx', 'Input.tsx', 'OTPInput.tsx',
  'Skeleton.tsx', 'Modal.tsx', 'Toast.tsx', 'HelplineCTA.tsx',
  'ProviderCard.tsx', 'OfflineProviderCard.tsx', 'FailureBottomSheet.tsx',
  'ConsentMessageModal.tsx', 'QuickCaseModal.tsx', 'DailySummaryCard.tsx',
];
requiredFiles.forEach(f => check(fileExists(f), `${f} exists`));

// ─── 2. Branding — No TravelMedix references ────────────────────────────────
console.log('\n[ 2 ] Branding: no "TravelMedix" in user-visible strings');
const brandingFiles = {
  'Badge.tsx':             { must: 'Travel Health Bridge Verified', mustNot: 'TravelMedix Verified' },
  'HelplineCTA.tsx':       { must: 'Travel Health Bridge helpline', mustNot: 'TravelMedix helpline' },
  'ConsentMessageModal.tsx': { must: 'Travel Health Bridge', mustNot: 'TravelMedix.' },
  'QuickCaseModal.tsx':    { must: 'THB-', mustNot: 'TM-' },
};
Object.entries(brandingFiles).forEach(([file, { must, mustNot }]) => {
  const content = readFile(file);
  check(content.includes(must), `${file}: contains "${must}"`);
  check(!content.includes(mustNot), `${file}: does NOT contain "${mustNot}"`);
});

// ─── 3. Design Tokens ───────────────────────────────────────────────────────
console.log('\n[ 3 ] Design tokens check (tokens.ts)');
const tokens = readFile('tokens.ts');
check(tokens.includes('navy'), 'tokens.ts: navy palette');
check(tokens.includes('teal'), 'tokens.ts: teal palette');
check(tokens.includes('blue'), 'tokens.ts: blue palette');
check(tokens.includes('red'), 'tokens.ts: red palette');
check(tokens.includes('amber'), 'tokens.ts: amber palette');
check(tokens.includes('green'), 'tokens.ts: green palette');
check(tokens.includes('gray'), 'tokens.ts: gray scale');
check(tokens.includes('lightTheme'), 'tokens.ts: lightTheme exported');
check(tokens.includes('darkTheme'), 'tokens.ts: darkTheme exported');
check(tokens.includes("primary:       palette.teal"), 'tokens.ts: primary = teal');
check(tokens.includes("danger:        palette.red"), 'tokens.ts: danger = red');
check(tokens.includes("warning:       palette.amber"), 'tokens.ts: warning = amber');
check(tokens.includes("success:       palette.green"), 'tokens.ts: success = green');
check(tokens.includes('languageColors'), 'tokens.ts: languageColors exported');

// ─── 4. useTheme hook ───────────────────────────────────────────────────────
console.log('\n[ 4 ] useTheme hook');
const useTheme = readFile('useTheme.ts');
check(useTheme.includes('useColorScheme'), 'useTheme.ts: uses useColorScheme hook');
check(useTheme.includes('lightTheme'), 'useTheme.ts: returns lightTheme');
check(useTheme.includes('darkTheme'), 'useTheme.ts: returns darkTheme');
check(useTheme.includes('isDark'), 'useTheme.ts: exposes isDark boolean');

// ─── 5. Button variants ──────────────────────────────────────────────────────
console.log('\n[ 5 ] Button component');
const button = readFile('Button.tsx');
check(button.includes("'primary'"), 'Button: primary variant');
check(button.includes("'secondary'"), 'Button: secondary variant');
check(button.includes("'danger'"), 'Button: danger variant');
check(button.includes("'ghost'"), 'Button: ghost variant');
check(button.includes("'emergency'"), 'Button: emergency variant');
check(button.includes('minHeight: 72'), 'Button: emergency minHeight=72px');
check(button.includes("width: '100%'"), 'Button: emergency full-width');
check(button.includes("fontSize['2xl']") || button.includes("fontSize['2xl']"), 'Button: emergency 24pt text');
check(button.includes('ActivityIndicator'), 'Button: loading spinner');
check(button.includes('disabled'), 'Button: disabled state');
check(button.includes('accessibilityLabel'), 'Button: accessibilityLabel');

// ─── 6. HelplineCTA ─────────────────────────────────────────────────────────
console.log('\n[ 6 ] HelplineCTA (CRITICAL)');
const hcta = readFile('HelplineCTA.tsx');
check(hcta.includes('Travel Health Bridge helpline'), 'HelplineCTA: correct label text');
check(hcta.includes('HELPLINE_WHATSAPP_NUMBER'), 'HelplineCTA: number rendered in plain text');
check(hcta.includes('always visible'), 'HelplineCTA: plain-text visibility comment');
check(hcta.includes('accessibilityLabel'), 'HelplineCTA: accessibility label');
check(hcta.includes('Message Travel Health Bridge helpline. Number:'), 'HelplineCTA: correct WhatsApp button accessibilityLabel');
check(hcta.includes('25D366'), 'HelplineCTA: WhatsApp green button');

// ─── 7. ProviderCard ─────────────────────────────────────────────────────────
console.log('\n[ 7 ] ProviderCard');
const pc = readFile('ProviderCard.tsx');
check(pc.includes('LanguagePill'), 'ProviderCard: LanguagePill[]');
check(pc.includes('OpenStatusBadge'), 'ProviderCard: OpenStatusBadge');
check(pc.includes('Badge'), 'ProviderCard: VerifiedBadge');
check(pc.includes('formatFeeRange'), 'ProviderCard: formatFee');
check(pc.includes('distanceKm'), 'ProviderCard: distance prop');
check(pc.includes("staleness_tier === 'stale'"), 'ProviderCard: stale label check');
check(pc.includes('Availability recently unconfirmed'), 'ProviderCard: amber staleness text');

// ─── 8. OfflineProviderCard ──────────────────────────────────────────────────
console.log('\n[ 8 ] OfflineProviderCard');
const opc = readFile('OfflineProviderCard.tsx');
check(opc.includes('amber'), 'OfflineProviderCard: amber border reference');
check(opc.includes('last_synced_at'), 'OfflineProviderCard: cache timestamp field');
check(opc.includes('Call ahead before visiting'), 'OfflineProviderCard: call ahead text');

// ─── 9. OpenStatusBadge ──────────────────────────────────────────────────────
console.log('\n[ 9 ] OpenStatusBadge');
const osb = readFile('OpenStatusBadge.tsx');
check(osb.includes("'open'"), 'OpenStatusBadge: open state');
check(osb.includes("'opening_soon'"), 'OpenStatusBadge: opening_soon state');
check(osb.includes("'closed'"), 'OpenStatusBadge: closed state');
check(osb.includes("'unconfirmed'"), 'OpenStatusBadge: unconfirmed state');
check(osb.includes('Availability unconfirmed'), 'OpenStatusBadge: unconfirmed label text');

// ─── 10. OTPInput ─────────────────────────────────────────────────────────
console.log('\n[ 10 ] OTPInput');
const otp = readFile('OTPInput.tsx');
check(otp.includes('OTP_LENGTH = 6'), 'OTPInput: 6 digits');
check(otp.includes('auto-advance'), 'OTPInput: auto-advance comment');
check(otp.includes('auto-submit'), 'OTPInput: auto-submit comment');
check(otp.includes('Paste'), 'OTPInput: paste support');
check(otp.includes('textContentType'), "OTPInput: textContentType='oneTimeCode'");

// ─── 11. Modal (bottom sheet) ────────────────────────────────────────────────
console.log('\n[ 11 ] Modal (bottom sheet)');
const modal = readFile('Modal.tsx');
check(modal.includes('react-native-reanimated'), 'Modal: uses react-native-reanimated');
check(modal.includes('withSpring'), 'Modal: spring animation');
check(modal.includes('translateY'), 'Modal: translateY slide-up animation');
check(modal.includes('backdropOpacity'), 'Modal: backdrop overlay');

// ─── 12. Toast ──────────────────────────────────────────────────────────────
console.log('\n[ 12 ] Toast (imperative)');
const toast = readFile('Toast.tsx');
check(toast.includes("Toast.show"), 'Toast: imperative Toast.show API');
check(toast.includes("'success'"), "Toast: success type");
check(toast.includes("'error'"), "Toast: error type");
check(toast.includes("'info'"), "Toast: info type");
check(toast.includes('ToastProvider'), 'Toast: ToastProvider component');

// ─── 13. Skeleton ────────────────────────────────────────────────────────────
console.log('\n[ 13 ] Skeleton');
const skeleton = readFile('Skeleton.tsx');
check(skeleton.includes('withRepeat'), 'Skeleton: animated shimmer (withRepeat)');
check(skeleton.includes('ProviderCardSkeleton'), 'Skeleton: ProviderCardSkeleton exported');

// ─── 14. ConsentMessageModal ─────────────────────────────────────────────────
console.log('\n[ 14 ] ConsentMessageModal');
const consent = readFile('ConsentMessageModal.tsx');
check(consent.includes('Travel Health Bridge'), 'ConsentMessageModal: Travel Health Bridge branding');
check(consent.includes('Send this message to'), 'ConsentMessageModal: primary button text');
check(consent.includes("Don't send"), "ConsentMessageModal: cancel link text");
check(consent.includes("opens WhatsApp for you to send — not automatic"), 'ConsentMessageModal: consent note exact text');
check(consent.includes('contactName'), 'ConsentMessageModal: contactName prop');
check(consent.includes('providerName'), 'ConsentMessageModal: providerName prop');

// ─── 15. FailureBottomSheet ──────────────────────────────────────────────────
console.log('\n[ 15 ] FailureBottomSheet');
const fbs = readFile('FailureBottomSheet.tsx');
check(fbs.includes('onTryAlternative'), 'FailureBottomSheet: onTryAlternative prop');
check(fbs.includes('onOpenHelpline'), 'FailureBottomSheet: onOpenHelpline prop');
check(fbs.includes('onSearchAll'), 'FailureBottomSheet: onSearchAll prop');
check(fbs.includes('Try alternative'), 'FailureBottomSheet: option 1 text');
check(fbs.includes('Message'), 'FailureBottomSheet: option 2 text');
check(fbs.includes('Search all'), 'FailureBottomSheet: option 3 text');

// ─── 16. QuickCaseModal ──────────────────────────────────────────────────────
console.log('\n[ 16 ] QuickCaseModal (Admin)');
const qcm = readFile('QuickCaseModal.tsx');
check(qcm.includes('THB-'), 'QuickCaseModal: THB- case ID prefix');
check(!qcm.includes('TM-'), 'QuickCaseModal: no TM- prefix');
check(qcm.includes("'P1'"), 'QuickCaseModal: P1 severity');
check(qcm.includes("'P2'"), 'QuickCaseModal: P2 severity');
check(qcm.includes("'P3'"), 'QuickCaseModal: P3 severity');
check(qcm.includes("'P4'"), 'QuickCaseModal: P4 severity');
check(qcm.includes('WHATSAPP_CASE_CATEGORIES'), 'QuickCaseModal: 8 category chips');
check(qcm.includes('opened_at'), 'QuickCaseModal: auto-generates opened_at');

// ─── 17. DailySummaryCard ────────────────────────────────────────────────────
console.log('\n[ 17 ] DailySummaryCard (Admin)');
const dsc = readFile('DailySummaryCard.tsx');
check(dsc.includes('triage_sessions_today'), 'DailySummaryCard: triage_sessions_today tile');
check(dsc.includes('non_covered_hits_today'), 'DailySummaryCard: non_covered_hits_today tile');
check(dsc.includes('open_overcharges'), 'DailySummaryCard: open_overcharges tile');
check(dsc.includes('open_p1_p2_cases'), 'DailySummaryCard: open_p1_p2_cases tile');
check(dsc.includes('useTheme'), 'DailySummaryCard: dark mode via useTheme');
check(dsc.includes('Auto-refreshes every 5 minutes'), 'DailySummaryCard: 5-min refresh note');

// ─── 18. Gallery Screen ──────────────────────────────────────────────────────
console.log('\n[ 18 ] Gallery (verification screen)');
const gallery = readFile('Gallery.tsx');
check(gallery.includes('Travel Health Bridge'), 'Gallery: Travel Health Bridge heading');
check(gallery.includes('UI Component Gallery'), 'Gallery: gallery subtitle');
check(gallery.includes('HelplineCTA'), 'Gallery: HelplineCTA rendered');
check(gallery.includes('plain text'), 'Gallery: plain text number verification note');
check(gallery.includes('ConsentMessageModal'), 'Gallery: ConsentMessageModal rendered');
check(gallery.includes('QuickCaseModal'), 'Gallery: QuickCaseModal rendered');
check(gallery.includes('DailySummaryCard'), 'Gallery: DailySummaryCard rendered');
check(gallery.includes('isDark'), 'Gallery: dark mode indicator shown');

// ─── 19. Barrel Export (index.ts) ────────────────────────────────────────────
console.log('\n[ 19 ] Barrel export (index.ts)');
const barrel = readFile('index.ts');
const allExports = [
  'Button', 'Card', 'Tag', 'LanguagePill', 'Badge',
  'OpenStatusBadge', 'Input', 'OTPInput', 'Skeleton', 'ProviderCardSkeleton',
  'Modal', 'Toast', 'ToastProvider', 'HelplineCTA',
  'ProviderCard', 'OfflineProviderCard', 'FailureBottomSheet',
  'ConsentMessageModal', 'QuickCaseModal', 'DailySummaryCard',
  'Gallery', 'useTheme', 'palette', 'lightTheme', 'darkTheme',
  'typography', 'spacing', 'borderRadius', 'shadows', 'languageColors',
];
allExports.forEach(name => {
  check(barrel.includes(name), `index.ts: exports ${name}`);
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════\n');
const total = passed + failed;
console.log(`Results: ${passed}/${total} checks passed`);
if (failed > 0) {
  console.error(`\n${failed} check(s) FAILED — fix before shipping\n`);
  process.exit(1);
} else {
  console.log('\n✓ All checks passed. UI library verified.\n');
}
