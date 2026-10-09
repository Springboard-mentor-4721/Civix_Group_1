const Petition = require('../models/petition.model');
const Poll = require('../models/poll.model');
const Vote = require('../models/vote.model');

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
      const [myPetitions, successfulPetitions, activePetitionsNearYou, pollsParticipated] = await Promise.all([
        Petition.countDocuments({ creator: userId }),
        Petition.countDocuments({
          creator: userId,
          status: { $in: ['active', 'under_review', 'resolved'] }
        }),
        Petition.countDocuments({
          status: 'active',
          'location.city': city,
          'location.state': state
        }),
        Vote.countDocuments({ user: userId })
      ]);

      stats.myPetitions = myPetitions;
      stats.successfulPetitions = successfulPetitions;
      stats.activePetitionsNearYou = activePetitionsNearYou;
      stats.pollsParticipated = pollsParticipated;
      return stats;
    }

    if (role === 'official') {
      const jurisdictionMatch = {
        status: 'under_review',
        'location.city': city,
        'location.state': state
      };
      const [petitionsPendingReview, incomingPetitionsForDepartmentReview, activeMunicipalPolls] = await Promise.all([
        Petition.countDocuments(jurisdictionMatch),
        Petition.countDocuments(jurisdictionMatch),
        Poll.countDocuments({
          status: 'active',
          'location.city': city,
          'location.state': state
        })
      ]);

      stats.petitionsPendingReview = petitionsPendingReview;
      stats.incomingPetitionsForDepartmentReview = incomingPetitionsForDepartmentReview;
      stats.activeMunicipalPolls = activeMunicipalPolls;
      return stats;
    }

    return stats;
  }
}

module.exports = new DashboardService();