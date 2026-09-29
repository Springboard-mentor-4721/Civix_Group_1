const Petition = require('../models/petition.model');
const OfficialResponse = require('../models/official-response.model');

class OfficialService {
  /**
   * Get petitions relevant to official's locality with search, filters, and pagination
   */
  async getLocalityPetitions(officialUser, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Locality determination: query params override official's profile location
    const targetCity = queryParams.city || (officialUser.location && officialUser.location.city);
    const targetState = queryParams.state || (officialUser.location && officialUser.location.state);

    if (targetCity && targetCity.trim()) {
      filter['location.city'] = new RegExp(targetCity.trim(), 'i');
    }
    if (targetState && targetState.trim()) {
      filter['location.state'] = new RegExp(targetState.trim(), 'i');
    }

    // Status filter
    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    // Category filter
    if (queryParams.category) {
      filter.category = queryParams.category;
    }

    // Tag filter
    if (queryParams.tag) {
      filter.tags = queryParams.tag.trim().toLowerCase();
    }

    // Keyword search
    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Sorting
    const sortBy = queryParams.sortBy || 'createdAt';
    const order = queryParams.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    const [petitions, total] = await Promise.all([
      Petition.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name email role location'),
      Petition.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      petitions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      officialJurisdiction: {
        city: officialUser.location ? officialUser.location.city : '',
        state: officialUser.location ? officialUser.location.state : ''
      }
    };
  }

  /**
   * Submit an official response/comment on a petition and optionally update petition status
   */
  async respondToPetition(petitionId, officialUser, responseData) {
    const petition = await Petition.findById(petitionId);

    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = petition.status;
    const newStatus = responseData.newStatus || responseData.status || previousStatus;

    // Update petition status if changed
    if (newStatus !== previousStatus) {
      petition.status = newStatus;
      await petition.save();
    }

    // Create official response record
    const officialResponse = await OfficialResponse.create({
      petition: petitionId,
      official: officialUser._id,
      comment: responseData.comment,
      previousStatus,
      newStatus,
      department: responseData.department || '',
      officialTitle: responseData.officialTitle || ''
    });

    await officialResponse.populate('official', 'name email role location');
    const updatedPetition = await petition.populate('creator', 'name email role location');

    return {
      officialResponse,
      petition: updatedPetition
    };
  }

  /**
   * Get all official responses/history for a specific petition
   */
  async getPetitionResponses(petitionId) {
    const petition = await Petition.findById(petitionId);

    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    const responses = await OfficialResponse.find({ petition: petitionId })
      .sort({ createdAt: -1 })
      .populate('official', 'name email role location');

    return {
      petitionId,
      totalResponses: responses.length,
      responses
    };
  }

  /**
   * Update petition status by official
   */
  async updatePetitionStatus(petitionId, officialUser, statusData) {
    const petition = await Petition.findById(petitionId);

    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = petition.status;
    const newStatus = statusData.status;

    petition.status = newStatus;
    await petition.save();

    let officialResponse = null;
    // Log official status change response if comment is provided or audit record
    if (statusData.comment) {
      officialResponse = await OfficialResponse.create({
        petition: petitionId,
        official: officialUser._id,
        comment: statusData.comment,
        previousStatus,
        newStatus,
        department: statusData.department || '',
        officialTitle: statusData.officialTitle || ''
      });
      await officialResponse.populate('official', 'name email role location');
    }

    const updatedPetition = await petition.populate('creator', 'name email role location');

    return {
      petition: updatedPetition,
      officialResponse
    };
  }
}

module.exports = new OfficialService();
