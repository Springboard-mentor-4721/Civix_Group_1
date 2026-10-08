const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

class DashboardController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await dashboardService.getStatsForUser(req.user);
      return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new DashboardController();