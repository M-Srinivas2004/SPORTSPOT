import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { createNotification } from '../services/notificationService';
import { logAudit } from '../utils/audit';

export async function getPlatformStats(_req: Request, res: Response) {
  try {
    const [
      totalUsers,
      totalAthletes,
      totalSponsors,
      publishedCampaigns,
      pendingCampaigns,
      totalApplications,
      acceptedAgreements,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.athleteProfile.count(),
      prisma.sponsorProfile.count(),
      prisma.campaign.count({ where: { status: 'APPROVED' } }),
      prisma.campaign.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.application.count(),
      prisma.sponsorshipAgreement.count({ where: { status: { in: ['SIGNED', 'COMPLETED'] } } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return sendSuccess(
      res,
      {
        totalUsers,
        totalAthletes,
        totalSponsors,
        publishedCampaigns,
        pendingCampaigns,
        totalApplications,
        acceptedAgreements,
        recentUsers,
      },
      'Platform statistics retrieved'
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve stats', 500);
  }
}

export async function listPendingCampaigns(_req: Request, res: Response) {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        sponsor: {
          include: {
            user: { select: { email: true, createdAt: true } },
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, campaigns, 'Pending campaigns retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to list pending campaigns', 500);
  }
}

export async function moderateCampaign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, moderationNote } = req.body;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { sponsor: true },
    });

    if (!campaign) return sendError(res, 'Campaign not found', 404);

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status,
        moderationNote: moderationNote || null,
      },
    });

    const isApproved = status === 'APPROVED';
    await createNotification(
      campaign.sponsor.userId,
      isApproved ? 'Campaign Approved!' : 'Campaign Review Update',
      isApproved
        ? `Your campaign "${campaign.title}" has been approved and published to the marketplace.`
        : `Your campaign "${campaign.title}" was rejected. Note: ${moderationNote || 'Does not meet current guidelines.'}`,
      isApproved ? 'CAMPAIGN_APPROVAL' : 'CAMPAIGN_REJECTED',
      `/dashboard/sponsor/campaigns`
    );

    await logAudit(
      req.user?.userId || null,
      `MODERATE_CAMPAIGN_${status}`,
      'Campaign',
      { id, title: campaign.title, status, moderationNote },
      req.ip
    );

    return sendSuccess(res, updated, `Campaign marked as ${status}`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to moderate campaign', 500);
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role && role !== 'ALL') where.role = String(role);
    if (search) {
      where.email = { contains: String(search) };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          athleteProfile: {
            select: { id: true, fullName: true, primarySport: true, isVerified: true },
          },
          sponsorProfile: {
            select: { id: true, companyName: true, industryCategory: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, users, 'Users retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve users', 500);
  }
}

export async function toggleUserStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE or SUSPENDED

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);

    if (user.role === 'ADMIN') {
      return sendError(res, 'Cannot suspend platform administrators', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    await logAudit(req.user?.userId || null, `USER_STATUS_${status}`, 'User', { targetUserId: id, status }, req.ip);
    return sendSuccess(res, updated, `User account marked as ${status}`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user status', 500);
  }
}

export async function verifyProfile(req: Request, res: Response) {
  try {
    const { type, id } = req.params; // type: 'athlete' | 'sponsor'

    if (type === 'athlete') {
      const updated = await prisma.athleteProfile.update({
        where: { id },
        data: { isVerified: true },
      });
      await logAudit(req.user?.userId || null, 'VERIFY_ATHLETE', 'AthleteProfile', { id }, req.ip);
      return sendSuccess(res, updated, 'Athlete profile verified successfully');
    } else if (type === 'sponsor') {
      const updated = await prisma.sponsorProfile.update({
        where: { id },
        data: { isVerified: true },
      });
      await logAudit(req.user?.userId || null, 'VERIFY_SPONSOR', 'SponsorProfile', { id }, req.ip);
      return sendSuccess(res, updated, 'Sponsor company verified successfully');
    }

    return sendError(res, 'Invalid profile type', 400);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to verify profile', 500);
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '25' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, role: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return sendSuccess(res, logs, 'Audit logs retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve audit logs', 500);
  }
}
