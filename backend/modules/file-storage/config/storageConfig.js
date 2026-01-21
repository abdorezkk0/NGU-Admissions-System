const config = require('../../../shared/config/environment');
const LocalProvider = require('../providers/localProvider');
const SupabaseProvider = require('../providers/supabaseProvider');

function getStorageProvider() {
  if (config.STORAGE_PROVIDER === 'local') return new LocalProvider();
  return new SupabaseProvider();
}

module.exports = { getStorageProvider };
