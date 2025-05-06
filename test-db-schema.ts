// test-db-schema.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient, SupabaseClient, AuthError, Session, User, PostgrestError } from '@supabase/supabase-js';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// --- Configuration ---
const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Unique identifier for this test run
const testRunId = `test-rls-${Date.now()}`;
const testUserAEmail = `${testRunId}-A@example.com`;
const testUserBEmail = `${testRunId}-B@example.com`;
const testPassword = 'password123'; // Dummy password

// --- Type Definitions ---
interface TestUser {
    id: string;
    email: string;
}

// Define types for your table data if possible (replace any with specific types)
interface Plan {
    id: number; // Or string if UUID
    user_id: string;
    title: string;
    status: string;
    start_date: string;
}

interface DailyTask {
    id: number; // Or string if UUID
    plan_id: number; // Or string if UUID
    title: string;
    status: string;
}

// --- Global Variables ---
let supabase: SupabaseClient;
let supabaseAdmin: SupabaseClient;

let userA: TestUser | null = null; // Typed
let userB: TestUser | null = null; // Typed
let planAId: number | string | null = null; // Typed (adjust number/string as needed)
let planBId: number | string | null = null; // Typed

// --- Helper Functions ---
function initializeClients(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
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
    process.exit(1);
  }
}

async function createTestUser(email: string): Promise<TestUser> { // Typed params and return
    console.log(`Attempting to create test user: ${email}`);
    // Adjust type for admin.createUser response - allow user to be null within data
    const { data, error }: { data: { user: User | null }; error: AuthError | null } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: `Test User ${email.split('@')[0]}` }
    });
    if (error || !data?.user) { // Check error and data.user existence
        console.error(`❌ Failed to create user ${email}:`, error?.message || 'No user data returned');
        throw error || new Error('User creation failed');
    }
    // Since we checked data.user above, it should be non-null here
    console.log(`✅ Successfully created test user: ${data.user.email} (ID: ${data.user.id})`);
    // Verify profile trigger
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Type the profile query response
    const { data: profileData, error: profileError }: { data: any | null; error: PostgrestError | null } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
    if (profileError || !profileData) {
         console.error(`❌ Profile check failed for ${data.user.id}:`, profileError?.message || 'Profile not found');
    } else {
         console.log(`✅ Profile check passed for ${data.user.id}.`);
    }
    // We know data.user exists here
    return { id: data.user.id, email: data.user.email || '' }; // Ensure email is string
}

async function signInUser(email: string, password: string): Promise<void> { // Typed params
    console.log(`\n--- Signing in as ${email} ---`);
    await supabase.auth.signOut(); // Sign out first
    // Type the signIn response
    const { data, error }: { data: { session: Session | null }; error: AuthError | null } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session) { // Check error and data.session
        console.error(`❌ Failed to sign in as ${email}:`, error?.message || 'No session data');
        throw error || new Error('Sign in failed');
    }
    console.log(`✅ Signed in successfully as ${email}.`);
     // Type the getUser response
    const { data: { user: currentUser }, error: getUserError }: { data: { user: User | null }; error: AuthError | null } = await supabase.auth.getUser();
     if (getUserError || !currentUser) {
        console.error(`❌ Failed to get user after sign-in:`, getUserError?.message || 'No user data');
        throw getUserError || new Error('Failed to verify auth context');
     }
    if (currentUser.email !== email) {
        console.error(`❌ Auth context mismatch! Expected ${email}, got ${currentUser.email}`);
        throw new Error('Auth context mismatch after sign-in');
    }
    console.log(`(Auth context verified: ${currentUser.email})`);
}

async function signOutUser(): Promise<void> {
    console.log('\n--- Signing out ---');
    const { error }: { error: AuthError | null } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out failed:', error.message);
    } else {
        console.log('✅ Signed out successfully.');
    }
}

