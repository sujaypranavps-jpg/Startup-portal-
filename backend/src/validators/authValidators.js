import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('role').optional().isIn(['admin', 'startup', 'mentor', 'investor'])
];

export const loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty()
];
