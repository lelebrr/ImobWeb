export const defaultLocale = 'pt-BR';
export const locales = ['pt-BR', 'en-US', 'en-GB', 'es-ES', 'es-LA'] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Español (España)',
  'es-LA': 'Español (Latam)'
};

export const currencyByLocale: Record<Locale, string> = {
  'pt-BR': 'BRL',
  'en-US': 'USD',
  'en-GB': 'GBP',
  'es-ES': 'EUR',
  'es-LA': 'USD' // Default for Latam in this context, can be dynamic
};
