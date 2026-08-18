'use client';

import { useEffect, useState } from 'react';

/**
 * Whether a first-visit hint keyed by `key` has already been dismissed,
 * persisted in localStorage so it shows once per browser, not once per
 * session. Starts `true` (hidden) until the client mounts and checks
 * storage, so there's no flash of the hint before hydration can confirm
 * it hasn't been seen.
 */
export function useFirstVisitHint(key: string): readonly [seen: boolean, dismiss: () => void] {
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    try {
      setSeen(window.localStorage.getItem(key) === '1');
    } catch {
      // localStorage unavailable (private mode, disabled storage) — show
      // the hint every time rather than crash.
      setSeen(false);
    }
  }, [key]);

  const dismiss = (): void => {
    setSeen(true);
    try {
      window.localStorage.setItem(key, '1');
    } catch {
      // Nothing to do if storage is unavailable — it'll just show again next visit.
    }
  };

  return [seen, dismiss];
}
