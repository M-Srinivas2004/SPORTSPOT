import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { generateAgreementPdf } from '../services/pdfService';
import { createNotification } from '../services/notificationService';
import { logAudit } from '../utils/audit';

export async function createAgreement(req: Request, res: Response) {
  try {
    const { applicationId, amount, currency = 'USD', durationMonths, terms } = req.body;
    const sponsorId = req.user?.sponsorId;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        campaign: true,
        athlete: { include: { user: true } },
      },
    });

    if (!application) return sendError(res, 'Application not found', 404);
    if (application.campaign.sponsorId !== sponsorId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to generate agreement for this application', 403);
    }

    const sponsor = await prisma.sponsorProfile.findUnique({
      where: { id: application.campaign.sponsorId },
      include: { user: true },
    });

    if (!sponsor) return sendError(res, 'Sponsor profile missing', 404);

    // Create Agreement DB Record
    const agreement = await prisma.sponsorshipAgreement.create({
      data: {
        campaignId: application.campaignId,
        applicationId: application.id,
        athleteId: application.athleteId,
        sponsorId: sponsor.id,
        amount,
        currency,
        durationMonths,
        terms,
        status: 'DRAFT',
      },
    });

    // Generate PDF Memorandum
    const pdfPath = await generateAgreementPdf({
      agreementId: agreement.id,
      campaignTitle: application.campaign.title,
      sponsorName: sponsor.companyName,
      sponsorContact: sponsor.contactPerson,
      sponsorEmail: sponsor.user.email,
      athleteName: application.athlete.fullName,
      athleteEmail: application.athlete.user.email,
      athleteSport: application.athlete.primarySport,
      amount,
      currency,
      durationMonths,
      terms,
      status: 'DRAFT',
      createdAt: agreement.createdAt,
    });

    // Update with PDF URL
    const updated = await prisma.sponsorshipAgreement.update({
      where: { id: agreement.id },
      data: { pdfPath },
    });

    // Update application status to ACCEPTED if not already
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' },
    });

    // Notify athlete
    await createNotification(
      application.athlete.userId,
      'Sponsorship Agreement Generated',
      `Sponsor "${sponsor.companyName}" generated a sponsorship agreement (${currency} ${amount.toLocaleString()}) for "${application.campaign.title}".`,
      'AGREEMENT_UPDATE',
      `/dashboard/athlete/agreements`
    );

    await logAudit(
      req.user?.userId || null,
      'CREATE_SPONSORSHIP_AGREEMENT',
      'SponsorshipAgreement',
      { agreementId: agreement.id, amount, applicationId },
      req.ip
    );

    return sendSuccess(res, updated, 'Sponsorship agreement created and PDF generated', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create agreement', 500);
  }
}

export async function getAgreement(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user;

    const agreement = await prisma.sponsorshipAgreement.findUnique({
      where: { id },
      include: {
        campaign: true,
        athlete: { include: { user: { select: { email: true } } } },
        sponsor: { include: { user: { select: { email: true } } } },
      },
    });

    if (!agreement) return sendError(res, 'Agreement not found', 404);

    if (
      user?.role !== 'ADMIN' &&
      agreement.athleteId !== user?.athleteId &&
      agreement.sponsorId !== user?.sponsorId
    ) {
      return sendError(res, 'Unauthorized to view this agreement', 403);
    }

    return sendSuccess(res, agreement, 'Agreement retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve agreement', 500);
  }
}

export async function downloadAgreementPdf(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user;

    const agreement = await prisma.sponsorshipAgreement.findUnique({
      where: { id },
    });

    if (!agreement || !agreement.pdfPath) {
      return sendError(res, 'Agreement PDF not found', 404);
    }

    if (
      user?.role !== 'ADMIN' &&
      agreement.athleteId !== user?.athleteId &&
      agreement.sponsorId !== user?.sponsorId
    ) {
      return sendError(res, 'Unauthorized to download this document', 403);
    }

    // Safe path resolution preventing traversal
    const safeBaseDir = path.resolve(process.cwd(), 'uploads');
    const relativePart = agreement.pdfPath.replace(/^\/uploads\//, '');
    const fullPath = path.resolve(safeBaseDir, relativePart);

    if (!fullPath.startsWith(safeBaseDir) || !fs.existsSync(fullPath)) {
      return sendError(res, 'Document file not found on disk', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sportspot-agreement-${agreement.id.slice(0, 8)}.pdf"`);
    fs.createReadStream(fullPath).pipe(res);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to download agreement PDF', 500);
  }
}

export async function updateAgreementStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING_REVIEW, SIGNED, COMPLETED, CANCELLED
    const user = req.user;

    const agreement = await prisma.sponsorshipAgreement.findUnique({
      where: { id },
      include: {
        campaign: true,
        athlete: { include: { user: true } },
        sponsor: { include: { user: true } },
      },
    });

    if (!agreement) return sendError(res, 'Agreement not found', 404);

    if (
      user?.role !== 'ADMIN' &&
      agreement.athleteId !== user?.athleteId &&
      agreement.sponsorId !== user?.sponsorId
    ) {
      return sendError(res, 'Unauthorized', 403);
    }

    const updated = await prisma.sponsorshipAgreement.update({
      where: { id },
      data: { status },
    });

    // Notify other party
    const targetUserId =
      user?.role === 'ATHLETE' ? agreement.sponsor.userId : agreement.athlete.userId;
    await createNotification(
      targetUserId,
      `Agreement Status: ${status}`,
      `The sponsorship agreement for "${agreement.campaign.title}" has been updated to "${status}".`,
      'AGREEMENT_UPDATE',
      `/dashboard/${user?.role === 'ATHLETE' ? 'sponsor' : 'athlete'}/agreements`
    );

    await logAudit(user?.userId || null, `UPDATE_AGREEMENT_STATUS_${status}`, 'SponsorshipAgreement', { id, status }, req.ip);
    return sendSuccess(res, updated, `Agreement marked as ${status}`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update agreement status', 500);
  }
}
