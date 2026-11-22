import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { createNotification } from '../services/notificationService';

export async function getConversations(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'Authentication required', 401);

    const where: any = {};
    if (user.role === 'ATHLETE') {
      if (!user.athleteId) return sendError(res, 'Athlete profile required', 403);
      where.athleteId = user.athleteId;
    } else if (user.role === 'SPONSOR') {
      if (!user.sponsorId) return sendError(res, 'Sponsor profile required', 403);
      where.sponsorId = user.sponsorId;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        athlete: { select: { id: true, fullName: true, avatarUrl: true, primarySport: true } },
        sponsor: { select: { id: true, companyName: true, logoUrl: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sendSuccess(res, conversations, 'Conversations retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve conversations', 500);
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const user = req.user;
    if (!user) return sendError(res, 'Authentication required', 401);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return sendError(res, 'Conversation not found', 404);

    if (
      user.role !== 'ADMIN' &&
      conversation.athleteId !== user.athleteId &&
      conversation.sponsorId !== user.sponsorId
    ) {
      return sendError(res, 'Unauthorized to view this conversation', 403);
    }

    // Mark messages sent by counterparty as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return sendSuccess(res, messages, 'Messages retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve messages', 500);
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { conversationId, content } = req.body;
    const user = req.user;
    if (!user) return sendError(res, 'Authentication required', 401);

    if (!content || !content.trim()) {
      return sendError(res, 'Message content cannot be empty', 400);
    }

    let conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        athlete: { include: { user: true } },
        sponsor: { include: { user: true } },
      },
    });

    if (!conversation) return sendError(res, 'Conversation not found', 404);

    if (
      user.role !== 'ADMIN' &&
      conversation.athleteId !== user.athleteId &&
      conversation.sponsorId !== user.sponsorId
    ) {
      return sendError(res, 'Unauthorized', 403);
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.userId,
        content: content.trim(),
        isRead: false,
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify recipient
    const recipientUserId =
      user.role === 'ATHLETE' ? conversation.sponsor.userId : conversation.athlete.userId;
    const senderName =
      user.role === 'ATHLETE' ? conversation.athlete.fullName : conversation.sponsor.companyName;

    await createNotification(
      recipientUserId,
      `New Message from ${senderName}`,
      content.length > 80 ? content.slice(0, 80) + '...' : content,
      'NEW_MESSAGE',
      `/dashboard/messages?conversation=${conversationId}`
    );

    return sendSuccess(res, message, 'Message sent successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to send message', 500);
  }
}

export async function startConversation(req: Request, res: Response) {
  try {
    const { athleteId, sponsorId } = req.body;
    const user = req.user;

    const existing = await prisma.conversation.findUnique({
      where: {
        athleteId_sponsorId: { athleteId, sponsorId },
      },
      include: {
        athlete: true,
        sponsor: true,
      },
    });

    if (existing) {
      return sendSuccess(res, existing, 'Conversation found');
    }

    const conversation = await prisma.conversation.create({
      data: { athleteId, sponsorId },
      include: { athlete: true, sponsor: true },
    });

    return sendSuccess(res, conversation, 'Conversation started', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to start conversation', 500);
  }
}
