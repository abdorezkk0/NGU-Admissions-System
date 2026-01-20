const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const programController = require('../controllers/programController');
const { authenticate } = require('../../auth/middleware/authenticate');
const { authorize } = require('../../auth/middleware/authorize');

// ==================== PUBLIC/AUTHENTICATED ROUTES ====================

// Programs - Anyone can view
router.get('/programs', programController.getAllPrograms);
router.get('/programs/:id', programController.getProgramById);

// All routes below require authentication
router.use(authenticate);

// ==================== STUDENT ROUTES ====================

// Create and manage applications
router.post('/', applicationController.createApplication);
router.get('/my-applications', applicationController.getMyApplications);
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

// Update status and make decisions
router.patch(
  '/:id/status',
  authorize('staff', 'admin'),
  applicationController.updateApplicationStatus
);

router.post(
  '/:id/decision',
  authorize('staff', 'admin'),
  applicationController.makeDecision
);

module.exports = router;