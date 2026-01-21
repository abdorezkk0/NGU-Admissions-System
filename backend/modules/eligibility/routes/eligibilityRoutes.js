const express = require('express');
const router = express.Router();
const eligibilityController = require('../controllers/eligibilityController');
const { authenticate } = require('../../auth/middleware/authenticate');

// ============================================
// PROTECTED ROUTES - Authentication Required
// ============================================

router.use(authenticate);

/**
 * Get eligibility requirements
 * GET /api/eligibility/requirements
 */
router.get('/requirements', eligibilityController.getRequirements);

/**
 * Get my eligibility results (student)
 * GET /api/eligibility/my-results
 */
router.get('/my-results', eligibilityController.getMyEligibilityResults);

/**
 * Get all eligibility results (staff/admin)
 * GET /api/eligibility/results
 */
router.get('/results', eligibilityController.getAllEligibilityResults);

/**
 * Get eligibility result for an application
 * GET /api/eligibility/result/:applicationId
 */
router.get('/result/:applicationId', eligibilityController.getEligibilityResult);

/**
 * Evaluate eligibility for an application
 * POST /api/eligibility/evaluate/:applicationId
 */
router.post('/evaluate/:applicationId', eligibilityController.evaluateEligibility);

module.exports = router;