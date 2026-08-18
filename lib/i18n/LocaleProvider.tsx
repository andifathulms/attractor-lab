'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { dictionaries, type Dictionary, type Locale } from './dictionaries';

const LocaleContext = createContext<Locale>('id');

export function LocaleProvider({
  locale,
  children,
}: {
  readonly locale: Locale;
  readonly children: ReactNode;
}) {
  // The root <html lang> (app/layout.tsx) is hard-coded to 'id' — it can't
  // read the locale param, which only exists one layout down, in
  // app/[locale]/layout.tsx. Without this, every /en/* page tells assistive
  // tech it's Indonesian (WCAG 3.1.1). Syncing here, in the one place every
  // page already passes through, fixes it without restructuring the root
  // layout.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The current locale's dictionary. */
export function useT(): Dictionary {
  return dictionaries[useLocale()];
}
