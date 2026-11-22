import { Router } from 'express';
import {
  listAthletes,
  getPublicProfile,
  updateProfile,
  addAchievement,
  deleteAchievement,
  addCertificate,
  deleteCertificate,
  getLeaderboard,
} from '../controllers/athleteController';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateAthleteProfileSchema,
  addAchievementSchema,
  addCertificateSchema,
} from '../validators/schemas';

const router = Router();

// Public discovery
router.get('/', listAthletes);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', optionalAuth, getPublicProfile);

// Protected athlete mutations
router.put('/profile', authenticate, requireRole('ATHLETE'), validate(updateAthleteProfileSchema), updateProfile);
router.post('/achievements', authenticate, requireRole('ATHLETE'), validate(addAchievementSchema), addAchievement);
router.delete('/achievements/:id', authenticate, requireRole('ATHLETE', 'ADMIN'), deleteAchievement);
router.post('/certificates', authenticate, requireRole('ATHLETE'), validate(addCertificateSchema), addCertificate);
router.delete('/certificates/:id', authenticate, requireRole('ATHLETE', 'ADMIN'), deleteCertificate);

export default router;
