import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { calculateMatchScore } from '../services/recommendationEngine';
import prisma from '../config/db';

describe('SPORTSPOT API & Recommendation Engine Tests', () => {
  beforeAll(async () => {
    // Verify DB connected
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('SPORTSPOT REST API');
  });

  describe('Rule-Based Recommendation Engine', () => {
    it('should generate high match score for identical sport and high competition tier', () => {
      const match = calculateMatchScore(
        {
          primarySport: 'Track & Field',
          location: 'Austin, Texas, USA',
          experienceLevel: 'NATIONAL_LEVEL',
        },
        {
          sportCategory: 'Track & Field',
          location: 'Global',
          eligibilityRequirements: 'Must compete at State or National Championship tier.',
          sponsorshipType: 'FINANCIAL',
          budgetMin: 10000,
          budgetMax: 25000,
        }
      );

      expect(match.score).toBeGreaterThanOrEqual(80);
      expect(match.reasons.some((r) => r.includes('Direct sport match'))).toBe(true);
      expect(match.explanation).toBeDefined();
    });

    it('should award secondary sport match bonus', () => {
      const match = calculateMatchScore(
        {
          primarySport: 'Gymnastics',
          secondarySports: 'Acrobatics, Dance, Swimming',
          location: 'California',
          experienceLevel: 'INTERMEDIATE',
        },
        {
          sportCategory: 'Swimming',
          location: 'Global',
          eligibilityRequirements: 'Open to promising athletes',
          sponsorshipType: 'EQUIPMENT',
          budgetMin: 2000,
          budgetMax: 5000,
        }
      );

      expect(match.reasons.some((r) => r.includes('Secondary sport match'))).toBe(true);
    });
  });

  describe('Authentication & Authorization', () => {
    it('POST /api/auth/login with invalid credentials should return 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@sportspot.io', password: 'WrongPassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login with seeded admin should succeed and set session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@sportspot.io', password: 'SportSpot2026!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('POST /api/auth/register/athlete should create a new athlete', async () => {
      const testEmail = `test.runner.${Date.now()}@athlete.sportspot.io`;
      const res = await request(app)
        .post('/api/auth/register/athlete')
        .send({
          email: testEmail,
          password: 'Password123!',
          fullName: 'Jordan Miles',
          primarySport: 'Basketball',
          location: 'Chicago, IL',
          experienceLevel: 'STATE_LEVEL',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.role).toBe('ATHLETE');
    });

    it('GET /api/admin/stats without admin credentials should be rejected (401 or 403)', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Public Sponsorship Marketplace', () => {
    it('GET /api/campaigns should list approved campaigns', async () => {
      const res = await request(app).get('/api/campaigns');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].status).toBe('APPROVED');
    });

    it('GET /api/athletes should list public athletes', async () => {
      const res = await request(app).get('/api/athletes');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/athletes/leaderboard should return ranked leaderboard', async () => {
      const res = await request(app).get('/api/athletes/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].rank).toBe(1);
    });
  });
});
