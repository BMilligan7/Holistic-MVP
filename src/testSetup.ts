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

// ... any other global test setup you might have 