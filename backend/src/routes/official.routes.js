const express = require('express');
const officialController = require('../controllers/official.controller');
const {
  officialResponseValidator,
  updatePetitionStatusValidator,
  officialPetitionQueryValidator
} = require('../validators/official.validator');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

// Official Locality Petition Dashboard
router.get(
  '/petitions',
  authenticate,
  authorize('official'),
  officialPetitionQueryValidator,
  validate,
  officialController.getLocalityPetitions
);

// Official Response on Petition
router.post(
  '/petitions/:id/response',
  authenticate,
  authorize('official'),
  officialResponseValidator,
  validate,
  officialController.respondToPetition
);

// Official Petition Status Update
router.patch(
  '/petitions/:id/status',
  authenticate,
  authorize('official'),
  updatePetitionStatusValidator,
  validate,
  officialController.updatePetitionStatus
);

// Response History for Petition
router.get(
  '/petitions/:id/responses',
  authenticate,
  officialController.getPetitionResponses
);

// Get All Registered Officials
router.get('/', officialController.getRegisteredOfficials);
router.get('/list', officialController.getRegisteredOfficials);

module.exports = router;
