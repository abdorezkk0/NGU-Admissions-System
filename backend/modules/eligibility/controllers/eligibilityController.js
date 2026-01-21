const eligibilityService = require('../services/eligibilityService');
const catchAsync = require('../../../shared/utils/catchAsync');
const AppError = require('../../../shared/utils/appError');

/**
 * Evaluate eligibility for an application
 * POST /api/eligibility/evaluate/:applicationId
 */
exports.evaluateEligibility = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;
  const evaluatedBy = req.user.id;

  const result = await eligibilityService.evaluateEligibility(applicationId, evaluatedBy);

  res.status(200).json({
    success: true,
    message: 'Eligibility evaluation completed',
    data: result,
  });
});

/**
 * Get eligibility result for an application
 * GET /api/eligibility/result/:applicationId
 */
exports.getEligibilityResult = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;

  const result = await eligibilityService.getEligibilityResult(applicationId);

  if (!result) {
    return next(new AppError('Eligibility result not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Eligibility result retrieved',
    data: result,
  });
});

/**
 * Get my eligibility results (student)
 * GET /api/eligibility/my-results
 */
exports.getMyEligibilityResults = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const results = await eligibilityService.getUserEligibilityResults(userId);

  res.status(200).json({
    success: true,
    message: 'Your eligibility results retrieved',
    data: results,
  });
});

/**
 * Get all eligibility results (staff/admin)
 * GET /api/eligibility/results
 */
exports.getAllEligibilityResults = catchAsync(async (req, res, next) => {
  // Check if user is staff or admin
  if (!['staff', 'admin'].includes(req.user.role)) {
    return next(new AppError('Access denied. Staff or admin role required.', 403));
  }

  const { status, programId, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (programId) query.programId = programId;

  const result = await eligibilityService.getAllEligibilityResults(query, { page, limit });

  res.status(200).json({
    success: true,
    message: 'Eligibility results retrieved',
    data: result,
  });
});

/**
 * Get eligibility requirements
 * GET /api/eligibility/requirements
 */
exports.getRequirements = catchAsync(async (req, res, next) => {
  const requirements = eligibilityService.getEligibilityRequirements();

  res.status(200).json({
    success: true,
    message: 'Eligibility requirements retrieved',
    data: requirements,
  });
});