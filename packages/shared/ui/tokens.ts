/**
 * Travel Health Bridge — Design Tokens
 * Single source of truth for all visual constants.
 * Dark mode variants via useColorScheme hook.
 */

// ── Colour Palette ────────────────────────────────────────────

export const palette = {
  navy: {
    50:  '#E8EEF4',
    100: '#C5D3E0',
    200: '#9FB5C9',
    300: '#7997B2',
    400: '#5C80A0',
    500: '#3F698F',
    600: '#31598A',
    700: '#1E4078',
    800: '#162D5C',
    900: '#0D2137',
  },
  teal: {
    50:  '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688',
    600: '#00897B',
    700: '#00796B',
    800: '#00695C',
    900: '#004D40',
  },
  blue: {
    50:  '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  red: {
    50:  '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  amber: {
    50:  '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#F57F17',
  },
  green: {
    50:  '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  gray: {
    0:   '#FFFFFF',
    50:  '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#121212',
  },
} as const;

// ── Light Theme Tokens ────────────────────────────────────────

export const lightTheme = {
  // Semantic colours
  primary:       palette.teal[700],
  primaryLight:  palette.teal[100],
  primaryDark:   palette.teal[900],
  danger:        palette.red[700],
  dangerLight:   palette.red[100],
  warning:       palette.amber[700],
  warningLight:  palette.amber[100],
  success:       palette.green[700],
  successLight:  palette.green[100],
  info:          palette.blue[700],
  infoLight:     palette.blue[100],

  // Surface colours
  background:    palette.gray[50],
  surface:       palette.gray[0],
  surfaceRaised: palette.gray[50],
  border:        palette.gray[200],
  borderStrong:  palette.gray[300],
  divider:       palette.gray[200],

  // Text colours
  textPrimary:   palette.gray[900],
  textSecondary: palette.gray[600],
  textTertiary:  palette.gray[500],
  textDisabled:  palette.gray[400],
  textInverse:   palette.gray[0],
  textDanger:    palette.red[700],
  textSuccess:   palette.green[700],
  textWarning:   palette.amber[900],

  // Button colours
  buttonPrimary:      palette.teal[700],
  buttonPrimaryText:  palette.gray[0],
  buttonSecondary:    palette.gray[0],
  buttonSecondaryText: palette.teal[700],
  buttonSecondaryBorder: palette.teal[700],
  buttonDanger:       palette.red[700],
  buttonDangerText:   palette.gray[0],
  buttonGhost:        'transparent',
  buttonGhostText:    palette.teal[700],
  buttonEmergency:    palette.red[600],
  buttonEmergencyText: palette.gray[0],
  buttonDisabled:     palette.gray[200],
  buttonDisabledText: palette.gray[400],

  // Component specific
  cardBackground:     palette.gray[0],
  cardShadow:         palette.gray[400],
  skeletonBase:       palette.gray[200],
  skeletonHighlight:  palette.gray[100],
  inputBackground:    palette.gray[0],
  inputBorder:        palette.gray[300],
  inputFocusBorder:   palette.teal[700],
  inputErrorBorder:   palette.red[700],
  overlayBackground:  'rgba(0,0,0,0.5)',

  // Status badge colours
  openBg:            '#E8F5E9',
  openText:          palette.green[800],
  openBorder:        palette.green[300],
  openingSoonBg:     '#FFF8E1',
  openingSoonText:   palette.amber[900],
  openingSoonBorder: palette.amber[300],
  closedBg:         '#FFEBEE',
  closedText:        palette.red[800],
  closedBorder:      palette.red[200],
  unconfirmedBg:    palette.gray[100],
  unconfirmedText:  palette.gray[600],
  unconfirmedBorder: palette.gray[300],

  // Emergency screen (always dark)
  emergencyBackground: palette.navy[900],
  emergencyText:      palette.gray[0],
  emergencySubText:   palette.gray[300],
  emergencySection:   palette.navy[800],
} as const;

// ── Dark Theme Tokens ─────────────────────────────────────────