async function cleanupTestUsers(): Promise<void> {
    console.log('\n--- Cleaning up test users ---');
    const usersToClean: (TestUser | null)[] = [userA, userB];

    // FIX 2: More robust data cleanup
    if (supabaseAdmin) {
        console.log('--- Attempting data cleanup (tasks, plans) ---');
        // Collect all known plan IDs created during the test
        const planIdsToClean = [planAId, planBId].filter(id => id !== null) as (string | number)[];

        if (planIdsToClean.length > 0) {
            try {
                // Delete daily tasks associated with these plans first
                console.log(`Attempting to delete daily_tasks for plans: ${planIdsToClean.join(', ')}`);
                const { error: taskError } = await supabaseAdmin
                    .from('daily_tasks')
                    .delete()
                    .in('plan_id', planIdsToClean); // Assumes plan_id links to plans.id
                if (taskError) {
                    // Log error but continue cleanup
                    console.warn(`Warning deleting daily_tasks:`, taskError.message);
                } else {
                    console.log(`Potentially deleted daily_tasks for plans: ${planIdsToClean.join(', ')}`);
                }

                // Now delete the plans themselves
                console.log(`Attempting to delete plans: ${planIdsToClean.join(', ')}`);
                const { error: planError } = await supabaseAdmin
                    .from('plans')
                    .delete()
                    .in('id', planIdsToClean);
                if (planError) {
                    // Log error but continue cleanup
                    console.warn(`Warning deleting plans:`, planError.message);
                } else {
                    console.log(`Potentially deleted plans: ${planIdsToClean.join(', ')}`);
                }
            } catch (err: any) {
                console.error(`Error during data cleanup:`, err?.message);
            }
        } else {
            console.log('No plan IDs recorded, skipping data cleanup.');
        }
        console.log('--- Data cleanup attempt finished ---');
    } else {
        console.warn('Admin client not available, skipping data cleanup.');
    }

    // Now attempt to delete users
    console.log('--- Attempting user deletion ---');
    for (const user of usersToClean) {
        if (user?.id && supabaseAdmin) { // Check supabaseAdmin again
            try {
                console.log(`Attempting to delete user ${user.email} (ID: ${user.id})`);
                // Type deleteUser response, only extract error
                const { error: deleteError }: { error: AuthError | null } = await supabaseAdmin.auth.admin.deleteUser(user.id);
                if (deleteError) {
                    // Don't log error if user simply wasn't found (might happen if previous cleanup worked partially)
                    if (!deleteError.message?.includes('User not found')) {
                        console.error(`❌ Failed to delete user ${user.email}:`, deleteError.message);
                    } else {
                         console.log(`User ${user.email} not found (likely already deleted).`);
                    }
                } else {
                    console.log(`✅ Successfully deleted user ${user.email}.`);
                }
            } catch (err: any) { // Type caught error
                console.error(`❌ Error during user deletion for ${user.email}:`, err?.message);
            }
        } else if (!supabaseAdmin) {
             console.warn(`Cannot delete user ${user?.email} - Admin client not available.`);
        }
    }
    console.log('--- User deletion attempt finished ---');
}

// Type the error parameter
function isRLSError(error: PostgrestError | AuthError | Error | null | undefined): boolean {
    if (!error?.message) return false;
    const lowerCaseMessage = error.message.toLowerCase();
    const violatesPolicy = lowerCaseMessage.includes('violates row-level security policy');
    const mentionsRLS = lowerCaseMessage.includes('rls') || lowerCaseMessage.includes('row level security');
    return violatesPolicy || mentionsRLS;
}


