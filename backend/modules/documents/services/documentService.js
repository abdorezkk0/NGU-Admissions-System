const documentRepo = require('../repository/documentRepository');

// you can make this dynamic per program/college later
const REQUIRED_DOCS = [
  { type: 'national_id', label: 'National ID' },
  { type: 'transcript', label: 'Transcript' },
  { type: 'photo', label: 'Personal Photo' },
];

async function submitDocument({ applicationId, type, fileId, uploadedBy }) {
  return documentRepo.create({
    applicationId,
    type,
    fileId,
    uploadedBy,
    status: 'pending_review',
  });
}

async function listByApplication(applicationId) {
  return documentRepo.findByApplication(applicationId);
}

async function verifyDocument({ documentId, status, verifiedBy, verifyNote }) {
  return documentRepo.updateStatus(documentId, { status, verifiedBy, verifyNote });
}

function requiredDocuments() {
  return REQUIRED_DOCS;
}

module.exports = {
  submitDocument,
  listByApplication,
  verifyDocument,
  requiredDocuments,
};
