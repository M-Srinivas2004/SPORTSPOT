import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Authentication required', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve notifications', 500);
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      return sendError(res, 'Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notification', 500);
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Authentication required', 401);

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to mark notifications', 500);
  }
}
