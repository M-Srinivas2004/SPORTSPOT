import { Router } from 'express';
import { listEvents, createEvent } from '../controllers/eventController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', listEvents);
router.post('/', authenticate, requireRole('ADMIN'), createEvent);

export default router;
