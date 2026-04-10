import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './settings';

/**
 * Configuração central para o next-intl em Next.js 16.
 * Gerencia o carregamento dinâmico de dicionários e fallbacks.
 */
export default getRequestConfig(async ({ locale }) => {
  // Validação de segurança para o locale
  const activeLocale = locales.includes(locale as any) ? locale : defaultLocale;

  return {
    messages: (await import(`../locales/${activeLocale}.json`)).default,
    now: new Date(),
    timeZone: activeLocale === 'pt-BR' ? 'America/Sao_Paulo' : 'UTC',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'BRL' // Base, can be dynamic
        },
        percent: {
          style: 'percent',
          maximumFractionDigits: 2
        }
      }
    },
    // Sistema de fallback inteligente
    onError(error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[i18n Error]: ${error.message}`);
      }
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.');
      return `[[${path}]]`;
    }
  };
});
