export type Role = 'ATHLETE' | 'SPONSOR' | 'ADMIN';

export type ExperienceLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'STATE_LEVEL'
  | 'NATIONAL_LEVEL'
  | 'INTERNATIONAL_PRO';

export type SponsorshipType =
  | 'INDIVIDUAL'
  | 'TEAM'
  | 'TOURNAMENT'
  | 'EQUIPMENT'
  | 'TRAVEL'
  | 'TRAINING'
  | 'FINANCIAL';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'CLOSED';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type AgreementStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'SIGNED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  createdAt: string;
  athleteProfile?: AthleteProfile | null;
  sponsorProfile?: SponsorProfile | null;
}

export interface Achievement {
  id: string;
  athleteId: string;
  title: string;
  year: number;
  tournament: string;
  rankOrMedal: string;
  description: string;
  isVerified: boolean;
  proofUrl?: string | null;
  createdAt: string;
}

export interface Certificate {
  id: string;
  athleteId: string;
  title: string;
  issuingOrg: string;
  issueDate: string;
  fileUrl: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  primarySport: string;
  secondarySports?: string | null;
  location: string;
  experienceLevel: ExperienceLevel;
  isPublic: boolean;
  isVerified: boolean;
  dateOfBirth?: string | null;
  gender?: string | null;
  guardianConsent: boolean;
  socialLinks?: string | null;
  profileViews: number;
  createdAt: string;
  updatedAt: string;
  achievements?: Achievement[];
  certificates?: Certificate[];
  _count?: {
    achievements?: number;
    certificates?: number;
    agreements?: number;
  };
}

export interface SponsorProfile {
  id: string;
  userId: string;
  companyName: string;
  logoUrl?: string | null;
  description?: string | null;
  industryCategory: string;
  website?: string | null;
  contactPerson: string;
  businessLocation: string;
  contactPhone?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    campaigns?: number;
    agreements?: number;
  };
}

export interface Campaign {
  id: string;
  sponsorId: string;
  title: string;
  sportCategory: string;
  sponsorshipType: SponsorshipType;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  description: string;
  eligibilityRequirements: string;
  location: string;
  deadline: string;
  status: CampaignStatus;
  moderationNote?: string | null;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  sponsor?: SponsorProfile;
  _count?: {
    applications?: number;
  };
  hasApplied?: boolean;
  isSaved?: boolean;
  matchScore?: number | null;
  matchReason?: string | null;
}

export interface Application {
  id: string;
  campaignId: string;
  campaign?: Campaign;
  athleteId: string;
  athlete?: AthleteProfile;
  pitch: string;
  requestedAmount?: number | null;
  status: ApplicationStatus;
  sponsorNote?: string | null;
  matchScore?: number | null;
  matchReason?: string | null;
  createdAt: string;
  updatedAt: string;
  agreement?: SponsorshipAgreement | null;
}

export interface SponsorshipAgreement {
  id: string;
  campaignId: string;
  campaign?: Campaign;
  applicationId: string;
  athleteId: string;
  athlete?: AthleteProfile;
  sponsorId: string;
  sponsor?: SponsorProfile;
  amount: number;
  currency: string;
  durationMonths: number;
  terms: string;
  status: AgreementStatus;
  pdfPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  athleteId: string;
  athlete?: AthleteProfile;
  sponsorId: string;
  sponsor?: SponsorProfile;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Event {
  id: string;
  title: string;
  sport: string;
  organizer: string;
  location: string;
  eventDate: string;
  description: string;
  sponsorshipOpen: boolean;
  registrationLink?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: { email: string; role: Role } | null;
  action: string;
  resource: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}
