const Document = require('../models/Document');

function create(data) {
  return Document.create(data);
}

function findById(id) {
  return Document.findById(id).populate('fileId');
}

function findByApplication(applicationId) {
  return Document.find({ applicationId }).sort({ createdAt: -1 }).populate('fileId');
}

function updateStatus(id, { status, verifiedBy, verifyNote }) {
  return Document.findByIdAndUpdate(
    id,
    { status, verifiedBy, verifyNote },
    { new: true }
  ).populate('fileId');
}

module.exports = { create, findById, findByApplication, updateStatus };
