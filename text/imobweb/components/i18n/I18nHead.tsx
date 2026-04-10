'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getI18nMetadata } from '@/lib/i18n/seo-helper';
import { Locale } from '@/lib/i18n/settings';

/**
 * SEO Head Component for i18n.
 * Dynamically injects hreflang and canonical tags.
 * Use this in your root layout or specific pages.
 */
export function I18nHead() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const metadata = getI18nMetadata(pathname, locale);

  if (!metadata.alternates) return null;

  const { canonical, languages } = metadata.alternates as any;

  return (
    <>
      {canonical && <link rel="canonical" href={canonical} />}
      {languages && Object.entries(languages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url as string} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={languages?.[ 'en-US' ] || canonical} />
    </>
  );
}
