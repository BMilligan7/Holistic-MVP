import { createClient } from '@supabase/supabase-js'

// Ensure your environment variables are loaded correctly,
// potentially using a library like dotenv if not handled by your framework/build tool.
// Example: import 'dotenv/config'; // if using dotenv

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing environment variable: VITE_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: VITE_SUPABASE_ANON_KEY");
}

// Initialize and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Authentication Functions ---

/**
 * Signs up a new user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{ data: any, error: Error | null }>} - The sign-up result.
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // You can add options here, like redirect URLs or metadata
    // options: {
    //   emailRedirectTo: 'https://example.com/welcome',
    // }
  })
  // TODO: Handle potential errors (e.g., log them, show user message)
  return { data, error }
}

/**
 * Signs in an existing user using email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{ data: any, error: Error | null }>} - The sign-in result.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  // TODO: Handle potential errors
  return { data, error }
}

/**
 * Signs out the current user.
 * @returns {Promise<{ error: Error | null }>} - The sign-out result.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  // TODO: Handle potential errors
  return { error }
} 