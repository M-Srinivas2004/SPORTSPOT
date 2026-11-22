import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { calculateMatchScore } from '../services/recommendationEngine';
import { createNotification } from '../services/notificationService';
import { logAudit } from '../utils/audit';

export async function submitApplication(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) return sendError(res, 'Athlete profile required', 403);

    const { campaignId, pitch, requestedAmount } = req.body;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { sponsor: { include: { user: true } } },
    });

    if (!campaign) {
      return sendError(res, 'Sponsorship campaign not found', 404);
    }

    if (campaign.status !== 'APPROVED') {
      return sendError(res, 'This campaign is not accepting applications.', 400);
    }

    // Enforce deadline rule
    if (new Date(campaign.deadline) < new Date()) {
      return sendError(res, 'The application deadline for this campaign has expired.', 400);
    }

    // Enforce duplicate application prevention
    const existingApp = await prisma.application.findUnique({
      where: {
        campaignId_athleteId: { campaignId, athleteId },
      },
    });

    if (existingApp) {
      return sendError(res, 'You have already submitted an application for this campaign.', 409);
    }

    // Fetch athlete profile for matching
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: athleteId },
      include: { user: true },
    });

    if (!athlete) return sendError(res, 'Athlete profile not found', 404);

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

    const application = await prisma.application.create({
      data: {
        campaignId,
        athleteId,
        pitch,
        requestedAmount: requestedAmount || null,
        status: 'SUBMITTED',
        matchScore: match.score,
        matchReason: match.explanation,
      },
      include: {
        campaign: true,
      },
    });

    // Notify sponsor
    await createNotification(
      campaign.sponsor.userId,
      'New Sponsorship Application',
      `Athlete ${athlete.fullName} submitted an application for "${campaign.title}" (${match.score}% match).`,
      'APPLICATION_SUBMITTED',
      `/dashboard/sponsor/campaigns/${campaign.id}/applications`
    );

    await logAudit(
      req.user?.userId || null,
      'SUBMIT_APPLICATION',
      'Application',
      { applicationId: application.id, campaignId },
      req.ip
    );

    return sendSuccess(res, application, 'Application submitted successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to submit application', 500);
  }
}

export async function withdrawApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const athleteId = req.user?.athleteId;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { campaign: { include: { sponsor: true } } },
    });

    if (!application) return sendError(res, 'Application not found', 404);
    if (application.athleteId !== athleteId) {
      return sendError(res, 'Unauthorized to withdraw this application', 403);
    }

    if (application.status === 'ACCEPTED') {
      return sendError(res, 'Accepted applications cannot be self-withdrawn. Please contact the sponsor directly.', 400);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    await logAudit(req.user?.userId || null, 'WITHDRAW_APPLICATION', 'Application', { id }, req.ip);
    return sendSuccess(res, updated, 'Application withdrawn successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to withdraw application', 500);
  }
}

export async function getAthleteApplications(req: Request, res: Response) {
  try {
    const athleteId = req.user?.athleteId;
    if (!athleteId) return sendError(res, 'Athlete profile required', 403);

    const applications = await prisma.application.findMany({
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
          },
        },
        agreement: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, applications, 'Applications retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve applications', 500);
  }
}

export async function getCampaignApplications(req: Request, res: Response) {
  try {
    const { campaignId } = req.params;
    const sponsorId = req.user?.sponsorId;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return sendError(res, 'Campaign not found', 404);
    if (campaign.sponsorId !== sponsorId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to view applications for this campaign', 403);
    }

    const applications = await prisma.application.findMany({
      where: { campaignId },
      include: {
        athlete: {
          include: {
            user: { select: { email: true } },
            achievements: { orderBy: { year: 'desc' } },
            certificates: { orderBy: { issueDate: 'desc' } },
          },
        },
        agreement: true,
      },
      orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
    });

    return sendSuccess(res, applications, 'Campaign applications retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve applications', 500);
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, sponsorNote } = req.body;
    const sponsorId = req.user?.sponsorId;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: true,
        athlete: { include: { user: true } },
      },
    });

    if (!application) return sendError(res, 'Application not found', 404);
    if (application.campaign.sponsorId !== sponsorId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to moderate this application', 403);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        sponsorNote: sponsorNote !== undefined ? sponsorNote : application.sponsorNote,
      },
    });

    // Notify athlete of status change
    const statusTitles: Record<string, string> = {
      SHORTLISTED: 'You’ve Been Shortlisted!',
      ACCEPTED: 'Congratulations! Application Accepted',
      REJECTED: 'Application Status Update',
      UNDER_REVIEW: 'Application Under Review',
    };

    const statusMessages: Record<string, string> = {
      SHORTLISTED: `Your application for "${application.campaign.title}" has been shortlisted by the sponsor!`,
      ACCEPTED: `Your application for "${application.campaign.title}" was accepted! Review agreement terms now.`,
      REJECTED: `Your application for "${application.campaign.title}" was not selected at this time.`,
      UNDER_REVIEW: `The sponsor is actively reviewing your application for "${application.campaign.title}".`,
    };

    if (statusTitles[status]) {
      await createNotification(
        application.athlete.userId,
        statusTitles[status],
        statusMessages[status],
        'APPLICATION_STATUS',
        `/dashboard/athlete/applications`
      );
    }

    await logAudit(
      req.user?.userId || null,
      'UPDATE_APPLICATION_STATUS',
      'Application',
      { applicationId: id, status, sponsorNote },
      req.ip
    );

    return sendSuccess(res, updated, `Application status updated to ${status}`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update application status', 500);
  }
}
