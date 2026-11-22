import { Router } from 'express';
import authRoutes from './authRoutes';
import athleteRoutes from './athleteRoutes';
import sponsorRoutes from './sponsorRoutes';
import campaignRoutes from './campaignRoutes';
import applicationRoutes from './applicationRoutes';
import adminRoutes from './adminRoutes';
import notificationRoutes from './notificationRoutes';
import messageRoutes from './messageRoutes';
import eventRoutes from './eventRoutes';
import agreementRoutes from './agreementRoutes';
import uploadRoutes from './uploadRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/athletes', athleteRoutes);
apiRouter.use('/sponsors', sponsorRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/agreements', agreementRoutes);
apiRouter.use('/uploads', uploadRoutes);

// Health check endpoint (deployment readiness requirement from Section 26)
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SPORTSPOT REST API',
    version: '1.0.0',
  });
});

export default apiRouter;
