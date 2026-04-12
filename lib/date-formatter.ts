import { format } from 'date-fns';
import { 
  ptBR, 
  enUS, 
  enGB, 
  es 
} from 'date-fns/locale';
import { Locale } from './i18n/settings';

const dateFnsLocales: Record<string, any> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'en-GB': enGB,
  'es-ES': es,
  'es-LA': es
};

/**
 * Intelligent date formatter that adapts to culture.
 * Uses date-fns for specialized formatting while respecting the locale.
 */
export function formatDate(
  date: Date | number | string,
  variant: 'short' | 'long' | 'full' | 'monthYear' = 'short',
  locale: Locale = 'pt-BR'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const fnsLocale = dateFnsLocales[locale] || ptBR;

  const patterns: Record<typeof variant, string> = {
    short: locale.startsWith('en-US') ? 'MM/dd/yyyy' : 'dd/MM/yyyy',
    long: locale.startsWith('en-US') ? 'MMM dd, yyyy' : 'd de MMM de yyyy', // Simplified for multi-language
    full: 'PPPP',
    monthYear: 'MMMM yyyy'
  };

  return format(d, patterns[variant], { locale: fnsLocale });
}

/**
 * Business-specific relative time (e.g. "há 2 dias", "2 days ago")
 */
export function formatRelativeTime(
  date: Date | number | string,
  locale: Locale = 'pt-BR'
): string {
  // Logic for simple relative time or use date-fns formatDistance
  const d = typeof date === 'string' ? new Date(date) : date;
  const fnsLocale = dateFnsLocales[locale] || ptBR;
  
  // Placeholder for advanced relative time logic
  return format(d, 'P', { locale: fnsLocale });
}
