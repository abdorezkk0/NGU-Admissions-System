const tokenManager = require('../utils/tokenManager');
const authService = require('../services/authService');
const AppError = require('../../../shared/utils/appError');

/**
 * Authentication middleware - Verifies JWT token
 * Attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    const token = tokenManager.extractTokenFromHeader(authHeader);

    // 2. Verify token
    const decoded = tokenManager.verifyAccessToken(token);

    // 3. Verify user still exists in database
    const user = await authService.verifyUserById(decoded.id);

    // 4. Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    // 5. Attach token to request (useful for refresh)
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Authentication failed', 401));
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token, but attaches user if valid token exists
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = tokenManager.extractTokenFromHeader(authHeader);
    const decoded = tokenManager.verifyAccessToken(token);
    const user = await authService.verifyUserById(decoded.id);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};