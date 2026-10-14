const officialService = require('../services/official.service');
const { sendSuccess } = require('../utils/response');

class OfficialController {
  /**
   * Get petitions in official's locality
   */
  async getLocalityPetitions(req, res, next) {
    try {
      const result = await officialService.getLocalityPetitions(req.user, req.query);
      return sendSuccess(res, 200, 'Locality petitions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Respond to a petition (add comment and update status)
   */
  async respondToPetition(req, res, next) {
    try {
      const result = await officialService.respondToPetition(
        req.params.id,
        req.user,
        req.body
      );
      return sendSuccess(res, 201, 'Official response recorded successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all official responses for a petition
   */
  async getPetitionResponses(req, res, next) {
    try {
      const result = await officialService.getPetitionResponses(req.params.id);
      return sendSuccess(res, 200, 'Petition responses retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update petition status
   */
  async updatePetitionStatus(req, res, next) {
    try {
      const result = await officialService.updatePetitionStatus(
        req.params.id,
        req.user,
        req.body
      );
      return sendSuccess(res, 200, 'Petition status updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all registered officials
   */
  async getRegisteredOfficials(req, res, next) {
    try {
      const result = await officialService.getRegisteredOfficials(req.query);
      return sendSuccess(res, 200, 'Registered officials retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OfficialController();
