// test-db-schema.js
require('dotenv').config(); // Use standard dotenv
const { createClient } = require('@supabase/supabase-js');

// --- Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Unique identifier for this test run
const testRunId = `test-rls-${Date.now()}`;
const testUserAEmail = `${testRunId}-A@example.com`;
const testUserBEmail = `${testRunId}-B@example.com`;
const testPassword = 'password123'; // Dummy password

let supabase; // Client for user operations
let supabaseAdmin; // Client for admin operations (service role key)

let userA = null; // To store user A object { id, email }
let userB = null; // To store user B object { id, email }
let planAId = null; // Plan created by user A
let planBId = null; // Plan created by user B

// --- Helper Functions ---
function initializeClients() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }
  // Standard client for user-specific actions
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Remove custom storage, rely on defaults or explicit sign-in/out
        // storage: new Map(), 
        autoRefreshToken: true,
        persistSession: true, // Keep true, might help slightly
        detectSessionInUrl: false
    }
  });
  console.log('Standard Supabase client initialized.');

  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('Admin Supabase client initialized (using service role key).');
  } else {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required in .env for RLS tests involving multiple users.');
    process.exit(1); // Exit if service key is missing
  }
}

async function createTestUser(email) {
    console.log(`Attempting to create test user: ${email}`);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: testPassword,
        email_confirm: true, // Auto-confirm for testing
        user_metadata: { full_name: `Test User ${email.split('@')[0]}` }
    });
    if (error) {
        console.error(`❌ Failed to create user ${email}:`, error.message);
        throw error; // Stop tests if user creation fails
    }
    console.log(`✅ Successfully created test user: ${data.user.email} (ID: ${data.user.id})`);
    // Verify profile trigger
    await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for trigger
    const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles') // Use admin to bypass RLS for verification check
        .select('*')
        .eq('id', data.user.id)
        .single();
    if (profileError || !profileData) {
         console.error(`❌ Profile check failed for ${data.user.id}:`, profileError?.message || 'Profile not found');
         // Don't throw, maybe test can proceed, but log failure
    } else {
         console.log(`✅ Profile check passed for ${data.user.id}.`);
    }
    return { id: data.user.id, email: data.user.email };
}

async function signInUser(email, password) {
    console.log(`\n--- Signing in as ${email} ---`);
    // Sign out any existing user first
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
        console.error(`❌ Failed to sign in as ${email}:`, error?.message || 'No session data');
        throw error || new Error('Sign in failed');
    }
    console.log(`✅ Signed in successfully as ${email}.`);
     // Verify auth context
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.email !== email) {
        console.error(`❌ Auth context mismatch! Expected ${email}, got ${currentUser?.email}`);
        throw new Error('Auth context mismatch after sign-in');
    }
    console.log(`(Auth context verified: ${currentUser.email})`);
}

async function signOutUser() {
    console.log('\n--- Signing out ---');
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out failed:', error.message);
        // Don't necessarily throw, but log it
    } else {
        console.log('✅ Signed out successfully.');
    }
}

async function cleanupTestUsers() {
    console.log('\n--- Cleaning up test users ---');
    for (const user of [userA, userB]) {
        if (user && user.id) {
            try {
                console.log(`Attempting to delete user ${user.email} (ID: ${user.id})`);
                const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
                if (error) {
                     // Handle potential "not found" if cleanup failed previously
                    if (!error.message?.includes('User not found')) {
                        console.error(`Failed to delete user ${user.email}:`, error.message);
                    } else {
                         console.log(`User ${user.email} likely already deleted.`);
                    }
                } else {
                    console.log(`✅ Successfully deleted user ${user.email}.`);
                }
            } catch (err) {
                console.error(`Error during cleanup for user ${user.email}:`, err.message);
            }
        }
    }
     // Note: Associated data SHOULD cascade delete via FK constraints (profile->plan->task)
     // or be inaccessible after user deletion. Explicit deletes usually not needed here.
    console.log('--- Cleanup attempt finished ---');
}

