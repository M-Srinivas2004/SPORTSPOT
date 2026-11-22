import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/conversations', startConversation);

export default router;
