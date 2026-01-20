const AppError = require('../../../shared/utils/appError');

/**
 * Authorization middleware - Checks user role
 * Must be used after authenticate middleware
 * 
 * @param {String|Array} allowedRoles - Single role or array of roles
 * 
 * Usage:
 *   router.get('/admin', authenticate, authorize('admin'), controller)
 *   router.get('/staff', authenticate, authorize(['admin', 'staff']), controller)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Flatten array if roles passed as array
    const roles = allowedRoles.flat();

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user is the resource owner or has admin/staff role
 * Useful for endpoints where users can only access their own data
 * 
 * Usage:
 *   router.get('/profile/:userId', authenticate, authorizeOwnerOrStaff('userId'), controller)
 */
const authorizeOwnerOrStaff = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const requestedUserId = req.params[userIdParam] || req.body[userIdParam];

    // Allow if user is admin/staff or requesting their own data
    const isOwner = req.user.id === requestedUserId;
    const isStaff = ['admin', 'staff'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return next(new AppError('Access denied. You can only access your own resources', 403));
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeOwnerOrStaff,
};