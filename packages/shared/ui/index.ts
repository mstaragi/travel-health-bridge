/**
 * Travel Health Bridge Shared UI — Component Library Index
 * Re-exports all components for use in consumer, provider, and admin apps.
 */

// Design tokens & theme
export { palette, lightTheme, darkTheme, typography, spacing, borderRadius, shadows, languageColors } from './tokens';
export type { Theme } from './tokens';
export { useTheme } from './useTheme';

// Components
export { Button } from './Button';
export type { ButtonVariant } from './Button';

export { Card } from './Card';
export type { CardPadding } from './Card';

export { Collapsible } from './Collapsible';
export { Tag } from './Tag';
export { LanguagePill } from './LanguagePill';
export { Badge } from './Badge';
export { OpenStatusBadge } from './OpenStatusBadge';
export { Input } from './Input';
export { OTPInput } from './OTPInput';
export { Skeleton, ProviderCardSkeleton } from './Skeleton';
export { Modal } from './Modal';
export { Toast, ToastProvider } from './Toast';
export type { ToastType } from './Toast';
export { HelplineCTA } from './HelplineCTA';
export { ProviderCard } from './ProviderCard';
export { OfflineProviderCard } from './OfflineProviderCard';
export { FailureBottomSheet } from './FailureBottomSheet';
export { ConsentMessageModal } from './ConsentMessageModal';

// Admin / web only
export { QuickCaseModal } from './QuickCaseModal';
export { DailySummaryCard } from './DailySummaryCard';

// Gallery (dev / verification)
export { Gallery } from './Gallery';
