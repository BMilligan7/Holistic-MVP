/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add Vitest configuration
  test: {
    globals: true, // Allows using describe, test, expect, etc. without importing them
    environment: 'jsdom', // Simulates a browser environment
    setupFiles: './src/testSetup.ts', // Optional: for global test setup (e.g., Jest-DOM matchers)
    css: true, // If you want to test components that import CSS files
  },
}) 