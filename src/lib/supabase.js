import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured = Boolean(supabaseUrl && supabaseAnon);

if (!configured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Google sign-in and Supabase auth will be disabled.'
  );
}

// Stub used when env vars are absent — prevents a white-screen crash at init.
const noopClient = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession:        () => Promise.resolve({ data: { session: null } }),
    signInWithOAuth:   () => Promise.resolve({ error: new Error('Supabase not configured') }),
  },
};

export const supabase = configured
  ? createClient(supabaseUrl, supabaseAnon)
  : noopClient;

/**
 * Trigger Google OAuth sign-in.
 * Supabase will redirect back to /chat?oauth=true after authentication.
 */
export function signInWithGoogle(redirectBase) {
  if (!configured) {
    console.warn('[supabase] signInWithGoogle called but Supabase is not configured.');
    return Promise.resolve();
  }
  const redirectTo = `${redirectBase}/chat?oauth=true`;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
}
