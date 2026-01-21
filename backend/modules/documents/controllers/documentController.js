const documentService = require('../services/documentService');
const { validateCreate, validateVerify } = require('../documentValidation');

async function submit(req, res, next) {
  try {
    const check = validateCreate(req.body);
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    // Get uploadedBy from authenticated user
    const uploadedBy = req.user.id;

    const doc = await documentService.submitDocument({
      ...req.body,
      uploadedBy,
    });

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
    const verifiedBy = req.user.id;

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

async function getAllDocuments(req, res, next) {
  try {
    if (!req.user || !['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Staff or admin role required.' 
      });
    }

    const { status, type, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const result = await documentService.listAll(query, { page, limit });

    return res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyDocuments(req, res, next) {
  try {
    const uploadedBy = req.user.id;

    const documents = await documentService.listByUploader(uploadedBy);

    return res.json({
      success: true,
      message: 'Your documents retrieved successfully',
      data: documents,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submit,
  getByApplication,
  verify,
  required,
  getAllDocuments,
  getMyDocuments,
};