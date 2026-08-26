const User = require('../models/user.model');
const { generateToken } = require('../utils/token');

class AuthService {
  /**
   * Register a new citizen or official user
   */
  async register(userData) {
    const { name, email, password, role, location, verification } = userData;

    // Check if email is already in use
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    // Build user object
    const userToCreate = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'citizen'
    };

    if (location) {
      userToCreate.location = {
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        pincode: location.pincode || '',
        latitude: location.latitude !== undefined ? location.latitude : null,
        longitude: location.longitude !== undefined ? location.longitude : null
      };
    }

    if (verification) {
      userToCreate.verification = {
        isVerified: false,
        status: verification.documentType ? 'pending' : 'unsubmitted',
        documentType: verification.documentType || null
      };
    }

    const user = await User.create(userToCreate);

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Get user profile by user ID
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user.toJSON();
  }
}

module.exports = new AuthService();
