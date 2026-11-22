import { z } from 'zod';

export const registerAthleteSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    fullName: z.string().min(2, 'Full name must have at least 2 characters'),
    primarySport: z.string().min(2, 'Primary sport is required'),
    secondarySports: z.string().optional(),
    location: z.string().min(2, 'Location is required'),
    experienceLevel: z.enum([
      'BEGINNER',
      'INTERMEDIATE',
      'STATE_LEVEL',
      'NATIONAL_LEVEL',
      'INTERNATIONAL_PRO',
    ]).default('INTERMEDIATE'),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    guardianConsent: z.boolean().optional().default(false),
  }),
});

export const registerSponsorSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid business email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    companyName: z.string().min(2, 'Company name is required'),
    industryCategory: z.string().min(2, 'Industry category is required'),
    contactPerson: z.string().min(2, 'Contact person name is required'),
    businessLocation: z.string().min(2, 'Business location is required'),
    contactPhone: z.string().optional(),
    website: z.string().url('Please provide a valid website URL').optional().or(z.literal('')),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateAthleteProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    bio: z.string().max(2000).optional(),
    primarySport: z.string().min(2).optional(),
    secondarySports: z.string().optional(),
    location: z.string().min(2).optional(),
    experienceLevel: z.enum([
      'BEGINNER',
      'INTERMEDIATE',
      'STATE_LEVEL',
      'NATIONAL_LEVEL',
      'INTERNATIONAL_PRO',
    ]).optional(),
    isPublic: z.boolean().optional(),
    socialLinks: z.string().optional(),
  }),
});

export const updateSponsorProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).optional(),
    description: z.string().max(2000).optional(),
    industryCategory: z.string().min(2).optional(),
    website: z.string().url().optional().or(z.literal('')),
    contactPerson: z.string().min(2).optional(),
    businessLocation: z.string().min(2).optional(),
    contactPhone: z.string().optional(),
  }),
});

export const addAchievementSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    year: z.number().int().min(1950).max(new Date().getFullYear()),
    tournament: z.string().min(2, 'Tournament / Event name is required'),
    rankOrMedal: z.string().min(1, 'Rank or medal is required'),
    description: z.string().min(5, 'Brief description is required'),
    proofUrl: z.string().optional(),
  }),
});

export const addCertificateSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Certificate title is required'),
    issuingOrg: z.string().min(2, 'Issuing organization is required'),
    issueDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid issue date required'),
    fileUrl: z.string().min(1, 'File URL or path is required'),
  }),
});

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    sportCategory: z.string().min(2, 'Sport category is required'),
    sponsorshipType: z.enum([
      'INDIVIDUAL',
      'TEAM',
      'TOURNAMENT',
      'EQUIPMENT',
      'TRAVEL',
      'TRAINING',
      'FINANCIAL',
    ]).default('FINANCIAL'),
    budgetMin: z.number().positive('Minimum budget must be positive'),
    budgetMax: z.number().positive('Maximum budget must be positive'),
    currency: z.string().default('USD'),
    description: z.string().min(20, 'Campaign description must be at least 20 characters'),
    eligibilityRequirements: z.string().min(10, 'Eligibility requirements must be specified'),
    location: z.string().default('Global'),
    deadline: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid deadline required'),
    submitForReview: z.boolean().optional(),
  }).refine(data => data.budgetMax >= data.budgetMin, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budgetMax'],
  }),
});

export const submitApplicationSchema = z.object({
  body: z.object({
    campaignId: z.string().min(1, 'Valid campaign ID is required'),
    pitch: z.string().min(20, 'Application pitch must be at least 20 characters'),
    requestedAmount: z.number().positive().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }).optional(),
  body: z.object({
    status: z.enum(['UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']),
    sponsorNote: z.string().optional(),
  }),
});

export const moderateCampaignSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }).optional(),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'PAUSED', 'CLOSED']),
    moderationNote: z.string().optional(),
  }),
});

export const createAgreementSchema = z.object({
  body: z.object({
    applicationId: z.string().min(1, 'Valid application ID is required'),
    amount: z.number().positive('Agreement amount must be positive'),
    currency: z.string().default('USD'),
    durationMonths: z.number().int().positive('Duration in months is required'),
    terms: z.string().min(20, 'Terms and deliverables must be detailed'),
  }),
});
