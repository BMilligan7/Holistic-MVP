import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure your Supabase URL and anon key are correctly set in your environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// TODO: Define interfaces for function arguments and return types for better type safety.
// For example:
// interface SignUpArgs { email: string; password; string; }
// interface AuthResponse { user: User | null; session: Session | null; error: Error | null; }

export const signUp = async (/* args: SignUpArgs */ { email, password }: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  // Consider what to return: { data, error } or a more processed response
  return { data, error };
};

export const signIn = async ({ email, password }: any) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  // Supabase sends the password reset email directly.
  // The options parameter can be used to specify a redirectTo URL.
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    // Example: redirectTo: 'http://localhost:5173/update-password' // URL to your password update page
  });
  return { data, error };
};

// Optional: Function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Optional: Function to get the current session
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Optional: Listen to auth state changes
// This is useful for updating the UI in real-time when the auth state changes.
// You might place this in your AuthContext or main application setup.
// supabase.auth.onAuthStateChange((event, session) => {
//   console.log('Auth event:', event, session);
//   // Handle events like SIGNED_IN, SIGNED_OUT, USER_UPDATED, PASSWORD_RECOVERY, etc.
// }); 