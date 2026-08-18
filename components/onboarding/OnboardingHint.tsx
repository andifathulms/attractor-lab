'use client';

import type { RefObject } from 'react';
import { useT } from '@/lib/i18n/LocaleProvider';
import { useFirstVisitHint } from '@/lib/onboarding';

export type OnboardingHintProps = {
  readonly storageKey: string;
  readonly message: string;
  /** Focused after dismiss — without it, the just-focused Dismiss button unmounts and focus drops to <body>. */
  readonly returnFocusRef?: RefObject<HTMLElement>;
};

/**
 * A small, dismiss-once card explaining what's on screen for a first-time
 * visitor — not a tour, not a modal, and not animated in: it either is or
 * isn't there, so it never competes with the accumulation as the app's one
 * orchestrated moment. DESIGN.md §1.
 */
export function OnboardingHint({ storageKey, message, returnFocusRef }: OnboardingHintProps) {
  const t = useT();
  const [seen, dismiss] = useFirstVisitHint(storageKey);

  if (seen) return null;

  const handleDismiss = () => {
    dismiss();
    returnFocusRef?.current?.focus();
  };

  return (
    <div className="absolute left-4 top-32 z-10 max-w-xs rounded border border-rule bg-night/90 p-4 font-sans text-sm text-readout backdrop-blur-sm sm:max-w-sm">
      <p className="mb-3 leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        className="rounded border border-rule bg-graticule px-3 py-1 text-sm text-readout transition-colors duration-fast hover:bg-rule"
      >
        {t.onboarding.dismiss}
      </button>
    </div>
  );
}
