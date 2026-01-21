const { supabase } = require('../../../shared/config/supabase');
const config = require('../../../shared/config/environment');

class SupabaseProvider {
  providerName() {
    return 'supabase';
  }

  bucket() {
    return config.SUPABASE_BUCKET;
  }

  async upload({ path, buffer, mimeType }) {
    const { error } = await supabase.storage
      .from(this.bucket())
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    return { bucket: this.bucket(), storagePath: path };
  }

  async remove({ path }) {
    const { error } = await supabase.storage.from(this.bucket()).remove([path]);
    if (error) throw error;
    return true;
  }

  async createSignedUrl({ path, expiresInSeconds = 60 }) {
    const { data, error } = await supabase.storage
      .from(this.bucket())
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  }
}

module.exports = SupabaseProvider;
