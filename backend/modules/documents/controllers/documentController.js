const documentService = require('../services/documentService');
const { validateCreate, validateVerify } = require('../documentValidation'); // ✅ FIXED PATH

async function submit(req, res, next) {
  try {
    const check = validateCreate(req.body);
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    const doc = await documentService.submitDocument(req.body);

    return res.status(201).json({
      message: 'Document submitted',
      document: doc,
    });
  } catch (err) {
    next(err);
  }
}

async function getByApplication(req, res, next) {
  try {
    const { id } = req.params;

    const docs = await documentService.listByApplication(id);

    return res.json({
      applicationId: id,
      documents: docs,
    });
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const check = validateVerify(req.body);
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    const { id } = req.params;

    const verifiedBy = req.body.verifiedBy || 'staff-unknown';

    const updated = await documentService.verifyDocument({
      documentId: id,
      status: req.body.status,
      verifiedBy,
      verifyNote: req.body.verifyNote || null,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Document not found' });
    }

    return res.json({
      message: 'Document updated',
      document: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function required(req, res) {
  return res.json({
    required: documentService.requiredDocuments(),
  });
}

module.exports = {
  submit,
  getByApplication,
  verify,
  required,
};
