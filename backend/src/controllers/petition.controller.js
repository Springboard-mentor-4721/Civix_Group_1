const petitionService = require('../services/petition.service');
const { sendSuccess } = require('../utils/response');

class PetitionController {
  /**
   * Create a new petition
   */
  async createPetition(req, res, next) {
    try {
      const petition = await petitionService.create(req.user._id, req.body);
      return sendSuccess(res, 201, 'Petition created successfully', { petition });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all petitions with search, filtering, and pagination
   */
  async getPetitions(req, res, next) {
    try {
      const result = await petitionService.findAll(req.query);
      return sendSuccess(res, 200, 'Petitions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's petitions
   */
  async getMyPetitions(req, res, next) {
    try {
      const result = await petitionService.findByUser(req.user._id, req.query);
      return sendSuccess(res, 200, 'User petitions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single petition by ID
   */
  async getPetitionById(req, res, next) {
    try {
      const petition = await petitionService.findById(req.params.id);
      return sendSuccess(res, 200, 'Petition retrieved successfully', { petition });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a petition
   */
  async updatePetition(req, res, next) {
    try {
      const petition = await petitionService.update(
        req.params.id,
        req.user._id,
        req.body
      );
      return sendSuccess(res, 200, 'Petition updated successfully', { petition });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a petition
   */
  async deletePetition(req, res, next) {
    try {
      const result = await petitionService.delete(req.params.id, req.user._id);
      return sendSuccess(res, 200, 'Petition deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sign a petition
   */
  async signPetition(req, res, next) {
    try {
      const result = await petitionService.signPetition(req.params.id, req.user._id);
      return sendSuccess(res, 200, 'Petition signed successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PetitionController();