// --- Test Suite ---
async function runRLSTests(): Promise<void> {
  console.log(`\n--- Starting RLS Tests (Test Run ID: ${testRunId}) ---`);

  // 1. Create Test Users
  console.log('\n--- Phase 1: Create Test Users ---');
  // Type assignment explicitly
  userA = await createTestUser(testUserAEmail);
  userB = await createTestUser(testUserBEmail);

  // Ensure users were created before proceeding
  if (!userA || !userB) {
      console.error('Critical error: Test users could not be created. Aborting tests.');
      return;
  }

  // 2. Test as User A
  console.log('\n\n--- Phase 2: Testing as User A ---');
  await signInUser(userA.email, testPassword);

  // Test A.1: Allowed Actions (User A's own data)
  console.log('\n--- Test A.1: Allowed Actions (User A) ---');
  try {
    // Type the insert response for plans
    const { data, error }: { data: Plan | null; error: PostgrestError | null } = await supabase
        .from('plans')
        .insert({ user_id: userA.id, title: `Plan A - ${testRunId}`, status: 'active', start_date: new Date().toISOString().split('T')[0] })
        .select().single(); // Assuming insert returns the created row
    if (error || !data) throw error || new Error('Plan insertion failed or returned no data');
    planAId = data.id;
    console.log(`✅ [A.1.1] User A created own plan: ${planAId}`);

    // Type the select response for plans
    const { data: readData, error: readError }: { data: Plan | null; error: PostgrestError | null } = await supabase.from('plans').select().eq('id', planAId).single();
    if (readError || !readData) throw readError || new Error('Plan read failed or returned no data');
    console.log(`✅ [A.1.2] User A read own plan: ${readData.id}`);

     // Type the insert response for tasks
     const { data: taskData, error: taskError }: { data: DailyTask | null; error: PostgrestError | null } = await supabase
        .from('daily_tasks')
        .insert({ plan_id: planAId, title: `Task A - ${testRunId}`, status: 'pending' })
        .select().single();
     if (taskError || !taskData) throw taskError || new Error('Task insertion failed or returned no data');
     console.log(`✅ [A.1.3] User A created own daily task: ${taskData.id}`);


  } catch (error: any) {
    console.error(`❌ [A.1] Failed allowed action for User A:`, error?.message);
  }

  // Test A.2: Disallowed Actions (User A)
  console.log('\n--- Test A.2: Disallowed Actions (User A) ---');
  try {
      // Attempt to create plan FOR user B while logged in as A
    // Type the insert response
    const { data: insertData, error: insertError }: { data: Plan | null; error: PostgrestError | null } = await supabase
        .from('plans')
        .insert({ user_id: userB.id, title: `Plan B - ${testRunId}`, status: 'active', start_date: new Date().toISOString().split('T')[0] })
        .select().single();
    
    if (insertError) {
        if (isRLSError(insertError)) {
            console.log(`✅ [A.2.1] Correctly blocked: User A cannot create plan for User B: ${insertError.message}`);
        } else {
            throw insertError; // Different error
        }
    } else if (insertData) { // Check if data exists
        planBId = insertData.id;
        console.error(`❌ [A.2.1] RLS FAILED: User A *was able* to create plan for User B (ID: ${planBId})`);
        // Attempt cleanup of this specific plan
         try {
            // Type delete response
            const { error: cleanupErr }: { error: PostgrestError | null } = await supabaseAdmin.from('plans').delete().eq('id', planBId);
            if (cleanupErr) throw cleanupErr;
            console.log(`(Cleaned up incorrectly created plan ${planBId})`);
        } catch (cleanupErr: any) {
            console.error(`(Failed to cleanup plan ${planBId}: ${cleanupErr?.message})`);
        }
    } else {
         // This case (no error, no data) might indicate RLS block without explicit error
         console.log(`✅ [A.2.1] Correctly blocked: User A cannot create plan for User B (no data returned).`);
    }

    // Attempt to read plan created FOR user B (should fail if creation failed, also should fail RLS read)
    if (planBId) { // Only try if we think it was created
      // Type select response
      const { data: readData, error: readError }: { data: Plan | null; error: PostgrestError | null } = await supabase.from('plans').select().eq('id', planBId).maybeSingle();
      if (readError) {
          if (isRLSError(readError)) {
              console.log(`✅ [A.2.2] Correctly blocked: User A cannot read plan for User B: ${readError.message}`);
          } else {
              throw readError;
          }
      } else if (readData) {
          console.error(`❌ [A.2.2] RLS FAILED: User A *was able* to read plan for User B`);
      } else {
           console.log(`✅ [A.2.2] Correctly blocked: User A cannot read plan for User B (no data returned)`);
      }
    }

  } catch (error: any) {
    console.error(`❌ [A.2] General failure during disallowed action test for User A:`, error?.message);
  }

  // 3. Test as User B
  console.log('\n\n--- Phase 3: Testing as User B ---');
  await signInUser(userB.email, testPassword);

  console.log('\n--- Test B.1: Allowed Actions (User B) ---');
  // B.1.1 User B cannot read User A's plan
  try {
    // Type the query response
    const { data, error }: { data: Plan[] | null; error: PostgrestError | null } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planAId); // Use planAId here
    if (error) throw error;
    if (data && data.length > 0) { // Ensure data is not null before checking length
        console.error(`❌ [B.1.1] Failed: User B COULD read User A's plan:`, data);
    } else {
        console.log("✅ [B.1.1] Correctly blocked: User B cannot read plan for User A (no data returned)");
    }
  } catch (error: any) { // Type error
    console.log(`✅ [B.1.1] Correctly blocked: User B cannot read plan for User A (${error.message})`);
  }

  // B.1.2 User B creates own plan
  try {
    const { data, error }: { data: Plan | null; error: PostgrestError | null } = await supabase // Typed, corrected to Plan | null
      .from('plans')
      .insert({
        user_id: userB.id, // Ensure userB.id is used
        title: `User B Plan ${testRunId}`,
        start_date: new Date().toISOString().split('T')[0],
        status: 'pending' // FIX: Explicitly set a valid status
      })
      .select()
      .single(); // Expecting a single record back

    if (error || !data) { // Check error and data
      console.error(`❌ [B.1.2] Failed: User B could not create own plan:`, error?.message || 'No data returned');
      // Log the full error for debugging
       if (error) {
          console.error('Full error details:', JSON.stringify(error, null, 2));
       }
    } else {
      planBId = data.id; // Store plan B's ID
      console.log(`✅ [B.1.2] User B created own plan: ${planBId}`);
    }
  } catch (error: any) { // Type error
    console.error(`❌ [B.1] Failed allowed action for User B:`, error.message);
  }

  console.log('\n--- Test B.2: Disallowed Actions (User B) ---');
  // B.2.1 User B cannot update User A's plan
  try {
      // Attempt to update User A's plan
      // Type update response, Supabase might return data: null, error: null, count: 0 if RLS blocks
      const { error: updateError, count: updateCount }: { error: PostgrestError | null; count: number | null } = await supabase
          .from('plans')
          .update({ status: 'completed' })
          .eq('id', planAId)

      if (updateError) {
           if (isRLSError(updateError)) {
              console.log(`✅ [B.2.1] Correctly blocked: User B cannot update plan for User A: ${updateError.message}`);
          } else {
              // Different kind of error occurred
              console.error(`❌ [B.2.1] Update attempt failed with non-RLS error: ${updateError.message}`);
              throw updateError;
          }
      } else if (updateCount !== null && updateCount > 0) {
          // If error is null BUT count > 0, the update went through - RLS FAILED!
          console.error(`❌ [B.2.1] RLS FAILED: User B update on User A's plan succeeded (${updateCount} rows affected).`);
          // Optional: Query again to confirm the status change
      } else {
          // No error, and count is 0 or null - Correctly blocked by RLS (implicitly)
          console.log(`✅ [B.2.1] Correctly blocked: User B update attempt on User A's plan affected 0 rows.`);
      }

  } catch (error: any) {
     // Catch errors thrown from the update attempt itself (e.g., network issues)
     console.error(`❌ [B.2] General failure during disallowed action test for User B:`, error?.message);
  }

  // 4. Final Sign Out
  await signOutUser();

  console.log('\n--- RLS Tests Finished ---');
}

// --- Main Execution --- 
async function main(): Promise<void> {
  try {
    initializeClients();
    await runRLSTests();
  } catch (error: any) {
    console.error('\n🚨 An error occurred during the test execution:', error);
  } finally {
    // Ensure cleanup runs even if tests fail
    await cleanupTestUsers();
  }
}

main();

 