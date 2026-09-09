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

const validStatuses = ['active', 'closed'];

const createPollValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(', ')}`),

  body('options')
    .notEmpty()
    .withMessage('Options are required')
    .isArray({ min: 2 })
    .withMessage('A poll must have at least 2 options')
    .custom((options) => {
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error('A poll must have at least 2 options');
      }

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const text = typeof opt === 'object' && opt !== null ? opt.text : opt;
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          throw new Error(`Option at index ${i} cannot be empty`);
        }
        if (text.trim().length > 200) {
          throw new Error(`Option at index ${i} cannot exceed 200 characters`);
        }
      }
      return true;
    }),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('location.address')
    .optional()
    .isString()
    .trim()
    .withMessage('Address must be a string'),

  body('location.pincode')
    .optional()
    .isString()
    .trim()
    .withMessage('Pincode must be a string'),

  body('location.latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date')
    .custom((endDate) => {
      if (new Date(endDate) <= new Date()) {
        throw new Error('End date must be in the future');
      }
      return true;
    }),

  body('relatedPetition')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid related petition ID format'),

  body('status')
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`)
];

const voteValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid poll ID format'),

  body('optionId')
    .notEmpty()
    .withMessage('Option ID is required')
    .isMongoId()
    .withMessage('Invalid option ID format')
];

const pollQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),

  query('category')
    .optional()
    .isIn(validCategories)
    .withMessage(`Invalid category filter. Must be one of: ${validCategories.join(', ')}`),

  query('status')
    .optional()
    .isIn(validStatuses)
    .withMessage(`Invalid status filter. Must be one of: ${validStatuses.join(', ')}`),

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

  query('relatedPetition')
    .optional()
    .isMongoId()
    .withMessage('Invalid related petition ID format in query'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalVotes', 'title', 'startDate', 'endDate'])
    .withMessage('Invalid sortBy field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc')
];

const pollIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid poll ID format')
];

const updatePollStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid poll ID format'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`)
];

module.exports = {
  createPollValidator,
  voteValidator,
  pollQueryValidator,
  pollIdValidator,
  updatePollStatusValidator,
  validCategories,
  validStatuses
};
