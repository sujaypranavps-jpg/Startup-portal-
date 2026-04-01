import { Router } from 'express';
import { forgotPassword, login, logout, me, refresh, register } from '../controllers/authController.js';
import { loginValidator, registerValidator } from '../validators/authValidators.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, me);

export default router;
