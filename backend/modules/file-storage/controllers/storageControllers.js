const storageService = require('../services/storageService');
const { validateUpload } = require('../storageValidation'); // ✅ FIXED PATH

async function upload(req, res, next) {
  try {
    const userId = req.body.userId || 'anonymous';

    const check = validateUpload({ file: req.file, maxSizeMB: 10 });
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    const saved = await storageService.uploadFile({
      userId,
      file: req.file,
      folder: 'documents',
    });

    return res.status(201).json({
      message: 'File uploaded',
      fileId: saved._id,
      filePath: saved.storagePath,
      mimeType: saved.mimeType,
      size: saved.size,
    });
  } catch (err) {
    next(err);
  }
}

async function getSignedUrl(req, res, next) {
  try {
    const { id } = req.params;
    const expires = Number(req.query.expires || 300);

    const result = await storageService.getSignedUrl(id, expires);
    if (!result) {
      return res.status(404).json({ message: 'File not found' });
    }

    return res.json({
      fileId: result.file._id,
      filePath: result.file.storagePath,
      url: result.url,
      expiresIn: expires,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const ok = await storageService.deleteFile(id);
    if (!ok) {
      return res.status(404).json({ message: 'File not found' });
    }

    return res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  upload,
  getSignedUrl,
  remove,
};
