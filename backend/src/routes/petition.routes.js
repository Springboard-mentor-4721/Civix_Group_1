const express = require('express');
const petitionController = require('../controllers/petition.controller');
const officialController = require('../controllers/official.controller');
const {
  createPetitionValidator,
  updatePetitionValidator,
  petitionQueryValidator,
  petitionIdValidator
} = require('../validators/petition.validator');
const {
  officialResponseValidator,
  updatePetitionStatusValidator
} = require('../validators/official.validator');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

// Public routes (with optional auth so user's signed status is identified)
router.get('/', optionalAuthenticate, petitionQueryValidator, validate, petitionController.getPetitions);

// Protected routes (Specific routes before parameter routes)
router.get('/my', authenticate, petitionQueryValidator, validate, petitionController.getMyPetitions);
router.get('/signed', authenticate, petitionQueryValidator, validate, petitionController.getSignedPetitions);
router.post('/', authenticate, createPetitionValidator, validate, petitionController.createPetition);

// Official sub-routes on petitions (Milestone 4)
router.get('/:id/responses', petitionIdValidator, validate, officialController.getPetitionResponses);
router.post(
  '/:id/response',
  authenticate,
  authorize('official'),
  officialResponseValidator,
  validate,
  officialController.respondToPetition
);
router.patch(
  '/:id/status',
  authenticate,
  authorize('official'),
  updatePetitionStatusValidator,
  validate,
  officialController.updatePetitionStatus
);

// Single petition routes
router.get('/:id', petitionIdValidator, validate, petitionController.getPetitionById);
router.post('/:id/sign', authenticate, petitionIdValidator, validate, petitionController.signPetition);
router.put('/:id', authenticate, updatePetitionValidator, validate, petitionController.updatePetition);
router.delete('/:id', authenticate, petitionIdValidator, validate, petitionController.deletePetition);

module.exports = router;