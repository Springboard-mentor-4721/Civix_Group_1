const pollService = require('../services/poll.service');
const { sendSuccess } = require('../utils/response');

class PollController {
  async createPoll(req, res, next) {
    try {
      const poll = await pollService.create(req.user._id, req.body);
      return sendSuccess(res, 201, 'Poll created successfully', { poll });
    } catch (error) {
      next(error);
    }
  }

  async getPolls(req, res, next) {
    try {
      const result = await pollService.findAll(req.query);
      return sendSuccess(res, 200, 'Polls retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getMyPolls(req, res, next) {
    try {
      const result = await pollService.findByUser(req.user._id, req.query);
      return sendSuccess(res, 200, 'User polls retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getPollById(req, res, next) {
    try {
      const poll = await pollService.findById(req.params.id);
      return sendSuccess(res, 200, 'Poll retrieved successfully', { poll });
    } catch (error) {
      next(error);
    }
  }

  async votePoll(req, res, next) {
    try {
      const result = await pollService.vote(
        req.params.id,
        req.user._id,
        req.body.optionId
      );
      return sendSuccess(res, 200, 'Vote recorded successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getPollResults(req, res, next) {
    try {
      const results = await pollService.getResults(req.params.id);
      return sendSuccess(res, 200, 'Poll results retrieved successfully', { results });
    } catch (error) {
      next(error);
    }
  }

  async updatePollStatus(req, res, next) {
    try {
      const poll = await pollService.updateStatus(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body.status
      );
      return sendSuccess(res, 200, 'Poll status updated successfully', { poll });
    } catch (error) {
      next(error);
    }
  }

  async deletePoll(req, res, next) {
    try {
      const result = await pollService.delete(
        req.params.id,
        req.user._id,
        req.user.role
      );
      return sendSuccess(res, 200, 'Poll deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PollController();