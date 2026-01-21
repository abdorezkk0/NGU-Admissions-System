const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../../auth/middleware/authenticate');

// ============================================
// PROTECTED ROUTES - Authentication Required
// ============================================

// Apply authentication to ALL document routes
router.use(authenticate);

/**
 * Submit/Create document
 * POST /api/documents
 */
router.post('/', documentController.submit);

/**
 * Get my uploaded documents (student)
 * GET /api/documents/my-documents
 */
router.get('/my-documents', documentController.getMyDocuments);

/**
 * Get all documents (staff/admin only) - MUST BE BEFORE /application/:id
 * GET /api/documents/all
 */
router.get('/all', documentController.getAllDocuments);

/**
 * Get required documents list
 * GET /api/documents/required
 */
router.get('/required', documentController.required);

/**
 * Get documents by application ID
 * GET /api/documents/application/:id
 */
router.get('/application/:id', documentController.getByApplication);

/**
 * Verify document (staff/admin only)
 * PUT /api/documents/:id/verify
 */
router.put('/:id/verify', documentController.verify);

module.exports = router;