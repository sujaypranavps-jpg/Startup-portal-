import { body } from 'express-validator';

export const investmentValidator = [
  body('amount').isNumeric().custom((v) => v >= 1000),
  body('partnershipType').isIn(['equity', 'debt', 'convertible']),
  body('note').optional().isString()
];
