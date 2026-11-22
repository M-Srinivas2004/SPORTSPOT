import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import prisma from '../config/db';
import fs from 'fs';
import path from 'path';

describe('SPORTSPOT End-to-End Sponsorship Lifecycle Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let athleteToken: string;
  let athleteUserId: string;
  let athleteProfileId: string;

  let sponsorToken: string;
  let sponsorUserId: string;
  let sponsorProfileId: string;

  let adminToken: string;

  let createdCampaignId: string;
  let submittedApplicationId: string;
  let createdAgreementId: string;
  let conversationId: string;

  it('Step 1: Register a new athlete', async () => {
    const email = `sprinter.${Date.now()}@sportspot.io`;
    const res = await request(app)
      .post('/api/auth/register/athlete')
      .send({
        email,
        password: 'Password123!',
        fullName: 'Jordan Miles',
        primarySport: 'Track & Field',
        secondarySports: 'Sprint, Strength',
        location: 'Austin, TX',
        experienceLevel: 'NATIONAL_LEVEL',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();

    athleteToken = res.body.data.token;
    athleteUserId = res.body.data.user.id;
    athleteProfileId = res.body.data.user.athleteProfile.id;
  });

  it('Step 2: Login as existing sponsor (Apex Nutrition)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'partnerships@apexnutrition.com',
        password: 'SportSpot2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('SPONSOR');

    sponsorToken = res.body.data.token;
    sponsorUserId = res.body.data.user.id;
    sponsorProfileId = res.body.data.user.sponsorProfile.id;
  });

  it('Step 3: Login as platform administrator', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@sportspot.io',
        password: 'SportSpot2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');

    adminToken = res.body.data.token;
  });

  it('Step 4: Sponsor creates a new campaign and submits for review', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${sponsorToken}`)
      .send({
        title: 'Apex National Track & Sprint Fellowship 2026',
        sportCategory: 'Track & Field',
        sponsorshipType: 'FINANCIAL',
        budgetMin: 12000,
        budgetMax: 30000,
        currency: 'USD',
        description: 'Providing elite travel stipends and nutritional fuel for championship qualifiers.',
        eligibilityRequirements: 'Must compete at State or National Championship tier.',
        location: 'Global',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        submitForReview: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');

    createdCampaignId = res.body.data.id;
  });

  it('Step 5: Admin audits and approves the campaign', async () => {
    const res = await request(app)
      .patch(`/api/admin/campaigns/${createdCampaignId}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'APPROVED',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('Step 6: Campaign appears in public marketplace with explainable matching for the athlete', async () => {
    const res = await request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${athleteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const targetCampaign = res.body.data.find((c: any) => c.id === createdCampaignId);
    expect(targetCampaign).toBeDefined();
    expect(targetCampaign.matchScore).toBeGreaterThanOrEqual(80);
    expect(targetCampaign.matchReason).toContain('Direct sport match: Track & Field');
  });

  it('Step 7: Athlete submits application for the campaign', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${athleteToken}`)
      .send({
        campaignId: createdCampaignId,
        pitch: 'National level competitor preparing for the World Championship Trials. Excited to represent Apex Nutrition.',
        requestedAmount: 25000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUBMITTED');
    expect(res.body.data.matchScore).toBeDefined();

    submittedApplicationId = res.body.data.id;
  });

  it('Step 8: Prevents duplicate applications from same athlete', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${athleteToken}`)
      .send({
        campaignId: createdCampaignId,
        pitch: 'Attempting a duplicate submission to test security constraints.',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Step 9: Sponsor reviews application and shortlists the candidate', async () => {
    const res = await request(app)
      .patch(`/api/applications/${submittedApplicationId}/status`)
      .set('Authorization', `Bearer ${sponsorToken}`)
      .send({
        status: 'SHORTLISTED',
        sponsorNote: 'Solid national race metrics. Preparing agreement.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SHORTLISTED');
  });

  it('Step 10: Sponsor accepts application and generates formal PDF agreement', async () => {
    const res = await request(app)
      .post('/api/agreements')
      .set('Authorization', `Bearer ${sponsorToken}`)
      .send({
        applicationId: submittedApplicationId,
        amount: 25000,
        currency: 'USD',
        durationMonths: 12,
        terms: 'Apex agrees to disburse $25,000 in quarterly tranches. Athlete agrees to logo display on track warmups and 4 verified social media highlights.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.pdfPath).toBeDefined();

    createdAgreementId = res.body.data.id;

    // Verify PDF file was generated on disk
    const relativePdf = res.body.data.pdfPath.replace(/^\/uploads\//, '');
    const fullPdfPath = path.resolve(process.cwd(), 'uploads', relativePdf);
    expect(fs.existsSync(fullPdfPath)).toBe(true);

    const fileContent = fs.readFileSync(fullPdfPath);
    // PDF Magic Number %PDF
    expect(fileContent.slice(0, 4).toString()).toBe('%PDF');
    expect(fileContent.length).toBeGreaterThan(1000);
  });

  it('Step 11: Athlete downloads agreement PDF', async () => {
    const res = await request(app)
      .get(`/api/agreements/${createdAgreementId}/download`)
      .set('Authorization', `Bearer ${athleteToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('.pdf');
  });

  it('Step 12: Sponsor and athlete establish direct conversation and message', async () => {
    const convRes = await request(app)
      .post('/api/messages/conversations')
      .set('Authorization', `Bearer ${sponsorToken}`)
      .send({
        athleteId: athleteProfileId,
        sponsorId: sponsorProfileId,
      });

    expect(convRes.status).toBe(201);
    conversationId = convRes.body.data.id;

    // Send message from sponsor to athlete
    const msgRes = await request(app)
      .post('/api/messages/messages')
      .set('Authorization', `Bearer ${sponsorToken}`)
      .send({
        conversationId,
        content: 'Welcome to the team, Jordan! Looking forward to your season debut.',
      });

    expect(msgRes.status).toBe(201);
    expect(msgRes.body.success).toBe(true);

    // Retrieve conversation messages as athlete
    const getRes = await request(app)
      .get(`/api/messages/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${athleteToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBeGreaterThan(0);
    expect(getRes.body.data[0].content).toContain('Welcome to the team');
  });

  it('Step 13: Athlete checks in-app notifications and marks read', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${athleteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications.length).toBeGreaterThan(0);

    const markRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${athleteToken}`);

    expect(markRes.status).toBe(200);
    expect(markRes.body.success).toBe(true);
  });
});
