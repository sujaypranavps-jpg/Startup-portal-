import { Router } from 'express';
import { getMyNotifications, markAllRead, markNotificationRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, getMyNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markNotificationRead);

export default router;
