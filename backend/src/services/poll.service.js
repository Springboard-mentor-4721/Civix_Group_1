const Poll = require('../models/poll.model');
const Vote = require('../models/vote.model');
const Petition = require('../models/petition.model');

class PollService {
  formatResults(poll) {
    const totalVotes = poll.totalVotes || 0;
    const optionsResults = (poll.options || []).map((option) => {
      const votesCount = option.votesCount || 0;
      const percentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;
      return { _id: option._id, text: option.text, votesCount, percentage };
    });

    return {
      pollId: poll._id,
      title: poll.title,
      description: poll.description,
      category: poll.category,
      status: poll.status,
      totalVotes,
      options: optionsResults,
      startDate: poll.startDate,
      endDate: poll.endDate,
      location: poll.location
    };
  }

  async create(userId, pollData) {
    const { title, description, category, options, location, endDate, relatedPetition, status } = pollData;

    const formattedOptions = (options || []).map((opt) => {
      const text = typeof opt === 'object' && opt !== null ? opt.text : opt;
      return { text: String(text).trim(), votesCount: 0 };
    });

    const poll = await Poll.create({
      title,
      description: description || '',
      category,
      options: formattedOptions,
      location,
      totalVotes: 0,
      status: status || 'active',
      endDate: endDate || null,
      createdBy: userId,
      relatedPetition: relatedPetition || null
    });

    return await poll.populate([
      { path: 'createdBy', select: 'name email role location' }
    ]);
  }

  async findAll(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;
    
    // Base filter
    const filter = {};
    if (queryParams.category) filter.category = queryParams.category;
    if (queryParams.city) filter['location.city'] = new RegExp(queryParams.city.trim(), 'i');
    if (queryParams.state) filter['location.state'] = new RegExp(queryParams.state.trim(), 'i');

    // Automatically route expired polls to "closed"
    const now = new Date();
    if (queryParams.status === 'closed') {
      filter.$or = [
        { status: 'closed' },
        { endDate: { $lt: now, $ne: null } }
      ];
    } else {
      filter.status = 'active';
      filter.$and = [
        { $or: [{ endDate: null }, { endDate: { $gt: now } }] }
      ];
    }

    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const sortBy = queryParams.sortBy || 'createdAt';
    const order = queryParams.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    const [polls, total] = await Promise.all([
      Poll.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role location'),
      Poll.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      polls,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    };
  }

  async findByUser(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const filter = { createdBy: userId };

    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.category) filter.category = queryParams.category;

    const sortBy = queryParams.sortBy || 'createdAt';
    const order = queryParams.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    const [polls, total] = await Promise.all([
      Poll.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email role location'),
      Poll.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      polls,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    };
  }

  async findById(pollId) {
    const poll = await Poll.findById(pollId).populate('createdBy', 'name email role location');
    if (!poll) {
      const error = new Error('Poll not found');
      error.statusCode = 404;
      throw error;
    }
    return poll;
  }

  async vote(pollId, userId, optionId) {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Auto-close check during vote cast
    if (poll.endDate && new Date(poll.endDate) < new Date()) {
      poll.status = 'closed';
      await poll.save();
      const error = new Error('Poll has ended and is now closed');
      error.statusCode = 400;
      throw error;
    }
    
    if (poll.status !== 'active') {
      const error = new Error('Cannot vote on a poll that is not active');
      error.statusCode = 400;
      throw error;
    }

    const optionExists = poll.options.some((opt) => opt._id.toString() === optionId.toString());
    if (!optionExists) {
      const error = new Error('Selected option does not exist in this poll');
      error.statusCode = 400;
      throw error;
    }

    try {
      await Vote.create({ poll: pollId, user: userId, optionId });
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error('You have already voted on this poll');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }

    const updatedPoll = await Poll.findOneAndUpdate(
      { _id: pollId, 'options._id': optionId },
      { $inc: { 'options.$.votesCount': 1, totalVotes: 1 } },
      { new: true }
    ).populate('createdBy', 'name email role location');

    return {
      vote: { pollId: updatedPoll._id, optionId, votedAt: new Date() },
      poll: updatedPoll,
      results: this.formatResults(updatedPoll)
    };
  }

  async getResults(pollId) {
    const poll = await Poll.findById(pollId).populate('createdBy', 'name email role location');
    if (!poll) {
      const error = new Error('Poll not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatResults(poll);
  }

  async updateStatus(pollId, userId, userRole, newStatus) {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.statusCode = 404;
      throw error;
    }
    if (poll.createdBy.toString() !== userId.toString() && userRole !== 'official') {
      const error = new Error('You are not authorized to update this poll');
      error.statusCode = 403;
      throw error;
    }
    poll.status = newStatus;
    await poll.save();
    return await poll.populate([{ path: 'createdBy', select: 'name email role location' }]);
  }

  async delete(pollId, userId, userRole) {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.statusCode = 404;
      throw error;
    }
    if (poll.createdBy.toString() !== userId.toString() && userRole !== 'official') {
      const error = new Error('You are not authorized to delete this poll');
      error.statusCode = 403;
      throw error;
    }
    if (poll.totalVotes > 0) {
      const error = new Error('Cannot delete a poll that has already received votes');
      error.statusCode = 400;
      throw error;
    }
    await Poll.findByIdAndDelete(pollId);
    return { deleted: true, id: pollId };
  }
}

module.exports = new PollService();