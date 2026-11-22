import { Router } from 'express';
import {
  registerAthlete,
  registerSponsor,
  login,
  logout,
  getMe,
  forgotPassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerAthleteSchema,
  registerSponsorSchema,
  loginSchema,
} from '../validators/schemas';

const router = Router();

router.post('/register/athlete', validate(registerAthleteSchema), registerAthlete);
router.post('/register/sponsor', validate(registerSponsorSchema), registerSponsor);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);

export default router;
