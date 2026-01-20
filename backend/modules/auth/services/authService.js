const { supabase } = require('../../../shared/config/supabase');
const tokenManager = require('../utils/tokenManager');
const AppError = require('../../../shared/utils/appError');

class AuthService {
  /**
   * Register new user
   */
  async register(email, password, fullName, role = 'applicant') {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) {
        throw new AppError(authError.message, 400);
      }

      if (!authData.user) {
        throw new AppError('User registration failed', 400);
      }

      // 2. Create profile in Supabase profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        // Rollback: Delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new AppError('Profile creation failed', 500);
      }

      // 3. Generate JWT tokens
      const tokens = tokenManager.generateTokenPair({
        id: authData.user.id,
        email: email,
        role: role,
      });

      return {
        user: {
          id: authData.user.id,
          email: email,
          fullName: fullName,
          role: role,
          emailVerified: false,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Registration failed', 500);
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new AppError('Invalid email or password', 401);
      }

      if (!authData.user) {
        throw new AppError('Login failed', 401);
      }

      // 2. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new AppError('User profile not found', 404);
      }

      // 3. Generate JWT tokens
      const tokens = tokenManager.generateTokenPair({
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
      });

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: profile.full_name,
          role: profile.role,
          emailVerified: authData.user.email_confirmed_at ? true : false,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // 1. Verify refresh token
      const decoded = tokenManager.verifyRefreshToken(refreshToken);

      // 2. Get user profile to ensure user still exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (profileError || !profile) {
        throw new AppError('User not found', 404);
      }

      // 3. Generate new access token
      const accessToken = tokenManager.generateAccessToken({
        id: profile.id,
        email: profile.email,
        role: profile.role,
      });

      return {
        accessToken,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Token refresh failed', 401);
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(userId) {
    try {
      const { error } = await supabase.auth.admin.signOut(userId);

      if (error) {
        throw new AppError('Logout failed', 500);
      }

      return true;
    } catch (error) {
      // Even if Supabase logout fails, we can still clear client-side tokens
      return true;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Password reset request failed', 500);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Password reset failed', 500);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        throw new AppError('User profile not found', 404);
      }

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        emailVerified: profile.email_verified,
        phoneNumber: profile.phone_number,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch user profile', 500);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new AppError('Profile update failed', 400);
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        phoneNumber: data.phone_number,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Profile update failed', 500);
    }
  }

  /**
   * Verify user by ID (used by middleware)
   */
  async verifyUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('id', userId)
        .single();

      if (error || !data) {
        throw new AppError('User not found', 404);
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role,
        fullName: data.full_name,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('User verification failed', 401);
    }
  }
}

module.exports = new AuthService();