import { Metadata } from 'next';
import { locales, Locale } from './settings';

/**
 * SEO Helper for Internationalization.
 * Generates canonical and hreflang tags for multi-language pages.
 */
export function getI18nMetadata(
  pathname: string, 
  currentLocale: Locale
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://imobweb.com';
  
  // Clean pathname from locale prefix if present
  const baseRatePath = pathname.replace(/^\/(?:pt-BR|en-US|en-GB|es-ES|es-LA)/, '') || '/';

  const languages: Record<string, string> = {};
  locales.forEach((l) => {
    languages[l] = `${baseUrl}/${l}${baseRatePath}`;
  });

  return {
    alternates: {
      canonical: `${baseUrl}/${currentLocale}${baseRatePath}`,
      languages,
    },
  };
}
