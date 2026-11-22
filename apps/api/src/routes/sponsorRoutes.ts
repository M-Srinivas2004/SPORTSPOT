import { Router } from 'express';
import {
  listSponsors,
  getPublicProfile,
  updateProfile,
} from '../controllers/sponsorController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSponsorProfileSchema } from '../validators/schemas';

const router = Router();

router.get('/', listSponsors);
router.get('/:id', getPublicProfile);
router.put('/profile', authenticate, requireRole('SPONSOR'), validate(updateSponsorProfileSchema), updateProfile);

export default router;
