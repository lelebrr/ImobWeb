import { Locale } from './settings';

/**
 * Localization-aware Number Parser.
 * Converts localized strings (e.g., "1.234,56") back to numeric values.
 */
export function parseLocalizedNumber(
  value: string,
  locale: Locale = 'pt-BR'
): number {
  if (!value) return 0;

  // Most Latin/European locales use comma for decimal
  const isCommaDecimal = ['pt-BR', 'es-ES', 'es-LA'].includes(locale);

  let cleaned = value;
  
  if (isCommaDecimal) {
    // Remove thousand separators (.) and replace decimal (,) with (.)
    cleaned = value.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // Remove thousand separators (,)
    cleaned = value.replace(/,/g, '');
  }

  // Remove any remaining non-numeric characters except the dot
  cleaned = cleaned.replace(/[^0-9.]/g, '');

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Normalizes a currency input string (removes symbols and formats correctly).
 */
export function normalizeCurrencyInput(
  value: string,
  locale: Locale = 'pt-BR'
): number {
  const numericValue = parseLocalizedNumber(value, locale);
  return numericValue;
}
