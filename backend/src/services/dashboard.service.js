const Petition = require('../models/petition.model');

class DashboardService {
  async getStatsForUser(user) {
    const userId = user._id.toString();
    const role = user.role;
    const city = (user.location?.city || '').trim();
    const state = (user.location?.state || '').trim();

    const stats = {
      myPetitions: 0,
      successfulPetitions: 0,
      pollsParticipated: 0,
      activePetitionsNearYou: 0,
      petitionsPendingReview: 0,
      resolvedGrievances: 0,
      activeMunicipalPolls: 0,
      incomingPetitionsForDepartmentReview: 0
    };

    if (role === 'citizen') {
      const [myPetitions, successfulPetitions, activePetitionsNearYou] = await Promise.all([
        Petition.countDocuments({ creator: userId }),
        Petition.countDocuments({
          creator: userId,
          status: { $in: ['active', 'under_review'] }
        }),
        Petition.countDocuments({
          status: 'active',
          'location.city': city,
          'location.state': state
        })
      ]);

      stats.myPetitions = myPetitions;
      stats.successfulPetitions = successfulPetitions;
      stats.activePetitionsNearYou = activePetitionsNearYou;

      return stats;
    }

    if (role === 'official') {
      const jurisdictionMatch = {
        status: 'under_review',
        'location.city': city,
        'location.state': state
      };

      const [petitionsPendingReview, incomingPetitionsForDepartmentReview] = await Promise.all([
        Petition.countDocuments(jurisdictionMatch),
        Petition.countDocuments(jurisdictionMatch)
      ]);

      stats.petitionsPendingReview = petitionsPendingReview;
      stats.incomingPetitionsForDepartmentReview = incomingPetitionsForDepartmentReview;

      return stats;
    }

    return stats;
  }
}

module.exports = new DashboardService();
