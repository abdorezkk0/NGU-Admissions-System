const documentRepo = require('../repository/documentRepository');
const { supabase } = require('../../../shared/config/supabase');

// Required documents - can be made dynamic per program/college later
const REQUIRED_DOCS = [
  { type: 'national_id', label: 'National ID' },
  { type: 'transcript', label: 'Transcript' },
  { type: 'photo', label: 'Personal Photo' },
];

async function submitDocument({ applicationId, type, fileId, uploadedBy }) {
  console.log('📝 Service - Creating document:', { applicationId, type, fileId, uploadedBy });

  // Validate that file exists in Supabase
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (fileError || !file) {
    throw new Error('File not found');
  }

  // Create document with fileName from file record
  return documentRepo.create({
    applicationId,
    type,
    fileId,
    fileName: file.original_name,
    uploadedBy,
    status: 'pending_review',
  });
}

async function listByApplication(applicationId) {
  return documentRepo.findByApplication(applicationId);
}

async function verifyDocument({ documentId, status, verifiedBy, verifyNote }) {
  return documentRepo.updateStatus(documentId, { 
    status, 
    verifiedBy, 
    verifyNote,
    verifiedAt: new Date(), 
  });
}

function requiredDocuments() {
  return REQUIRED_DOCS;
}

/**
 * Get all documents with pagination and filters (staff/admin)
 */
async function listAll(query, options) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const documents = await documentRepo.findAll(query, skip, limit);
  const total = await documentRepo.count(query);

  return {
    documents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get documents by uploader (student's own documents)
 */
async function listByUploader(uploadedBy) {
  return documentRepo.findByUploader(uploadedBy);
}

module.exports = {
  submitDocument,
  listByApplication,
  verifyDocument,
  requiredDocuments,
  listAll,
  listByUploader,
};