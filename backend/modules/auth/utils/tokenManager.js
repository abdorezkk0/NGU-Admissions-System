const jwt = require('jsonwebtoken');
const config = require('../../../shared/config/environment');
const AppError = require('../../../shared/utils/appError');

class TokenManager {
  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN, // 7 days
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN, // 30 days
    });
  }

  /**
   * Generate both tokens
   */
  generateTokenPair(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid access token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  /**
   * Decode token without verification (useful for debugging)
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new AppError('No authorization header provided', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Invalid authorization header format', 401);
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}

module.exports = new TokenManager();