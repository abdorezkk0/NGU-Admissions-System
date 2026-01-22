const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/applicationController');
const programController = require('../controllers/programController');
const { authenticate } = require('../../auth/middleware/authenticate');
const { authorize } = require('../../auth/middleware/authorize');

// ==================== PUBLIC ROUTES ====================

// Programs - Anyone can view
router.get('/programs', programController.getAllPrograms);
router.get('/programs/:id', programController.getProgramById);


// ==================== AUTH REQUIRED ====================
router.use(authenticate);

// ==================== STUDENT ROUTES ====================

// Create application (draft)
router.post('/', applicationController.createApplication);

// Pay application fee (MUST be before submit)
router.post('/:id/pay', applicationController.payApplication);

// My applications
router.get('/my-applications', applicationController.getMyApplications);

// CRUD
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

// Submit and withdraw
router.post('/:id/submit', applicationController.submitApplication);
router.post('/:id/withdraw', applicationController.withdrawApplication);

// ==================== STAFF/ADMIN ROUTES ====================

// Get all applications (with filters)
router.get(
  '/admin/all',
  authorize('staff', 'admin'),
  applicationController.getAllApplications
);

// Update status
router.patch(
  '/:id/status',
  authorize('staff', 'admin'),
  applicationController.updateApplicationStatus
);

// Decisions
router.post(
  '/:id/decision',
  authorize('staff', 'admin'),
  applicationController.makeDecision
);

module.exports = router;
