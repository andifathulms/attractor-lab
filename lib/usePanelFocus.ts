'use client';

import { useEffect, useRef } from 'react';

/**
 * Moves focus to the newly-visible toggle button when a collapsible panel
 * opens or closes. The collapsed and expanded states are two different
 * subtrees — the just-activated button is unmounted mid-interaction, and
 * without this, focus silently drops to <body> ("focus lost after a state
 * change"). Skips the initial mount so opening a page doesn't steal focus
 * from wherever the user actually starts.
 */
export function usePanelFocusOnToggle(collapsed: boolean): {
  readonly openButtonRef: React.RefObject<HTMLButtonElement>;
  readonly closeButtonRef: React.RefObject<HTMLButtonElement>;
} {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (collapsed) {
      openButtonRef.current?.focus();
    } else {
      closeButtonRef.current?.focus();
    }
  }, [collapsed]);

  return { openButtonRef, closeButtonRef };
}
