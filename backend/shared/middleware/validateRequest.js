const Joi = require('joi');
const AppError = require('../utils/appError');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, query, params)
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown keys
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(
        new AppError('Validation failed', 400, errorMessages)
      );
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

module.exports = validateRequest;