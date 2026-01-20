const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../../../shared/utils/appError');

/**
 * Validate application creation
 */
exports.validateCreateApplication = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('programId').isUUID().withMessage('Valid program ID is required'),
  body('entryYear').isInt({ min: 2024, max: 2030 }).withMessage('Entry year must be between 2024-2030'),
  body('entrySemester').isIn(['fall', 'spring', 'summer']).withMessage('Invalid entry semester'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];

/**
 * Validate application update
 */
exports.validateUpdateApplication = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('highSchoolGpa').optional().isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be between 0-4.0'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];

/**
 * Validate UUID parameter
 */
exports.validateUUID = [
  param('id').isUUID().withMessage('Invalid application ID'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid application ID format', 400));
    }
    next();
  },
];

/**
 * Validate status update
 */
exports.validateStatusUpdate = [
  body('status')
    .isIn(['draft', 'submitted', 'under_review', 'pending_documents', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Invalid status'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid status value', 400));
    }
    next();
  },
];

/**
 * Validate decision
 */
exports.validateDecision = [
  body('decision').isIn(['accepted', 'rejected', 'waitlisted']).withMessage('Invalid decision'),
  body('notes').optional().trim(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid decision value', 400));
    }
    next();
  },
];