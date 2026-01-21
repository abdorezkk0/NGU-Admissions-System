const multer = require('multer');
const path = require('path');
const AppError = require('../../../shared/utils/appError');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  console.log('🔍 File filter - checking:', file.originalname, file.mimetype);
  
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File type allowed');
    cb(null, true);
  } else {
    console.log('❌ File type rejected');
    cb(
      new AppError(
        'Invalid file type. Only PDF, JPEG, JPG, and PNG files are allowed.',
        400
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Middleware to handle single file upload
const uploadMiddleware = (req, res, next) => {
  console.log('📤 Upload middleware started');
  console.log('📤 Content-Type:', req.headers['content-type']);
  
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log('❌ Multer error:', err.code, err.message);
      // Multer error
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File size exceeds maximum limit of 10MB', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    } else if (err) {
      console.log('❌ Upload error:', err.message);
      // Other errors
      return next(err);
    }

    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file received in request');
      return next(new AppError('No file uploaded', 400));
    }

    console.log('✅ File received:', req.file.originalname, req.file.size, 'bytes');
    next();
  });
};

module.exports = { uploadMiddleware };