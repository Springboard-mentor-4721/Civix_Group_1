const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, 201, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user._id);
      return sendSuccess(res, 200, 'Profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user._id, currentPassword, newPassword);
      return sendSuccess(res, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
