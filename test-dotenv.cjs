// test-dotenv.cjs
console.log('Attempting to load .env file...');
try {
  // Use the same explicit path logic
  const dotenvResult = require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

  if (dotenvResult.error) {
    console.error('dotenv Error:', dotenvResult.error);
  } else {
    console.log('dotenv loaded successfully (or parsed without error).');
    console.log('Parsed variables:', dotenvResult.parsed); // See what dotenv *did* parse
  }

  // Now check process.env directly
  console.log('\nChecking process.env:');
  console.log('SUPABASE_URL loaded:', process.env.SUPABASE_URL ? 'Yes' : 'No');
  console.log('SUPABASE_ANON_KEY loaded:', process.env.SUPABASE_ANON_KEY ? 'Yes' : 'No');
  console.log('TEST_EMAIL loaded:', process.env.TEST_EMAIL ? 'Yes' : 'No');
  console.log('TEST_PASSWORD loaded:', process.env.TEST_PASSWORD ? 'Yes' : 'No');

} catch (error) {
  console.error('Critical error during dotenv loading:', error);
} 