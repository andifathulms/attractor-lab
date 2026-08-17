'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { dictionaries, type Dictionary, type Locale } from './dictionaries';

const LocaleContext = createContext<Locale>('id');

export function LocaleProvider({
  locale,
  children,
}: {
  readonly locale: Locale;
  readonly children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The current locale's dictionary. */
export function useT(): Dictionary {
  return dictionaries[useLocale()];
}
