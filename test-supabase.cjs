require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client using environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// Test query: select all from profiles
supabase.from('profiles').select('*')
  .then(result => console.log('Profiles:', result.data))
  .catch(err => console.error('Error querying profiles:', err)) 