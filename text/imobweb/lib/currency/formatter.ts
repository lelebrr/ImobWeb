import { Locale, currencyByLocale } from '../i18n/settings';

/**
 * Localization-aware currency formatter.
 * Supports BRL, USD, EUR and adjusts based on user locale.
 */
export function formatCurrency(
  value: number,
  locale: Locale = 'pt-BR',
  currencyOverride?: string
): string {
  const currency = currencyOverride || currencyByLocale[locale] || 'BRL';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Abbreviated currency formatter for dashboards (e.g. 1.2M, 500k)
 */
export function formatCurrencyCompact(
  value: number,
  locale: Locale = 'pt-BR',
  currencyOverride?: string
): string {
  const currency = currencyOverride || currencyByLocale[locale] || 'BRL';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}
