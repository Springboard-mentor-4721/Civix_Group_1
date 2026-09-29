const { query } = require('express-validator');

const validCategories = [
  'Infrastructure',
  'Environment',
  'Public Safety',
  'Health',
  'Education',
  'Transportation',
  'Sanitation',
  'Governance',
  'Other'
];

const monthlyReportQueryValidator = [
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12'),

  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid 4-digit year between 2000 and 2100'),

  query('city')
    .optional()
    .isString()
    .trim(),

  query('state')
    .optional()
    .isString()
    .trim(),

  query('category')
    .optional()
    .isIn(validCategories)
    .withMessage(`Invalid category filter. Must be one of: ${validCategories.join(', ')}`)
];

module.exports = {
  monthlyReportQueryValidator
};
