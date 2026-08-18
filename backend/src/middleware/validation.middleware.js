import { asyncHandler } from '../utils/errors/async-handler.js';
import { ValidationError } from '../utils/errors/errors.js';

export const validationMiddleware = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const errors = [];
    for (const key in schema) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        errors.push({
          key,
          details: validationResult.error.details.map((obj) => {
            return { message: obj.message, path: obj.path[0] };
          }),
        });
      }
    }

    if (errors.length) {
      throw new ValidationError('Validation failed', errors);
    }
    return next();
  });
};
