import { Router } from 'express';
import {
  deleteUser,
  exportIdeasCsv,
  getInvestments,
  getUsers,
  sendNotification,
  updateUserRole,
  updateUserStatus
} from '../controllers/adminController.js';
import { allowRoles, protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/users', protect, allowRoles('admin'), getUsers);
router.patch('/users/:id/role', protect, allowRoles('admin'), updateUserRole);
router.patch('/users/:id/status', protect, allowRoles('admin'), updateUserStatus);
router.delete('/users/:id', protect, allowRoles('admin'), deleteUser);
router.get('/export/ideas', protect, allowRoles('admin'), exportIdeasCsv);
router.get('/investments', protect, allowRoles('admin'), getInvestments);
router.post('/notify', protect, allowRoles('admin'), sendNotification);

export default router;
