const crypto = require('crypto');
const File = require('../models/File');
const { getStorageProvider } = require('../config/storageConfig');

function extFromMime(mime) {
  if (mime === 'application/pdf') return '.pdf';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/jpeg') return '.jpg';
  return '';
}

class StorageService {
  constructor() {
    this.provider = getStorageProvider();
  }

  async uploadFile({ userId, file, folder = 'documents' }) {
    const id = crypto.randomUUID();
    const ext = extFromMime(file.mimetype);
    const storagePath = `${folder}/${id}${ext}`;

    const uploaded = await this.provider.upload({
      storagePath,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    const saved = await File.create({
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      bucket: uploaded.bucket,
      storagePath: uploaded.storagePath,
      provider: this.provider.providerName(),
    });

    return saved;
  }

  // ✅ ADD THIS METHOD
  async getSignedUrl(fileId, expiresIn = 300) {
    const file = await File.findById(fileId);
    if (!file) return null;

    const url = await this.provider.createSignedUrl({
      storagePath: file.storagePath,
      expiresIn,
    });

    return { file, url };
  }

  // ✅ (Optional) ADD DELETE METHOD if your controller uses it
  async deleteFile(fileId) {
    const file = await File.findById(fileId);
    if (!file) return null;

    await this.provider.remove({ storagePath: file.storagePath });
    await File.deleteOne({ _id: fileId });

    return true;
  }
}

module.exports = new StorageService();
//documents+storage