export const darkTheme = {
  // Semantic colours
  primary:       palette.teal[400],
  primaryLight:  palette.teal[900],
  primaryDark:   palette.teal[200],
  danger:        palette.red[400],
  dangerLight:   palette.red[900],
  warning:       palette.amber[400],
  warningLight:  palette.amber[900],
  success:       palette.green[400],
  successLight:  palette.green[900],
  info:          palette.blue[400],
  infoLight:     palette.blue[900],

  // Surface colours
  background:    palette.gray[950],
  surface:       palette.gray[900],
  surfaceRaised: palette.gray[800],
  border:        palette.gray[700],
  borderStrong:  palette.gray[600],
  divider:       palette.gray[700],

  // Text colours
  textPrimary:   palette.gray[50],
  textSecondary: palette.gray[300],
  textTertiary:  palette.gray[500],
  textDisabled:  palette.gray[600],
  textInverse:   palette.gray[900],
  textDanger:    palette.red[400],
  textSuccess:   palette.green[400],
  textWarning:   palette.amber[400],

  // Button colours
  buttonPrimary:       palette.teal[600],
  buttonPrimaryText:   palette.gray[0],
  buttonSecondary:     palette.gray[900],
  buttonSecondaryText: palette.teal[400],
  buttonSecondaryBorder: palette.teal[600],
  buttonDanger:        palette.red[700],
  buttonDangerText:    palette.gray[0],
  buttonGhost:         'transparent',
  buttonGhostText:     palette.teal[400],
  buttonEmergency:     palette.red[600],
  buttonEmergencyText: palette.gray[0],
  buttonDisabled:      palette.gray[800],
  buttonDisabledText:  palette.gray[600],

  // Component specific
  cardBackground:     palette.gray[900],
  cardShadow:         palette.gray[950],
  skeletonBase:       palette.gray[800],
  skeletonHighlight:  palette.gray[700],
  inputBackground:    palette.gray[900],
  inputBorder:        palette.gray[700],
  inputFocusBorder:   palette.teal[500],
  inputErrorBorder:   palette.red[500],
  overlayBackground:  'rgba(0,0,0,0.7)',

  // Status badge colours (darker variants)
  openBg:            '#1B2E1B',
  openText:          palette.green[300],
  openBorder:        palette.green[800],
  openingSoonBg:     '#2E2400',
  openingSoonText:   palette.amber[300],
  openingSoonBorder: palette.amber[800],
  closedBg:         '#2E1B1B',
  closedText:        palette.red[300],
  closedBorder:      palette.red[800],
  unconfirmedBg:    palette.gray[800],
  unconfirmedText:  palette.gray[400],
  unconfirmedBorder: palette.gray[600],

  // Emergency screen (always dark, same as light)
  emergencyBackground: palette.navy[900],
  emergencyText:      palette.gray[0],
  emergencySubText:   palette.gray[300],
  emergencySection:   palette.navy[800],
} as const;

export type Theme = typeof lightTheme;

// ── Typography ────────────────────────────────────────────────

export const typography = {
  fontSize: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
  },
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    relaxed:1.75,
  },
} as const;

// ── Spacing ───────────────────────────────────────────────────

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ── Border Radius ─────────────────────────────────────────────

export const borderRadius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  full: 9999,
} as const;

// ── Shadows ───────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  emergency: {
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ── Language Pill Colours ─────────────────────────────────────
// Consistent colour per language for visual identification

export const languageColors: Record<string, { bg: string; text: string }> = {
  English:  { bg: '#E3F2FD', text: '#1565C0' },
  Hindi:    { bg: '#FCE4EC', text: '#880E4F' },
  Tamil:    { bg: '#F3E5F5', text: '#4A148C' },
  Bengali:  { bg: '#E8F5E9', text: '#1B5E20' },
  Other:    { bg: '#FFF3E0', text: '#E65100' },
  Punjabi:  { bg: '#E0F2F1', text: '#004D40' },
  Telugu:   { bg: '#FBE9E7', text: '#BF360C' },
  Malayalam:{ bg: '#E8EAF6', text: '#1A237E' },
} as const;
