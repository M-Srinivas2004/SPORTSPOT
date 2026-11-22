import prisma from '../config/db';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function setSocketIO(io: SocketIOServer) {
  ioInstance = io;
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string = 'SYSTEM',
  actionUrl?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl: actionUrl || null,
        isRead: false,
      },
    });

    // Real-time broadcast if socket is active
    if (ioInstance) {
      ioInstance.to(`user:${userId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
    return null;
  }
}
