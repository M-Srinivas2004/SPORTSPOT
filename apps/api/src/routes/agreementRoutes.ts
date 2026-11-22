import { Router } from 'express';
import {
  createAgreement,
  getAgreement,
  downloadAgreementPdf,
  updateAgreementStatus,
} from '../controllers/agreementController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAgreementSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('SPONSOR'), validate(createAgreementSchema), createAgreement);
router.get('/:id', getAgreement);
router.get('/:id/download', downloadAgreementPdf);
router.patch('/:id/status', updateAgreementStatus);

export default router;
