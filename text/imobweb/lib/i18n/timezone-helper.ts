import { Locale } from './settings';

/**
 * Timezone Management Utility.
 * Provides timezone-aware date conversions and labels.
 */
export const localeTimezones: Record<string, string[]> = {
  'pt-BR': ['America/Sao_Paulo', 'America/Recife', 'America/Manaus', 'America/Cuiaba'],
  'en-US': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  'en-GB': ['Europe/London'],
  'es-ES': ['Europe/Madrid', 'Atlantic/Canary'],
  'es-LA': ['America/Mexico_City', 'America/Bogota', 'America/Buenos_Aires', 'America/Santiago']
};

/**
 * Gets the default timezone for a specific locale.
 */
export function getDefaultTimezone(locale: Locale): string {
  return localeTimezones[locale]?.[0] || 'UTC';
}

/**
 * Formats a date with a specific timezone.
 */
export function formatWithTimezone(
  date: Date,
  timezone: string,
  locale: Locale = 'pt-BR'
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date);
}

/**
 * List of common timezones for selection.
 */
export const commonTimezones = [
  'UTC',
  'America/Sao_Paulo',
  'America/New_York',
  'Europe/London',
  'Europe/Madrid',
  'America/Mexico_City',
  'America/Buenos_Aires'
];
