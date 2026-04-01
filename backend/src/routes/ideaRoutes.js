import { Router } from 'express';
import {
  createIdea,
  deleteMyIdea,
  getAdminAnalytics,
  getMentorDashboard,
  getMyIdeas,
  getStartupDashboard,
  listIdeas,
  reviewIdea,
  updateMyIdea
} from '../controllers/ideaController.js';
import { allowRoles, protect } from '../middlewares/authMiddleware.js';
import { uploadPitchDeck } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createIdeaValidator, reviewIdeaValidator } from '../validators/ideaValidators.js';

const router = Router();

router.get('/', protect, listIdeas);
router.post('/', protect, allowRoles('startup'), uploadPitchDeck.single('pitchDeck'), createIdeaValidator, validate, createIdea);
router.get('/my', protect, allowRoles('startup'), getMyIdeas);
router.patch('/my/:id', protect, allowRoles('startup'), uploadPitchDeck.single('pitchDeck'), updateMyIdea);
router.delete('/my/:id', protect, allowRoles('startup'), deleteMyIdea);

router.get('/dashboard/startup', protect, allowRoles('startup'), getStartupDashboard);
router.get('/dashboard/mentor', protect, allowRoles('mentor', 'admin'), getMentorDashboard);
router.get('/dashboard/admin', protect, allowRoles('admin'), getAdminAnalytics);

router.post('/:id/review', protect, allowRoles('mentor', 'admin'), reviewIdeaValidator, validate, reviewIdea);

export default router;
