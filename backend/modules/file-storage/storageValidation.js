const ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
];

function validateUpload({ file, maxSizeMB = 10 }) {
  if (!file) return { ok: false, message: 'No file uploaded' };

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) return { ok: false, message: `File too large. Max ${maxSizeMB}MB` };

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return { ok: false, message: `Invalid file type. Allowed: ${ALLOWED_MIME.join(', ')}` };
  }

  return { ok: true };
}

module.exports = { validateUpload };
