const ALLOWED_TYPES = [
  'national_id',
  'passport',
  'transcript',
  'certificate',
  'photo',
  'other',
];

function validateCreate(payload = {}) {
  const { applicationId, type, fileId, uploadedBy } = payload;

  if (!applicationId) return { ok: false, message: 'applicationId is required' };
  if (!type) return { ok: false, message: 'type is required' };
  if (!fileId) return { ok: false, message: 'fileId is required' };
  return { ok: true };
}

function validateVerify(payload = {}) {
  const { status } = payload;
  if (!['approved', 'rejected'].includes(status)) {
    return { ok: false, message: 'status must be approved or rejected' };
  }
  return { ok: true };
}

module.exports = { validateCreate, validateVerify };
