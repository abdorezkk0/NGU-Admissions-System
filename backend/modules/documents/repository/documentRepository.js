const Document = require('../models/Document');

async function create(data) {
  const doc = await Document.create(data);
  return doc;
}

async function findByApplication(applicationId) {
  return Document.find({ applicationId }).sort({ createdAt: -1 });
}

async function updateStatus(documentId, updates) {
  return Document.findByIdAndUpdate(
    documentId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

async function findById(documentId) {
  return Document.findById(documentId);
}

async function deleteById(documentId) {
  return Document.findByIdAndDelete(documentId);
}

/**
 * Find all documents with query filters, pagination
 */
async function findAll(query, skip, limit) {
  return Document.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

/**
 * Count documents matching query
 */
async function count(query) {
  return Document.countDocuments(query);
}

/**
 * Find documents by uploader (student's own documents)
 */
async function findByUploader(uploadedBy) {
  return Document.find({ uploadedBy }).sort({ createdAt: -1 });
}

module.exports = {
  create,
  findByApplication,
  updateStatus,
  findById,
  deleteById,
  findAll,
  count,
  findByUploader,
};