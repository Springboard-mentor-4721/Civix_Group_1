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
      const now = new Date();
      await Poll.updateMany(
        { status: 'active', endDate: { $ne: null, $lt: now } },
        { $set: { status: 'closed' } }
      );

      const reviewMatch = { status: { $in: ['under_review', 'active'] } };
      const resolvedMatch = { status: { $in: ['resolved', 'closed'] } };
      const pollMatch = {
        status: 'active',
        $or: [{ endDate: null }, { endDate: { $gt: now } }]
      };

      if (city) {
        reviewMatch['location.city'] = new RegExp(city, 'i');
        resolvedMatch['location.city'] = new RegExp(city, 'i');
        pollMatch['location.city'] = new RegExp(city, 'i');
      }
      if (state) {
        reviewMatch['location.state'] = new RegExp(state, 'i');
        resolvedMatch['location.state'] = new RegExp(state, 'i');
        pollMatch['location.state'] = new RegExp(state, 'i');
      }

      const [petitionsPendingReview, resolvedGrievances, activeMunicipalPolls] = await Promise.all([
        Petition.countDocuments(reviewMatch),
        Petition.countDocuments(resolvedMatch),
        Poll.countDocuments(pollMatch)
      ]);

      stats.petitionsPendingReview = petitionsPendingReview;
      stats.incomingPetitionsForDepartmentReview = petitionsPendingReview;
      stats.resolvedGrievances = resolvedGrievances;
      stats.activeMunicipalPolls = activeMunicipalPolls;
      return stats;
    }

    return stats;
  }
}

module.exports = new DashboardService();