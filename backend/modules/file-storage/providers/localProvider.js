const fs = require('fs');
const path = require('path');
const config = require('../../../shared/config/environment');

class LocalProvider {
  providerName() {
    return 'local';
  }

  bucket() {
    return 'local';
  }

  _fullPath(relativePath) {
    // ✅ use config.UPLOAD_PATH and ensure it's a string
    const baseDir = config.UPLOAD_PATH || './uploads';
    return path.join(process.cwd(), baseDir, relativePath);
  }

  async upload({ storagePath, buffer }) {
    if (!storagePath) throw new Error('LocalProvider.upload: storagePath is required');

    const full = this._fullPath(storagePath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, buffer);

    return { bucket: this.bucket(), storagePath };
  }

  async remove({ storagePath }) {
    if (!storagePath) throw new Error('LocalProvider.remove: storagePath is required');

    const full = this._fullPath(storagePath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
    return true;
  }

  async createSignedUrl({ storagePath }) {
    if (!storagePath) throw new Error('LocalProvider.createSignedUrl: storagePath is required');
    return `/api/files/local/${encodeURIComponent(storagePath)}`;
  }
}

module.exports = LocalProvider;
