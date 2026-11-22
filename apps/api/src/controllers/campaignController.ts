import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { calculateMatchScore } from '../services/recommendationEngine';
import { createNotification } from '../services/notificationService';
import { logAudit } from '../utils/audit';

export async function listMarketplaceCampaigns(req: Request, res: Response) {
  try {
    const {
      search,
      sport,
      type,
      location,
      minBudget,
      maxBudget,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'APPROVED',
      deadline: { gte: new Date() }, // Active deadlines only
    };

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { sportCategory: { contains: String(search) } },
        { sponsor: { companyName: { contains: String(search) } } },
      ];
    }

    if (sport && sport !== 'ALL') {
      where.sportCategory = { contains: String(sport) };
    }

    if (type && type !== 'ALL') {
      where.sponsorshipType = String(type);
    }

    if (location && location !== 'ALL') {
      where.location = { contains: String(location) };
    }

    if (minBudget) {
      where.budgetMax = { gte: parseFloat(minBudget as string) };
    }

    if (maxBudget) {
      where.budgetMin = { lte: parseFloat(maxBudget as string) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'budget_high') orderBy = { budgetMax: 'desc' };
    if (sort === 'budget_low') orderBy = { budgetMin: 'asc' };
    if (sort === 'deadline') orderBy = { deadline: 'asc' };
    if (sort === 'popular') orderBy = { viewsCount: 'desc' };

    // Fetch campaigns and total count
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          sponsor: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              industryCategory: true,
              isVerified: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    // If request comes from an authenticated athlete, compute explainable recommendation scores!
    let enrichedCampaigns = campaigns.map((c) => ({
      ...c,
      matchScore: null as number | null,
      matchReason: null as string | null,
    }));

    if (req.user?.athleteId) {
      const athlete = await prisma.athleteProfile.findUnique({
        where: { id: req.user.athleteId },
      });

      if (athlete) {
        enrichedCampaigns = campaigns.map((c) => {
          const match = calculateMatchScore(
            {
              primarySport: athlete.primarySport,
              secondarySports: athlete.secondarySports,
              location: athlete.location,
              experienceLevel: athlete.experienceLevel,
            },
            {
              sportCategory: c.sportCategory,
              location: c.location,
              eligibilityRequirements: c.eligibilityRequirements,
              sponsorshipType: c.sponsorshipType,
              budgetMin: c.budgetMin,
              budgetMax: c.budgetMax,
            }
          );

          return {
            ...c,
            matchScore: match.score,
            matchReason: match.explanation,
          };
        });

        if (sort === 'recommended') {
          enrichedCampaigns.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
      }
    }

    return sendSuccess(res, enrichedCampaigns, 'Campaigns retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to list campaigns', 500);
  }
}

export async function getCampaignDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        sponsor: true,
        _count: { select: { applications: true } },
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found', 404);
    }

    // Only allow sponsor owner or admin to view unapproved campaigns
    if (
      campaign.status !== 'APPROVED' &&
      req.user?.sponsorId !== campaign.sponsorId &&
      req.user?.role !== 'ADMIN'
    ) {
      return sendError(res, 'Campaign is not published', 403);
    }

    // Atomically increment views count
    await prisma.campaign.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    let hasApplied = false;
    let isSaved = false;
    let matchScore: number | null = null;
    let matchReason: string | null = null;

    if (req.user?.athleteId) {
      const [app, saved, athlete] = await Promise.all([
        prisma.application.findUnique({
          where: {
            campaignId_athleteId: {
              campaignId: id,
              athleteId: req.user.athleteId,
            },
          },
        }),
        prisma.savedCampaign.findUnique({
          where: {
            athleteId_campaignId: {
              athleteId: req.user.athleteId,
              campaignId: id,
            },
          },
        }),
        prisma.athleteProfile.findUnique({
          where: { id: req.user.athleteId },
        }),
      ]);

      hasApplied = !!app;
      isSaved = !!saved;

      if (athlete) {
        const match = calculateMatchScore(
          {
            primarySport: athlete.primarySport,
            secondarySports: athlete.secondarySports,
            location: athlete.location,
            experienceLevel: athlete.experienceLevel,
          },
          {
            sportCategory: campaign.sportCategory,
            location: campaign.location,
            eligibilityRequirements: campaign.eligibilityRequirements,
            sponsorshipType: campaign.sponsorshipType,
            budgetMin: campaign.budgetMin,
            budgetMax: campaign.budgetMax,
          }
        );
        matchScore = match.score;
        matchReason = match.explanation;
      }
    }

    return sendSuccess(res, {
      ...campaign,
      hasApplied,
      isSaved,
      matchScore,
      matchReason,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve campaign details', 500);
  }
}

