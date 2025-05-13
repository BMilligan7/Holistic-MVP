import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock the createClient function from @supabase/supabase-js
vi.mock('@supabase/supabase-js', async (importOriginal) => {
  // It's good practice to try and get the original module if parts of it are still needed,
  // but be careful with modules that have side effects on import.
  let actualSupabase;
  try {
    actualSupabase = await importOriginal();
  } catch (e) {
    // If original import fails (e.g., due to its own env checks or other issues in test setup),
    // provide a basic empty object to spread.
    actualSupabase = {}; 
  }

  return {
    // Spread original exports. Cast to 'any' to avoid type issues if actualSupabase is {}.
    ...(actualSupabase as any), 
    createClient: vi.fn(() => {
      console.log('[TESTING] Mocked Supabase createClient function IS CALLED.');
      
      const mockedClient = {
        auth: {
          signUp: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.signUp IS CALLED');
            return Promise.resolve({ data: { user: null, session: null }, error: null });
          }),
          signInWithPassword: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.signInWithPassword IS CALLED');
            return Promise.resolve({ data: { user: null, session: null }, error: null });
          }),
          signOut: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.signOut IS CALLED');
            return Promise.resolve({ error: null });
          }),
          onAuthStateChange: vi.fn((_event, callback) => {
            console.log('[TESTING] Mocked supabase.auth.onAuthStateChange IS CALLED');
            return {
              data: { subscription: { unsubscribe: vi.fn() } },
            };
          }),
          getSession: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.getSession IS CALLED');
            return Promise.resolve({ data: { session: null }, error: null });
          }),
          setSession: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.setSession IS CALLED');
            return Promise.resolve({ data: {}, error: null });
          }),
          getUser: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.getUser IS CALLED');
            return Promise.resolve({ data: { user: null }, error: null });
          }),
          resetPasswordForEmail: vi.fn().mockImplementation(() => {
            console.log('[TESTING] Mocked supabase.auth.resetPasswordForEmail IS CALLED');
            return Promise.resolve({ data: {}, error: null });
          }),
        },
      };

      // Log the structure of the mocked client
      console.log('[TESTING] Mocked Supabase client object being returned. Type:', typeof mockedClient);
      if (mockedClient) {
        console.log('[TESTING] ...mockedClient.auth defined?', typeof mockedClient.auth !== 'undefined');
        if (mockedClient.auth) {
          console.log('[TESTING] ...mockedClient.auth.getSession is function?', typeof mockedClient.auth.getSession === 'function');
        }
      }
      return mockedClient;
    }),
  };
});

// Any other global test setup (e.g., for testing-library) that was originally here
// and IS NOT related to import.meta or SUPABASE_URL mocks should remain if needed.
// For now, we are focusing on just the Supabase client mock.