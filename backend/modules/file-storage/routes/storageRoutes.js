const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { authenticate } = require('../../auth/middleware/authenticate');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

// ============================================
// PROTECTED ROUTES - Authentication Required
// ============================================

router.use(authenticate);

// Debug logging
router.use((req, res, next) => {
  console.log(`📍 Storage route: ${req.method} ${req.path}`);
  next();
});

// ============================================
// SPECIFIC ROUTES FIRST (before dynamic params)
// ============================================

/**
 * Upload file
 * POST /api/files/upload
 */
router.post('/upload', uploadMiddleware, storageController.uploadFile);

/**
 * Get user's uploaded files
 * GET /api/files/my-files
 */
router.get('/my-files', storageController.getMyFiles);

/**
 * Get all files (staff/admin only)
 * GET /api/files/admin/all
 */
router.get('/admin/all', storageController.getAllFiles);

// ============================================
// DYNAMIC ROUTES LAST (with :fileId param)
// ============================================

/**
 * Get signed download URL
 * GET /api/files/:fileId/signed-url
 */
router.get('/:fileId/signed-url', storageController.getSignedUrl);

/**
 * Get file details by ID
 * GET /api/files/:fileId
 */
router.get('/:fileId', storageController.getFileById);

/**
 * Delete file
 * DELETE /api/files/:fileId
 */
router.delete('/:fileId', storageController.deleteFile);

module.exports = router;