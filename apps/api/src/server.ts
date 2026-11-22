import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setSocketIO } from './services/notificationService';
import { verifyToken } from './utils/security';
import prisma from './config/db';

const app = express();
const server = http.createServer(app);

// Socket.IO Server configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

setSocketIO(io);

// Socket authentication and room management
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.cookie
      ?.split('; ')
      .find((c) => c.startsWith('sportspot_session='))
      ?.split('=')[1];

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      socket.data.user = payload;
      return next();
    }
  }
  // Allow unauthenticated socket connection for public live counters if needed
  next();
});

io.on('connection', (socket) => {
  const user = socket.data.user;

  if (user) {
    // Join personal user room for direct notifications
    socket.join(`user:${user.userId}`);
  }

  // Join active conversation room
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('send_live_message', async (data: { conversationId: string; content: string }) => {
    if (!user) return;
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: user.userId,
          content: data.content.trim(),
          isRead: false,
        },
      });

      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      io.to(`conversation:${data.conversationId}`).emit('new_live_message', message);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    // Clean disconnection
  });
});

// Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible media previews for sports portfolios
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth rate limiter to protect against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve uploads directory securely
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 SPORTSPOT API Server listening on port ${PORT}`);
    console.log(`📡 Client URL: ${env.CLIENT_URL}`);
    console.log(`🔒 Security: Argon2id, HTTP-only Cookies, Role-Based Access Control`);
    console.log(`⚡ Real-Time: Socket.IO initialized`);
  });
}

export { app, server, io };
