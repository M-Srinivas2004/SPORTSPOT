import { Router } from 'express';
import {
  listMarketplaceCampaigns,
  getCampaignDetails,
  createCampaign,
  updateCampaign,
  submitForApproval,
  getMyCampaigns,
  toggleSaveCampaign,
  getSavedCampaigns,
} from '../controllers/campaignController';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCampaignSchema } from '../validators/schemas';

const router = Router();

// Public marketplace
router.get('/', optionalAuth, listMarketplaceCampaigns);
router.get('/my-campaigns', authenticate, requireRole('SPONSOR'), getMyCampaigns);
router.get('/saved', authenticate, requireRole('ATHLETE'), getSavedCampaigns);
router.get('/:id', optionalAuth, getCampaignDetails);

// Sponsor management
router.post('/', authenticate, requireRole('SPONSOR'), validate(createCampaignSchema), createCampaign);
router.put('/:id', authenticate, requireRole('SPONSOR', 'ADMIN'), updateCampaign);
router.post('/:id/submit', authenticate, requireRole('SPONSOR'), submitForApproval);
router.post('/:id/save', authenticate, requireRole('ATHLETE'), toggleSaveCampaign);

export default router;
