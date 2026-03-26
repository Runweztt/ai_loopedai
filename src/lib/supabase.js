import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnon);

/**
 * Trigger Google OAuth sign-in.
 * Supabase will redirect back to /chat?oauth=true after authentication.
 */
export function signInWithGoogle(redirectBase) {
  const redirectTo = `${redirectBase}/chat?oauth=true`;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
}
