const programService = require('../services/programService');
const catchAsync = require('../../../shared/utils/catchAsync');

/**
 * Get all active programs
 */
exports.getAllPrograms = catchAsync(async (req, res, next) => {
  const programs = await programService.getAllPrograms();

  res.status(200).json({
    success: true,
    message: 'Programs retrieved successfully',
    data: programs,
  });
});

/**
 * Get program by ID
 */
exports.getProgramById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const program = await programService.getProgramById(id);

  res.status(200).json({
    success: true,
    message: 'Program retrieved successfully',
    data: program,
  });
});

/**
 * Get program by code
 */
exports.getProgramByCode = catchAsync(async (req, res, next) => {
  const { code } = req.params;

  const program = await programService.getProgramByCode(code);

  res.status(200).json({
    success: true,
    message: 'Program retrieved successfully',
    data: program,
  });
});