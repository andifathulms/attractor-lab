import type { ReactNode } from 'react';

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: 'id' }, { locale: 'en' }];
}

export default function LocaleLayout({ children }: { readonly children: ReactNode }) {
  return children;
}
