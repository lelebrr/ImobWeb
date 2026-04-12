import { Locale } from './settings';

/**
 * Localization-aware Phone Formatter.
 * Handles different country patterns and ensures E.164 compliance when needed.
 */
export function formatPhoneNumber(
  phone: string,
  locale: Locale = 'pt-BR'
): string {
  // Clean phone number
  const cleaned = phone.replace(/\D/g, '');

  const patterns: Record<string, (val: string) => string> = {
    'pt-BR': (val) => {
      if (val.length === 11) {
        return `+55 (${val.slice(2, 4)}) ${val.slice(4, 9)}-${val.slice(9)}`;
      }
      if (val.length === 10) {
        return `+55 (${val.slice(2, 4)}) ${val.slice(4, 8)}-${val.slice(8)}`;
      }
      return val;
    },
    'en-US': (val) => {
      if (val.length === 10) {
        return `+1 (${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
      }
      return val;
    },
    'es-ES': (val) => {
      if (val.length === 9) {
        return `+34 ${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6)}`;
      }
      return val;
    }
  };

  const formatter = patterns[locale] || ((val: string) => val);
  return formatter(cleaned);
}

/**
 * Validates if the phone number is valid for a specific locale.
 */
export function isValidPhone(phone: string, locale: Locale): boolean {
  // Logic for validation based on country rules
  const cleaned = phone.replace(/\D/g, '');
  if (locale === 'pt-BR') return cleaned.length >= 10 && cleaned.length <= 11;
  if (locale === 'en-US') return cleaned.length === 10;
  return cleaned.length > 5;
}
