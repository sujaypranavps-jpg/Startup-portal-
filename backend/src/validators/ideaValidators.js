import { body } from 'express-validator';

export const createIdeaValidator = [
  body('title').trim().notEmpty(),
  body('description').trim().isLength({ min: 20 }),
  body('industry').trim().notEmpty(),
  body('stage').isIn(['concept', 'mvp', 'early-revenue', 'growth', 'scale']),
  body('teamSize').isInt({ min: 1 }),
  body('fundingNeeded').isNumeric()
];

export const reviewIdeaValidator = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').trim().isLength({ min: 10 }),
  body('approved').isBoolean()
];
