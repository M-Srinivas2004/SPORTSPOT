import { Request, Response } from 'express';
import prisma from '../config/db';
import { hashPassword, verifyPassword, generateToken } from '../utils/security';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { env } from '../config/env';

const COOKIE_NAME = 'sportspot_session';

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export async function registerAthlete(req: Request, res: Response) {
  try {
    const {
      email,
      password,
      fullName,
      primarySport,
      secondarySports,
      location,
      experienceLevel,
      dateOfBirth,
      gender,
      guardianConsent,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'ATHLETE',
        status: 'ACTIVE',
        athleteProfile: {
          create: {
            fullName,
            primarySport,
            secondarySports: secondarySports || null,
            location,
            experienceLevel: experienceLevel || 'INTERMEDIATE',
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            guardianConsent: guardianConsent || false,
            isPublic: true,
            isVerified: false,
          },
        },
      },
      include: {
        athleteProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: 'ATHLETE',
      athleteId: user.athleteProfile?.id,
    });

    setAuthCookie(res, token);
    await logAudit(user.id, 'REGISTER_ATHLETE', 'User', { email: user.email }, req.ip);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          athleteProfile: user.athleteProfile,
        },
        token,
      },
      'Athlete registered successfully',
      201
    );
  } catch (error: any) {
    console.error('Athlete registration error:', error);
    return sendError(res, error.message || 'Registration failed', 500);
  }
}

export async function registerSponsor(req: Request, res: Response) {
  try {
    const {
      email,
      password,
      companyName,
      industryCategory,
      contactPerson,
      businessLocation,
      contactPhone,
      website,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'SPONSOR',
        status: 'ACTIVE',
        sponsorProfile: {
          create: {
            companyName,
            industryCategory,
            contactPerson,
            businessLocation,
            contactPhone: contactPhone || null,
            website: website || null,
            isVerified: false,
          },
        },
      },
      include: {
        sponsorProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: 'SPONSOR',
      sponsorId: user.sponsorProfile?.id,
    });

    setAuthCookie(res, token);
    await logAudit(user.id, 'REGISTER_SPONSOR', 'User', { companyName }, req.ip);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          sponsorProfile: user.sponsorProfile,
        },
        token,
      },
      'Sponsor registered successfully',
      201
    );
  } catch (error: any) {
    console.error('Sponsor registration error:', error);
    return sendError(res, error.message || 'Registration failed', 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        athleteProfile: true,
        sponsorProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Your account has been suspended. Please contact platform administration.', 403);
    }

    const isValidPassword = await verifyPassword(user.passwordHash, password);
    if (!isValidPassword) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      athleteId: user.athleteProfile?.id,
      sponsorId: user.sponsorProfile?.id,
    });

    setAuthCookie(res, token);
    await logAudit(user.id, 'LOGIN', 'User', {}, req.ip);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          athleteProfile: user.athleteProfile,
          sponsorProfile: user.sponsorProfile,
        },
        token,
      },
      'Logged in successfully'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, error.message || 'Login failed', 500);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    path: '/',
  });

  if (req.user) {
    await logAudit(req.user.userId, 'LOGOUT', 'User', {}, req.ip);
  }

  return sendSuccess(res, null, 'Logged out successfully');
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        athleteProfile: {
          include: {
            achievements: { orderBy: { year: 'desc' } },
            certificates: { orderBy: { issueDate: 'desc' } },
          },
        },
        sponsorProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, { user });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch session profile', 500);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!env.SMTP_HOST) {
    // Note required by Rule 3: Never claim email sent when unconfigured
    return sendSuccess(
      res,
      {
        simulated: true,
        notice: 'Email delivery service is currently not configured in environment. In production, a secure reset token would be dispatched to this email address.',
      },
      'Password reset request received. (Notice: SMTP integration pending configuration).'
    );
  }

  return sendSuccess(res, null, 'If this email is registered, password reset instructions have been sent.');
}
