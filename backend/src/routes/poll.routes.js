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

// Public list route
router.get('/', pollQueryValidator, validate, pollController.getPolls);

// Protected routes (Specific paths before parameterized :id paths)
router.get('/my', authenticate, pollQueryValidator, validate, pollController.getMyPolls);
router.post('/', authenticate, createPollValidator, validate, pollController.createPoll);

// Specific ID sub-routes
router.get('/:id/results', pollIdValidator, validate, pollController.getPollResults);
router.post('/:id/vote', authenticate, voteValidator, validate, pollController.votePoll);
router.patch('/:id/status', authenticate, updatePollStatusValidator, validate, pollController.updatePollStatus);

// Single poll resource routes
router.get('/:id', pollIdValidator, validate, pollController.getPollById);
router.delete('/:id', authenticate, pollIdValidator, validate, pollController.deletePoll);

module.exports = router;
