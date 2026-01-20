const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../../../shared/utils/response');
const AppError = require('../../../shared/utils/appError');

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName, role } = req.body;

      const result = await authService.register(email, password, fullName, role);

      return successResponse(
        res,
        result,
        'Registration successful. Please check your email to verify your account.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user.id; // From authenticate middleware

      await authService.logout(userId);

      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      await authService.requestPasswordReset(email);

      return successResponse(
        res,
        null,
        'Password reset instructions sent to your email'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      await authService.resetPassword(token, newPassword);

      return successResponse(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const userId = req.user.id; // From authenticate middleware

      const profile = await authService.getUserProfile(userId);

      return successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   * PATCH /api/auth/me
   */
  async updateMe(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Don't allow role or email updates through this endpoint
      delete updates.role;
      delete updates.email;
      delete updates.id;

      const profile = await authService.updateUserProfile(userId, updates);

      return successResponse(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email (callback from Supabase)
   * GET /api/auth/verify-email
   */
  async verifyEmail(req, res, next) {
    try {
      // Supabase handles email verification automatically
      // This is just a confirmation endpoint
      return successResponse(res, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();