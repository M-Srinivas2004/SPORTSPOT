import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.single('file'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return sendError(res, 'No file was uploaded', 400);
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    return sendSuccess(
      res,
      {
        url: publicUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      'File uploaded successfully',
      201
    );
  }
);

export default router;
