import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient, SupabaseClient, AuthError, Session, User } from '@supabase/supabase-js';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Supabase client using environment variables
// Add type assertions or checks
const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || '';
const testEmail: string = process.env.TEST_EMAIL || '';
const testPassword: string = process.env.TEST_PASSWORD || '';

if (!supabaseUrl || !supabaseAnonKey || !testEmail || !testPassword) {
  console.error(
    'Error: Missing required environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD)'
  );
  console.error('Please ensure they are set in your .env file.');
  process.exit(1);
}

// Add type for the client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// --- Authentication Test Function ---
// Add types for parameters and return values if applicable
async function runAuthTests(): Promise<void> { // Indicate no return value
  console.log(`Testing authentication with user: ${testEmail}`);

  // 1. Sign Up
  console.log('\n--- Attempting Sign Up ---');
  // Correct the type for signUp response data
  const { data: signUpData, error: signUpError }: { data: { user: User | null; session: Session | null; } | null; error: AuthError | null } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    // Handle cases where the user might already exist from a previous run
    if (signUpError.message.includes('User already registered')) {
      console.warn(`Warning: Test user ${testEmail} already exists. Proceeding to sign in.`);
    } else {
      console.error('Sign Up Failed:', signUpError.message);
      return; // Stop test if sign up fails critically
    }
  } else if (signUpData?.user) { // Access user directly from signUpData
    console.log('Sign Up Successful (User requires email confirmation).');
    console.log(
      '>>> IMPORTANT: Please check your email inbox for ',
      testEmail,
      ' and click the confirmation link. <<<'
    );
    // Pause to allow manual email confirmation
    const waitTime = 120; // seconds (Increased from 90 to 120)
    console.log(`Waiting ${waitTime} seconds for manual email confirmation...`);
    // Add type for resolve if needed, though often inferred
    await new Promise<void>((resolve) => setTimeout(resolve, waitTime * 1000));
  } else {
      console.warn('Sign Up response did not contain user data but no error was thrown.');
      // Decide how to proceed, maybe try sign in anyway if user already exists
  }

  // 2. Sign In
  console.log('\n--- Attempting Sign In ---');
  // Correct type for signInWithPassword response data
  let signInSession: Session | null = null; // Variable to hold session if successful
  const { data: signInData, error: signInError }: { data: { user: User | null; session: Session | null; }; error: AuthError | null } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('Sign In Failed:', signInError.message);
    // Common issue: Email not confirmed yet.
    if (signInError.message.toLowerCase().includes('email not confirmed')) {
        console.error('Ensure you have clicked the confirmation link sent to', testEmail);
    }
  } else if (signInData?.session) { // Optional chaining
    console.log('Sign In Successful! Session acquired.');
    signInSession = signInData.session;
    // console.log('Session:', signInData.session)
  } else {
    console.error('Sign In did not return a session or an error.');
  }

  // Only attempt sign out if sign in was successful
  if (signInSession) { // Check the session variable we stored
      // 3. Sign Out
      console.log('\n--- Attempting Sign Out ---');
      // Add type for error
      const { error: signOutError }: { error: AuthError | null } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('Sign Out Failed:', signOutError.message);
      } else {
        console.log('Sign Out Successful!');
      }
  } else {
      console.log('\n--- Skipping Sign Out (Sign In failed or did not produce a session) ---');
  }

  console.log('\n--- Authentication Test Finished ---');
}

// --- Run the Tests ---
runAuthTests().catch((err: Error) => { // Add type for caught error
  console.error('\nUnhandled error during test execution:', err);
});

// Optional: Keep the old profiles test or remove it
// console.log("\n--- Testing profiles query ---");
// supabase.from('profiles').select('*')
//   .then(result => console.log('Profiles:', result.data))
//   .catch(err => console.error('Error querying profiles:', err)) 