export async function createCampaign(req: Request, res: Response) {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) {
      return sendError(res, 'Sponsor company profile required', 403);
    }

    const {
      title,
      sportCategory,
      sponsorshipType,
      budgetMin,
      budgetMax,
      currency,
      description,
      eligibilityRequirements,
      location,
      deadline,
      submitForReview = false,
    } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        sponsorId,
        title,
        sportCategory,
        sponsorshipType: sponsorshipType || 'FINANCIAL',
        budgetMin,
        budgetMax,
        currency: currency || 'USD',
        description,
        eligibilityRequirements,
        location: location || 'Global',
        deadline: new Date(deadline),
        status: submitForReview ? 'PENDING_APPROVAL' : 'DRAFT',
      },
      include: {
        sponsor: true,
      },
    });

    await logAudit(req.user?.userId || null, 'CREATE_CAMPAIGN', 'Campaign', { id: campaign.id, title }, req.ip);

    if (submitForReview) {
      // Notify admins
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await createNotification(
          admin.id,
          'New Campaign Pending Approval',
          `Sponsor "${campaign.sponsor.companyName}" submitted campaign "${campaign.title}" for review.`,
          'CAMPAIGN_APPROVAL',
          `/dashboard/admin/campaigns`
        );
      }
    }

    return sendSuccess(res, campaign, 'Campaign created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create campaign', 500);
  }
}

export async function updateCampaign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sponsorId = req.user?.sponsorId;

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Campaign not found', 404);

    if (existing.sponsorId !== sponsorId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to edit this campaign', 403);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...req.body,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      },
    });

    await logAudit(req.user?.userId || null, 'UPDATE_CAMPAIGN', 'Campaign', { id, title: updated.title }, req.ip);
    return sendSuccess(res, updated, 'Campaign updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update campaign', 500);
  }
}

export async function submitForApproval(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sponsorId = req.user?.sponsorId;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { sponsor: true },
    });

    if (!campaign) return sendError(res, 'Campaign not found', 404);
    if (campaign.sponsorId !== sponsorId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized', 403);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', moderationNote: null },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'Campaign Submitted For Review',
        `Campaign "${campaign.title}" has been submitted for platform approval.`,
        'CAMPAIGN_APPROVAL',
        '/dashboard/admin/campaigns'
      );
    }

    await logAudit(req.user?.userId || null, 'SUBMIT_CAMPAIGN_FOR_APPROVAL', 'Campaign', { id }, req.ip);
    return sendSuccess(res, updated, 'Campaign submitted for administrator review');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to submit campaign', 500);
  }
}

export async function getMyCampaigns(req: Request, res: Response) {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) return sendError(res, 'Sponsor account required', 403);

    const campaigns = await prisma.campaign.findMany({
      where: { sponsorId },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, campaigns, 'Sponsor campaigns retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve campaigns', 500);
  }
}

export async function toggleSaveCampaign(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) return sendError(res, 'Athlete profile required', 403);

    const { id: campaignId } = req.params;

    const existing = await prisma.savedCampaign.findUnique({
      where: {
        athleteId_campaignId: { athleteId, campaignId },
      },
    });

    if (existing) {
      await prisma.savedCampaign.delete({ where: { id: existing.id } });
      return sendSuccess(res, { isSaved: false }, 'Campaign removed from saved items');
    } else {
      await prisma.savedCampaign.create({
        data: { athleteId, campaignId },
      });
      return sendSuccess(res, { isSaved: true }, 'Campaign saved to your favorites');
    }
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update saved campaign', 500);
  }
}

export async function getSavedCampaigns(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) return sendError(res, 'Athlete profile required', 403);

    const saved = await prisma.savedCampaign.findMany({
      where: { athleteId },
      include: {
        campaign: {
          include: {
            sponsor: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                industryCategory: true,
              },
            },
            _count: { select: { applications: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, saved.map((s) => s.campaign), 'Saved campaigns retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve saved campaigns', 500);
  }
}
