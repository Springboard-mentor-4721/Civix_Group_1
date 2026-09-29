const express = require('express');
const reportController = require('../controllers/report.controller');
const { monthlyReportQueryValidator } = require('../validators/report.validator');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Export endpoint must be defined before generic sub-routes if any
router.get(
  '/monthly/export',
  monthlyReportQueryValidator,
  validate,
  reportController.exportMonthlyReport
);

// Monthly civic engagement report JSON endpoint
router.get(
  '/monthly',
  monthlyReportQueryValidator,
  validate,
  reportController.getMonthlyReport
);

module.exports = router;
