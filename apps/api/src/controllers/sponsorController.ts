import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function listSponsors(req: Request, res: Response) {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      user: { status: 'ACTIVE' },
    };

    if (search) {
      where.OR = [
        { companyName: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    if (category && category !== 'ALL') {
      where.industryCategory = { contains: String(category) };
    }

    const [sponsors, total] = await Promise.all([
      prisma.sponsorProfile.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { campaigns: true, agreements: true },
          },
        },
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.sponsorProfile.count({ where }),
    ]);

    return sendSuccess(res, sponsors, 'Sponsors retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve sponsors', 500);
  }
}

export async function getPublicProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const sponsor = await prisma.sponsorProfile.findUnique({
      where: { id },
      include: {
        campaigns: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { agreements: true } },
      },
    });

    if (!sponsor) {
      return sendError(res, 'Sponsor company profile not found', 404);
    }

    return sendSuccess(res, sponsor, 'Sponsor retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve sponsor', 500);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) {
      return sendError(res, 'Sponsor profile not found for this account', 404);
    }

    const updated = await prisma.sponsorProfile.update({
      where: { id: sponsorId },
      data: req.body,
    });

    await logAudit(req.user?.userId || null, 'UPDATE_SPONSOR_PROFILE', 'SponsorProfile', req.body, req.ip);
    return sendSuccess(res, updated, 'Company profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update company profile', 500);
  }
}
