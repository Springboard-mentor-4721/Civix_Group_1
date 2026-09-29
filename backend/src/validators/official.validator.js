const { body, param, query } = require('express-validator');

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

const validOfficialStatuses = ['active', 'under_review', 'closed'];
const validAllStatuses = ['draft', 'active', 'under_review', 'closed', 'flagged'];

const officialResponseValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid petition ID format'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Response comment is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Response comment must be between 5 and 2000 characters'),

  body('status')
    .optional()
    .trim()
    .isIn(validOfficialStatuses)
    .withMessage(`Status must be one of: ${validOfficialStatuses.join(', ')}`),

  body('newStatus')
    .optional()
    .trim()
    .isIn(validOfficialStatuses)
    .withMessage(`New status must be one of: ${validOfficialStatuses.join(', ')}`),

  body('department')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),

  body('officialTitle')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Official title cannot exceed 100 characters')
];

const updatePetitionStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid petition ID format'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(validOfficialStatuses)
    .withMessage(`Status must be one of: ${validOfficialStatuses.join(', ')}`),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Comment must be between 5 and 2000 characters if provided'),

  body('department')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),

  body('officialTitle')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Official title cannot exceed 100 characters')
];

const officialPetitionQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),

  query('status')
    .optional()
    .isIn(validAllStatuses)
    .withMessage(`Invalid status filter. Must be one of: ${validAllStatuses.join(', ')}`),

  query('category')
    .optional()
    .isIn(validCategories)
    .withMessage(`Invalid category filter. Must be one of: ${validCategories.join(', ')}`),

  query('city')
    .optional()
    .isString()
    .trim(),

  query('state')
    .optional()
    .isString()
    .trim(),

  query('search')
    .optional()
    .isString()
    .trim(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'signaturesCount', 'targetSignatures', 'title'])
    .withMessage('Invalid sortBy field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc')
];

module.exports = {
  officialResponseValidator,
  updatePetitionStatusValidator,
  officialPetitionQueryValidator,
  validOfficialStatuses
};
