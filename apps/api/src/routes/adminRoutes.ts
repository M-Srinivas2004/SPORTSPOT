import { Router } from 'express';
import {
  getPlatformStats,
  listPendingCampaigns,
  moderateCampaign,
  listUsers,
  toggleUserStatus,
  verifyProfile,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { moderateCampaignSchema } from '../validators/schemas';

const router = Router();

// Strict administrator role guard
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/campaigns/pending', listPendingCampaigns);
router.patch('/campaigns/:id/moderate', validate(moderateCampaignSchema), moderateCampaign);
router.get('/users', listUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/verify/:type/:id', verifyProfile);
router.get('/audit-logs', getAuditLogs);

export default router;
