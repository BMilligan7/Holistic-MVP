import '@testing-library/jest-dom/vitest';

// Forcefully set the environment variables for tests
// This is a workaround for CI issues where test.env in vite.config.ts might not apply in time.
if (import.meta.env.MODE === 'test') {
  (import.meta.env as any).VITE_SUPABASE_URL = 'http://localhost:54321/test-via-setup';
  (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'dummy_key_for_ci_tests_via_setup';
} 