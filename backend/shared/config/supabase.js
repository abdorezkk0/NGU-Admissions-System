const { createClient } = require('@supabase/supabase-js');
const config = require('./environment');

// Polyfill fetch for Node.js if needed (Node < 18)
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch');
}

// Validate required environment variables
if (!config.SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL in environment variables');
  process.exit(1);
}

if (!config.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in environment variables');
  console.error('⚠️  Backend requires SERVICE_ROLE key, not ANON key');
  process.exit(1);
}

// Create Supabase client with SERVICE_ROLE key
const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY, // ← MUST be SERVICE key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// 🔹 Test connection + storage access
const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    console.log('   URL:', config.SUPABASE_URL);
    console.log('   Using SERVICE_ROLE key:', config.SUPABASE_SERVICE_KEY.substring(0, 20) + '...');

    // ✅ Correct test for File Storage
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Supabase Storage error:', error);
      throw error;
    }

    console.log('✅ Supabase Connected');
    console.log('📦 Buckets found:', data.map(b => b.name).join(', ') || 'No buckets yet');
    console.log('   Default bucket:', config.SUPABASE_BUCKET || 'documents');
    console.log('');

  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('   Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env\n');
    throw error;
  }
};

module.exports = {
  supabase,
  testSupabaseConnection,
};
