const storageService = require('../services/storageService');
const catchAsync = require('../../../shared/utils/catchAsync');
const AppError = require('../../../shared/utils/appError');

/**
 * Upload file
 * POST /api/files/upload
 */
exports.uploadFile = catchAsync(async (req, res, next) => {
  console.log('🚀 uploadFile called');
  console.log('📦 Method:', req.method);
  console.log('📦 Path:', req.path);
  console.log('📦 req.file:', req.file);
  
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const userId = req.user.id;
  const file = req.file;

  const uploadedFile = await storageService.uploadFile(userId, file);

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: uploadedFile,
  });
});

/**
 * Get user's files
 * GET /api/files/my-files
 */
exports.getMyFiles = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const files = await storageService.getUserFiles(userId);

  res.status(200).json({
    success: true,
    message: 'Files retrieved successfully',
    data: files,
  });
});

/**
 * Get file by ID
 * GET /api/files/:fileId
 */
exports.getFileById = catchAsync(async (req, res, next) => {
  const { fileId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const file = await storageService.getFileById(fileId, userId, userRole);

  res.status(200).json({
    success: true,
    message: 'File retrieved successfully',
    data: file,
  });
});

/**
 * Get signed download URL
 * GET /api/files/:fileId/signed-url
 */
exports.getSignedUrl = catchAsync(async (req, res, next) => {
  console.log('🔗 getSignedUrl called');
  console.log('📝 Method:', req.method);
  console.log('📝 Path:', req.path);
  console.log('📝 fileId:', req.params.fileId);
  
  const { fileId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const expiresIn = parseInt(req.query.expires) || 300; // Default 5 minutes

  const result = await storageService.getSignedUrl(fileId, userId, userRole, expiresIn);

  res.status(200).json({
    success: true,
    message: 'Download URL generated successfully',
    data: result,
  });
});

/**
 * Delete file
 * DELETE /api/files/:fileId
 */
exports.deleteFile = catchAsync(async (req, res, next) => {
  const { fileId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  await storageService.deleteFile(fileId, userId, userRole);

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
    data: null,
  });
});

/**
 * Get all files (staff/admin only)
 * GET /api/files/admin/all
 */
exports.getAllFiles = catchAsync(async (req, res, next) => {
  const userRole = req.user.role;

  if (!['staff', 'admin'].includes(userRole)) {
    return next(new AppError('Access denied. Staff or admin role required.', 403));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await storageService.getAllFiles(page, limit);

  res.status(200).json({
    success: true,
    message: 'Files retrieved successfully',
    data: result,
  });
});