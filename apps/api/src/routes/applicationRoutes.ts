import { Router } from 'express';
import {
  submitApplication,
  withdrawApplication,
  getAthleteApplications,
  getCampaignApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  submitApplicationSchema,
  updateApplicationStatusSchema,
} from '../validators/schemas';

const router = Router();

// Athlete endpoints
router.post('/', authenticate, requireRole('ATHLETE'), validate(submitApplicationSchema), submitApplication);
router.get('/my-applications', authenticate, requireRole('ATHLETE'), getAthleteApplications);
router.post('/:id/withdraw', authenticate, requireRole('ATHLETE'), withdrawApplication);

// Sponsor endpoints
router.get('/campaign/:campaignId', authenticate, requireRole('SPONSOR', 'ADMIN'), getCampaignApplications);
router.patch('/:id/status', authenticate, requireRole('SPONSOR', 'ADMIN'), validate(updateApplicationStatusSchema), updateApplicationStatus);

export default router;
