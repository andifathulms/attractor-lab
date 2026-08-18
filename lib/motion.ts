'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the user has requested reduced motion. DESIGN.md §7: "the
 * trajectory renders complete and static, at full point count,
 * immediately... Nothing is lost except the drawing" — a legitimate
 * alternative, not a degraded one.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Step count for a one-shot "complete and static" render — cheap enough to compute in one burst. */
export const REDUCED_MOTION_STEPS = 60000;
