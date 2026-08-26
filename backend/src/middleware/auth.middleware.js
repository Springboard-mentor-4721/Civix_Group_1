const { verifyToken } = require('../utils/token');
const { sendError } = require('../utils/response');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 401, 'Authentication token is required');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Authentication token has expired');
      }
      return sendError(res, 401, 'Invalid authentication token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User associated with this token no longer exists');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
