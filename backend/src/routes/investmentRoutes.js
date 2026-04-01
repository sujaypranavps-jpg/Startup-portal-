import { Router } from 'express';
import {
  cancelInvestmentRequest,
  createInvestmentRequest,
  myInvestmentRequests,
  startupInvestorRequests,
  updateInvestmentStatus
} from '../controllers/investmentController.js';
import { allowRoles, protect } from '../middlewares/authMiddleware.js';
import { investmentValidator } from '../validators/investmentValidators.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = Router();

router.post('/idea/:ideaId', protect, allowRoles('investor'), investmentValidator, validate, createInvestmentRequest);
router.get('/my', protect, allowRoles('investor'), myInvestmentRequests);
router.delete('/:id', protect, allowRoles('investor'), cancelInvestmentRequest);
router.get('/startup', protect, allowRoles('startup'), startupInvestorRequests);
router.patch('/:id/status', protect, allowRoles('startup'), updateInvestmentStatus);

export default router;
