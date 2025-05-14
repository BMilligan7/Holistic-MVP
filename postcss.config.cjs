// This PostCSS configuration uses CommonJS (.cjs) syntax and file extension.
// REASON: In this project (package.json "type": "module"), Vite was not consistently
// processing the ESM-style postcss.config.mts file. Switching to .cjs resolved
// the issue, ensuring Tailwind CSS styles are correctly applied.
//
// TODO (Future Investigation):
// Explore why Vite struggled with postcss.config.mts. Potential areas include:
// - Vite version specifics regarding ESM PostCSS config loading.
// - tsconfig.json module resolution settings (e.g., ensure "moduleResolution": "bundler" or "nodenext").
// - Node.js/Vite interactions for .mts file types.
// This configuration can be reverted to .mts if the underlying issue is identified and resolved.

// No custom interface, just the direct config object
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}; 