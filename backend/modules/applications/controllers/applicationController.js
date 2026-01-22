const applicationService = require('../services/applicationService');
const catchAsync = require('../../../shared/utils/catchAsync');
const AppError = require('../../../shared/utils/appError');

/**
 * Create new application (draft)
 */
exports.createApplication = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const applicationData = req.body;

  const application = await applicationService.createApplication(userId, applicationData);

  res.status(201).json({
    success: true,
    message: 'Application created successfully',
    data: application,
  });
});

/**
 * Pay application fee
 */
exports.payApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // NEVER store card details. Only store paymentRef + paid flag.
  const { amount } = req.body;

  const application = await applicationService.payApplication(
    id,
    userId,
    Number(amount || 50)
  );

  res.status(200).json({
    success: true,
    message: 'Payment successful',
    data: application,
  });
});

/**
 * Get user's applications
 */
exports.getMyApplications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const applications = await applicationService.getUserApplications(userId);

  res.status(200).json({
    success: true,
    message: 'Applications retrieved successfully',
    data: applications,
  });
});

/**
 * Get specific application by ID
 */
exports.getApplicationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const application = await applicationService.getApplicationById(id, userId, userRole);

  res.status(200).json({
    success: true,
    message: 'Application retrieved successfully',
    data: application,
  });
});

/**
 * Update application (draft only for students)
 */
exports.updateApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const updates = req.body;

  const application = await applicationService.updateApplication(
    id,
    userId,
    updates,
    userRole
  );

  res.status(200).json({
    success: true,
    message: 'Application updated successfully',
    data: application,
  });
});

/**
 * Submit application for review (requires payment)
 */
exports.submitApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const application = await applicationService.submitApplication(id, userId, userRole);

  res.status(200).json({
    success: true,
    message: 'Application submitted successfully',
    data: application,
  });
});

/**
 * Delete application (draft only)
 */
exports.deleteApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  await applicationService.deleteApplication(id, userId, userRole);

  res.status(200).json({
    success: true,
    message: 'Application deleted successfully',
    data: null,
  });
});

/**
 * Withdraw submitted application
 */
exports.withdrawApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const application = await applicationService.withdrawApplication(id, userId, userRole);

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully',
    data: application,
  });
});

/**
 * Get all applications (staff/admin only) - with filters & pagination
 */
exports.getAllApplications = catchAsync(async (req, res, next) => {
  const { status, decision, programId, entryYear, page = 1, limit = 20 } = req.query;

  const filters = {
    status,
    decision,
    programId,
    entryYear: entryYear ? parseInt(entryYear) : undefined,
  };

  Object.keys(filters).forEach(key =>
    filters[key] === undefined && delete filters[key]
  );

  const result = await applicationService.getAllApplications(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    message: 'Applications retrieved successfully',
    data: result.applications,
    pagination: result.pagination,
  });
});

/**
 * Update application status (staff/admin only)
 */
exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const application = await applicationService.updateApplicationStatus(
    id,
    status,
    userId
  );

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: application,
  });
});
/**
 * Pay application fee
 */
exports.payApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { amount } = req.body;

  const application = await applicationService.payApplication(
    id,
    userId,
    Number(amount || 50)
  );

  res.status(200).json({
    success: true,
    message: 'Payment successful',
    data: application,
  });
});


/**
 * Make admission decision (staff/admin only)
 */
exports.makeDecision = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { decision, notes } = req.body;
  const userId = req.user.id;

  if (!decision) {
    return next(new AppError('Decision is required', 400));
  }

  const application = await applicationService.makeDecision(
    id,
    decision,
    notes,
    userId
  );

  res.status(200).json({
    success: true,
    message: `Application ${decision} successfully`,
    data: application,
  });
});
