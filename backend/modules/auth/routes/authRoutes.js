const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const { authLimiter } = require('../../../shared/middleware/rateLimiter');
const validateRequest = require('../../../shared/middleware/validateRequest');
const authValidation = require('../validation/authValidation');

const router = express.Router();

// Public routes (with strict rate limiting)
router.post(
  '/register',
  authLimiter,
  validateRequest(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(authValidation.login),
  authController.login
);

router.post(
  '/refresh-token',
  validateRequest(authValidation.refreshToken),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

router.get('/verify-email', authController.verifyEmail);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.post('/logout', authController.logout);

router.get('/me', authController.getMe);

router.patch(
  '/me',
  validateRequest(authValidation.updateProfile),
  authController.updateMe
);

module.exports = router;