import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Forcefully set the environment variables for tests using vi.mock for import.meta.env
// This is an attempt to ensure Supabase client initializes correctly in the test environment.
vi.mock('import.meta', () => {
  // It's good practice to preserve other existing import.meta.env variables
  const originalEnv = typeof import.meta !== 'undefined' ? import.meta.env : {};
  return {
    // Mock the 'env' property of import.meta
    env: {
      ...originalEnv, // Spread any original/default env vars Vitest might set
      VITE_SUPABASE_URL: 'http://localhost:54321/test-via-vi-mock-import-meta',
      VITE_SUPABASE_ANON_KEY: 'dummy_key_for_ci_tests_via_vi_mock_import-meta',
      // Vitest/Vite often use MODE, so ensure it's set for the test environment
      MODE: 'test',
      // You might need to add other VITE_ prefixed variables if your app uses them
      // or if default Vite behaviors expect them (e.g., VITE_USER_NODE_ENV)
    },
    // If your code uses other properties of import.meta (like import.meta.url),
    // they would need to be mocked here too. For now, we focus on 'env'.
    // Example: url: originalImportMeta.url || '',
  };
});

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
      console.log('[TESTING] Mocked Supabase createClient is being called.');
      return {
        auth: {
          signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
          signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
          signOut: vi.fn().mockResolvedValue({ error: null }),
          onAuthStateChange: vi.fn((_event, callback) => {
            // This mock for onAuthStateChange returns the expected subscription object.
            // You can extend it to call the callback if needed for specific tests.
            return {
              data: { subscription: { unsubscribe: vi.fn() } },
            };
          }),
          getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
          setSession: vi.fn().mockResolvedValue({ data: {}, error: null }), // If used
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
          resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
        },
        // Mock other Supabase services (like from, rpc) if your app uses them directly.
      };
    }),
  };
});

// Mock import.meta.env to ensure MODE is set and provide dummy Supabase variables
// This helps if any code directly inspects import.meta.env before Supabase client is used,
// or for other general test environment setup.
if (typeof import.meta !== 'undefined') {
  vi.stubGlobal('importMeta', {
    ...import.meta,
    env: {
      ...(import.meta.env || {}),
      VITE_SUPABASE_URL: 'http://localhost:54321/mocked-via-stubGlobal',
      VITE_SUPABASE_ANON_KEY: 'dummy-key-mocked-via-stubGlobal',
      MODE: 'test',
    },
  });
} else {
  // Fallback for environments where import.meta might not be standardly available during setup
  // (though Vitest should provide it).
  vi.stubGlobal('importMeta', {
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321/mocked-via-stubGlobal-fallback',
      VITE_SUPABASE_ANON_KEY: 'dummy-key-mocked-via-stubGlobal-fallback',
      MODE: 'test',
    },
  });
}

// Make sure MODE is set for Vitest/Vite, as some libraries or Vite itself might check it.
// This was commented out before, but it's safer to have it.
vi.mock('import.meta', () => {
  const originalMeta = typeof import.meta !== 'undefined' ? { ...import.meta } : {};
  return {
    ...originalMeta,
    env: {
      ...(originalMeta.env || {}),
      VITE_SUPABASE_URL: 'http://localhost:54321/mocked-via-setup', // Still provide dummies
      VITE_SUPABASE_ANON_KEY: 'dummy-key-mocked-via-setup',     // in case anything else looks
      MODE: 'test',
      // Add other VITE_ prefixed variables your app might expect
    },
  };
});

// ... any other global test setup you might have 