'use client';

import type { ReactNode } from 'react';
import { useT } from '@/lib/i18n/LocaleProvider';
import { usePanelFocusOnToggle } from '@/lib/usePanelFocus';

export type PanelShellProps = {
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
  /** Rendered between the title and the rest of the body — jelajah's short intro paragraph. */
  readonly intro?: ReactNode;
  readonly children: ReactNode;
};

const COLLAPSED_BUTTON_CLASS =
  'absolute inset-x-0 bottom-0 z-20 w-full border-t border-rule bg-night/90 py-3 text-center font-sans text-sm text-readout transition-colors duration-fast hover:bg-graticule sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-8 sm:z-auto sm:w-auto sm:rounded-l sm:rounded-r-none sm:border sm:border-r-0 sm:border-t-0 sm:px-2 sm:py-4';

const EXPANDED_CLASS =
  'absolute inset-x-0 bottom-0 z-20 max-h-[40vh] overflow-y-auto border-t border-rule bg-night/95 p-4 font-sans text-sm text-readout sm:inset-x-auto sm:right-4 sm:top-8 sm:bottom-auto sm:z-auto sm:max-h-none sm:w-72 sm:overflow-visible sm:rounded sm:border sm:bg-night/90 sm:backdrop-blur-sm';

// Floating instrument panel shared by every route (DESIGN-REWORK.md §2) —
// collapsible to a single edge tab "because at some point you want only the
// picture" (DESIGN.md §6). Per-route form contents are children; only the
// collapse chrome lives here.
export function PanelShell({ collapsed, onToggleCollapsed, intro, children }: PanelShellProps) {
  const t = useT();
  const { openButtonRef, closeButtonRef } = usePanelFocusOnToggle(collapsed);

  if (collapsed) {
    return (
      <button
        ref={openButtonRef}
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t.panel.openPanel}
        className={COLLAPSED_BUTTON_CLASS}
      >
        ⟨
      </button>
    );
  }

  return (
    <div className={EXPANDED_CLASS}>
      <div className={`flex items-center justify-between ${intro ? 'mb-1' : 'mb-4'}`}>
        <h2 className="font-display text-lg font-medium">{t.panel.title}</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onToggleCollapsed}
          aria-label={t.panel.closePanel}
          className="text-readout transition-colors duration-fast hover:text-bloom"
        >
          ⟩
        </button>
      </div>
      {intro}
      {children}
    </div>
  );
}
