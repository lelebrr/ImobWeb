import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { defaultLocale, Locale, locales } from './settings';

/**
 * Detects the preferred locale for the current tenant (agency).
 * This allows the dashboard to adapt to the imobiliária's region 
 * regardless of the agent's browser language.
 */
export async function getTenantLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  try {
    // 1. Get current user's agency/tenant
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return defaultLocale;

    // 2. Fetch agency settings
    const { data: agency } = await supabase
      .from('agencies')
      .select('preferred_locale, country')
      .eq('id', user.user_metadata.agency_id)
      .single();

    if (agency?.preferred_locale && locales.includes(agency.preferred_locale as Locale)) {
      return agency.preferred_locale as Locale;
    }

    // 3. Fallback to country lookup if locale is not set
    if (agency?.country) {
      const countryToLocale: Record<string, Locale> = {
        'BR': 'pt-BR',
        'US': 'en-US',
        'GB': 'en-GB',
        'ES': 'es-ES',
        'MX': 'es-LA',
        'AR': 'es-LA'
      };
      return countryToLocale[agency.country] || defaultLocale;
    }

  } catch (error) {
    console.error('Error detecting tenant locale:', error);
  }

  return defaultLocale;
}

/**
 * Helper to get formatting options based on tenant location.
 */
export async function getTenantFormatting() {
  const locale = await getTenantLocale();
  return {
    locale,
    timezone: locale === 'pt-BR' ? 'America/Sao_Paulo' : 'UTC',
    currency: locale === 'pt-BR' ? 'BRL' : 'USD'
  };
}
