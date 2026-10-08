const express = require('express');
const pollController = require('../controllers/poll.controller');
const {
  createPollValidator,
  voteValidator,
  pollQueryValidator,
  pollIdValidator,
  updatePollStatusValidator
} = require('../validators/poll.validator');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', pollQueryValidator, validate, pollController.getPolls);
router.get('/my', authenticate, pollQueryValidator, validate, pollController.getMyPolls);
router.post('/', authenticate, createPollValidator, validate, pollController.createPoll);
router.get('/:id/results', pollIdValidator, validate, pollController.getPollResults);
router.post('/:id/vote', authenticate, voteValidator, validate, pollController.votePoll);
router.patch('/:id/status', authenticate, updatePollStatusValidator, validate, pollController.updatePollStatus);
router.get('/:id', pollIdValidator, validate, pollController.getPollById);
router.delete('/:id', authenticate, pollIdValidator, validate, pollController.deletePoll);

module.exports = router;