// Helper to check for RLS errors specifically
function isRLSError(error) {
    if (!error || !error.message) return false;
    const lowerCaseMessage = error.message.toLowerCase();
    // Add specific check for insert/update violations
    const violatesPolicy = lowerCaseMessage.includes('violates row-level security policy');
    // Keep original checks too
    const mentionsRLS = lowerCaseMessage.includes('rls') || lowerCaseMessage.includes('row level security');
    return violatesPolicy || mentionsRLS;
}


// --- Test Suite ---
async function runRLSTests() {
  console.log(`\n--- Starting RLS Tests (Test Run ID: ${testRunId}) ---`);

  // 1. Create Test Users
  console.log('\n--- Phase 1: Create Test Users ---');
  userA = await createTestUser(testUserAEmail);
  userB = await createTestUser(testUserBEmail);

  // 2. Test as User A
  console.log('\n\n--- Phase 2: Testing as User A ---');
  await signInUser(userA.email, testPassword);

  // Test A.1: Allowed Actions (User A's own data)
  console.log('\n--- Test A.1: Allowed Actions (User A) ---');
  try {
    const { data, error } = await supabase
        .from('plans')
        .insert({ user_id: userA.id, title: `Plan A - ${testRunId}`, status: 'active', start_date: new Date().toISOString().split('T')[0] })
        .select().single();
    if (error) throw error;
    planAId = data.id;
    console.log(`✅ [A.1.1] User A created own plan: ${planAId}`);

    const { data: readData, error: readError } = await supabase.from('plans').select().eq('id', planAId).single();
    if (readError) throw readError;
    console.log(`✅ [A.1.2] User A read own plan: ${readData.id}`);

     // Add more allowed actions: update plan, create/read daily_task, chat_message, etc.
     const { data: taskData, error: taskError } = await supabase
        .from('daily_tasks')
        .insert({ plan_id: planAId, title: `Task A - ${testRunId}`, status: 'pending' })
        .select().single();
     if (taskError) throw taskError;
     console.log(`✅ [A.1.3] User A created own daily task: ${taskData.id}`);


  } catch (error) {
    console.error(`❌ [A.1] Failed allowed action for User A:`, error.message);
  }

  // Test A.2: Disallowed Actions (User A)
  console.log('\n--- Test A.2: Disallowed Actions (User A) ---');
  try {
      // Attempt to create plan FOR user B while logged in as A
    const { data: insertData, error: insertError } = await supabase
        .from('plans')
        .insert({ user_id: userB.id, title: `Illegal Plan B by A - ${testRunId}`, status: 'active', start_date: new Date().toISOString().split('T')[0] })
        .select(); // Try to select to be sure

    if (insertError && isRLSError(insertError)) {
        console.log(`✅ [A.2.1] User A correctly blocked from inserting plan for User B.`);
    } else if (insertError) {
        console.error(`❌ [A.2.1] User A inserting plan for User B failed, but with unexpected error:`, insertError.message);
    } else {
        console.error(`❌ [A.2.1] User A illegally inserted plan for User B! RLS Failed! Data:`, insertData);
    }

    // Need to create plan B first, then try reading it
    // (We'll do this in User B's section, then try reading here)


     // Add more disallowed actions: read user B's plan (once created), update user B's profile etc.


  } catch (error) {
    // Catch unexpected errors during the disallowed tests themselves
    console.error(`❌ [A.2] Unexpected error during disallowed action tests for User A:`, error.message);
  }

  await signOutUser();


  // 3. Test as User B
  console.log('\n\n--- Phase 3: Testing as User B ---');
  await signInUser(userB.email, testPassword);

   // Test B.1: Create User B's own data (needed for later tests)
   console.log('\n--- Test B.1: Allowed Actions (User B) ---');
   try {
     const { data, error } = await supabase
        .from('plans')
        .insert({ user_id: userB.id, title: `Plan B - ${testRunId}`, status: 'active', start_date: new Date().toISOString().split('T')[0] })
        .select().single();
     if (error) throw error;
     planBId = data.id;
     console.log(`✅ [B.1.1] User B created own plan: ${planBId}`);

     const { data: readData, error: readError } = await supabase.from('plans').select().eq('id', planBId).single();
     if (readError) throw readError;
     console.log(`✅ [B.1.2] User B read own plan: ${readData.id}`);

   } catch (error) {
     console.error(`❌ [B.1] Failed allowed action for User B:`, error.message);
   }


  // Test B.2: Disallowed Actions (User A's data)
  console.log('\n--- Test B.2: Disallowed Actions (User B) ---');
  try {
    // Attempt to read User A's plan while logged in as B
    const { data: readData, error: readError } = await supabase.from('plans').select().eq('id', planAId).maybeSingle(); // Use maybeSingle, expect null/error
     if (readError) { // Expect potential error if RLS truly blocks it
         console.log(`✅ [B.2.1] User B reading User A's plan returned error (potential RLS block): ${readError.message}`);
     } else if (readData === null) {
         console.log(`✅ [B.2.1] User B correctly could not read User A's plan (returned null).`);
     } else {
         console.error(`❌ [B.2.1] User B illegally read User A's plan! RLS Failed! Data:`, readData);
     }

    // Attempt to delete User A's plan while logged in as B
    console.log(`[B.2.2] Attempting delete of User A's plan (${planAId}) as User B...`);
    const { data: deleteData, error: deleteError } = await supabase
        .from('plans')
        .delete()
        .eq('id', planAId)
        .select(); // select() might return empty array [] if delete is blocked/finds nothing

    if (deleteError && isRLSError(deleteError)) {
         // Explicit RLS error received - This is a clear success
         console.log(`✅ [B.2.2] User B correctly blocked by RLS (received RLS error) from deleting User A's plan.`);
    } else if (deleteError) {
        // Another unexpected error occurred
        console.error(`❌ [B.2.2] User B deleting User A's plan failed with unexpected error:`, deleteError.message);
    } else if (!deleteError && (!deleteData || deleteData.length === 0)) {
         // No error AND deleteData is null/empty array: This indicates RLS likely blocked it silently.
         console.log(`✅ [B.2.2] User B likely blocked by RLS from deleting User A's plan (delete returned no error and no data).`);
         // Optional: Verify with admin client that the plan still exists
         const { data: checkData } = await supabaseAdmin.from('plans').select('id').eq('id', planAId).maybeSingle();
         if (!checkData) {
             console.warn(`   (Verification) WARNING: Plan ${planAId} seems to be deleted despite apparent RLS block?`);
         } else {
             console.log(`   (Verification) Plan ${planAId} still exists.`);
         }
    } else {
        // No error AND we got data back (unexpected for delete?) OR deleteData is not empty
        console.error(`❌ [B.2.2] User B delete command for User A's plan appears to have succeeded! RLS FAILED? Response:`, deleteData);
        const { data: checkData } = await supabaseAdmin.from('plans').select('id').eq('id', planAId).maybeSingle();
        if (!checkData) {
             console.error(`   (Verification) User A's plan (${planAId}) confirmed deleted.`);
        }
    }


     // Add more disallowed actions: create task for plan A, update profile A etc.


  } catch (error) {
    console.error(`❌ [B.2] Unexpected error during disallowed action tests for User B:`, error.message);
  }


  await signOutUser();


  console.log('\n--- RLS Tests Finished ---');
}

// --- Execution ---
initializeClients();
runRLSTests()
  .catch((err) => {
    console.error('\nUnhandled error during RLS test execution:', err);
  })
  .finally(async () => {
    // Attempt cleanup
    await cleanupTestUsers();
    process.exit(); // Ensure script exits
  }); 