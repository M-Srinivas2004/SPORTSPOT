import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function listAthletes(req: Request, res: Response) {
  try {
    const {
      search,
      sport,
      location,
      experienceLevel,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isPublic: true,
      user: {
        status: 'ACTIVE',
      },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: String(search) } },
        { bio: { contains: String(search) } },
        { primarySport: { contains: String(search) } },
      ];
    }

    if (sport && sport !== 'ALL') {
      where.primarySport = { contains: String(sport) };
    }

    if (location && location !== 'ALL') {
      where.location = { contains: String(location) };
    }

    if (experienceLevel && experienceLevel !== 'ALL') {
      where.experienceLevel = String(experienceLevel);
    }

    const [athletes, total] = await Promise.all([
      prisma.athleteProfile.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          achievements: { take: 3, orderBy: { year: 'desc' } },
          _count: {
            select: { achievements: true, certificates: true, agreements: true },
          },
        },
        orderBy: [{ isVerified: 'desc' }, { profileViews: 'desc' }],
      }),
      prisma.athleteProfile.count({ where }),
    ]);

    return sendSuccess(res, athletes, 'Athletes retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve athletes', 500);
  }
}

export async function getPublicProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const athlete = await prisma.athleteProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, createdAt: true } },
        achievements: { orderBy: { year: 'desc' } },
        certificates: { orderBy: { issueDate: 'desc' } },
        _count: { select: { agreements: true } },
      },
    });

    if (!athlete || (!athlete.isPublic && req.user?.athleteId !== athlete.id && req.user?.role !== 'ADMIN')) {
      return sendError(res, 'Athlete profile not found or private', 404);
    }

    // Increment profile view atomically
    await prisma.athleteProfile.update({
      where: { id },
      data: { profileViews: { increment: 1 } },
    });

    return sendSuccess(res, athlete, 'Profile retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve profile', 500);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) {
      return sendError(res, 'Athlete profile not found for this account', 404);
    }

    const updated = await prisma.athleteProfile.update({
      where: { id: athleteId },
      data: req.body,
      include: {
        achievements: true,
        certificates: true,
      },
    });

    await logAudit(req.user?.userId || null, 'UPDATE_ATHLETE_PROFILE', 'AthleteProfile', req.body, req.ip);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
}

export async function addAchievement(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) {
      return sendError(res, 'Athlete profile required', 403);
    }

    const achievement = await prisma.achievement.create({
      data: {
        athleteId,
        ...req.body,
        isVerified: false, // Must be verified by admin
      },
    });

    return sendSuccess(res, achievement, 'Sporting achievement added successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add achievement', 500);
  }
}

export async function deleteAchievement(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const athleteId = req.user?.athleteId;

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) return sendError(res, 'Achievement not found', 404);

    if (achievement.athleteId !== athleteId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to delete this achievement', 403);
    }

    await prisma.achievement.delete({ where: { id } });
    return sendSuccess(res, null, 'Achievement deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete achievement', 500);
  }
}

export async function addCertificate(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) {
      return sendError(res, 'Athlete profile required', 403);
    }

    const certificate = await prisma.certificate.create({
      data: {
        athleteId,
        title: req.body.title,
        issuingOrg: req.body.issuingOrg,
        issueDate: new Date(req.body.issueDate),
        fileUrl: req.body.fileUrl,
        isVerified: false,
      },
    });

    return sendSuccess(res, certificate, 'Certificate uploaded successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add certificate', 500);
  }
}

export async function deleteCertificate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const athleteId = req.user?.athleteId;

    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) return sendError(res, 'Certificate not found', 404);

    if (cert.athleteId !== athleteId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to delete this certificate', 403);
    }

    await prisma.certificate.delete({ where: { id } });
    return sendSuccess(res, null, 'Certificate removed successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete certificate', 500);
  }
}

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { sport } = req.query;

    const where: any = {
      isPublic: true,
      user: { status: 'ACTIVE' },
    };

    if (sport && sport !== 'ALL') {
      where.primarySport = { contains: String(sport) };
    }

    // Rank based on verified achievements count, experience level tier, and profile engagement
    const athletes = await prisma.athleteProfile.findMany({
      where,
      include: {
        achievements: { where: { isVerified: true } },
        _count: { select: { achievements: true, agreements: true } },
      },
      take: 25,
    });

    const levelScores: Record<string, number> = {
      INTERNATIONAL_PRO: 1000,
      NATIONAL_LEVEL: 750,
      STATE_LEVEL: 500,
      INTERMEDIATE: 250,
      BEGINNER: 100,
    };

    const ranked = athletes
      .map((a) => {
        const tierScore = levelScores[a.experienceLevel] || 250;
        const verifiedBonus = a.achievements.length * 150;
        const dealBonus = a._count.agreements * 200;
        const totalPoints = tierScore + verifiedBonus + dealBonus;

        return {
          id: a.id,
          fullName: a.fullName,
          avatarUrl: a.avatarUrl,
          primarySport: a.primarySport,
          location: a.location,
          experienceLevel: a.experienceLevel,
          isVerified: a.isVerified,
          verifiedAchievementsCount: a.achievements.length,
          activeAgreementsCount: a._count.agreements,
          rankScore: totalPoints,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return sendSuccess(res, ranked, 'Leaderboard generated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate leaderboard', 500);
  }
}
