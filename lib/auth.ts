import { createClient } from './supabase/server';

/**
 * Utility function to get the current session in Server Components and API Routes.
 * Mimics NextAuth's auth() for consistency where needed.
 */
export async function auth() {
  const supabase = await createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    // Wrap the Supabase user to match expected session format if necessary
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        organizationId: session.user.user_metadata?.organizationId,
        role: session.user.user_metadata?.role,
      },
      expires: session.expires_at,
    };
  } catch (error) {
    console.error('[Auth] Error getting session:', error);
    return null;
  }
}
