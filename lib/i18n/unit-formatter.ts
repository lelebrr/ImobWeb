import { Locale } from './settings';

/**
 * Localization-aware Unit Formatter.
 * Converts and formats measures like area (m² vs ft²).
 */
export function formatArea(
  value: number,
  locale: Locale = 'pt-BR'
): string {
  const isImperial = locale.startsWith('en-US');
  
  if (isImperial) {
    // Convert m² to ft² (approx 10.764)
    const converted = value * 10.7639;
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'foot',
      unitDisplay: 'short',
      maximumFractionDigits: 1
    }).format(converted) + '²';
  }

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'meter',
    unitDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value) + '²';
}

/**
 * Formats distances (km vs miles).
 */
export function formatDistance(
  valueInKm: number,
  locale: Locale = 'pt-BR'
): string {
  const isImperial = locale.startsWith('en-US');

  if (isImperial) {
    const miles = valueInKm * 0.621371;
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'mile',
      unitDisplay: 'short',
      maximumFractionDigits: 1
    }).format(miles);
  }

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    unitDisplay: 'short',
    maximumFractionDigits: 1
  }).format(valueInKm);
}
