# SPORTSPOT Technical Architecture & Implementation Plan

> **Tagline**: "YOUR TALENT. THEIR SUPPORT. ONE BIG GAME."  
> **Mission**: Build a premier, enterprise-grade sports sponsorship marketplace connecting verified athletes with brands, companies, and organizations.

---

## 1. System Overview & Technology Stack

### 1.1 Architecture
SPORTSPOT is structured as a robust, production-oriented monorepo:
- `apps/web`: React 18+ frontend built with Vite, TypeScript, Tailwind CSS, Lucide icons, TanStack Query, React Hook Form, and Zod.
- `apps/api`: Node.js / Express.js REST API with TypeScript, Prisma ORM, Argon2id authentication, HTTP-only cookie session security, and Socket.IO for real-time messaging.
- `docs/`: Progress reports, architecture blueprints, API specifications, and database documentation.

```
SPORTSPOT/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI system (Button, Modal, Input, Badge, Table, Card...)
│   │   │   ├── pages/            # Public & protected views (Home, Marketplace, Profiles, Dashboards...)
│   │   │   ├── layouts/          # PublicLayout, DashboardLayout, AuthLayout
│   │   │   ├── hooks/            # useAuth, useSocket, useNotifications, useCampaigns...
│   │   │   ├── services/         # Typed API clients (Axios/Fetch with interceptors)
│   │   │   ├── contexts/         # AuthContext, NotificationContext, SocketContext
│   │   │   ├── routes/           # Protected routes, RoleGuard, AppRouter
│   │   │   ├── types/            # Shared DTOs, schemas, domain entities
│   │   │   └── utils/            # Formatters, calculations, validation helpers
│   │   └── public/
│   │
│   └── api/
│       ├── src/
│       │   ├── controllers/      # Auth, Athlete, Sponsor, Campaign, Application, Admin, Message, Event
│       │   ├── routes/           # Express router endpoints
│       │   ├── middleware/       # Auth (JWT/Cookie), RBAC, rate-limiting, error handler, file upload
│       │   ├── services/         # Business logic, rule-based matching engine, PDF generation
│       │   ├── validators/       # Zod schemas for all request payloads
│       │   ├── utils/            # Argon2 hashing, token generation, audit logger
│       │   └── config/           # Environment variables, database client, socket server
│       └── prisma/
│           ├── schema.prisma     # Relational PostgreSQL models
│           ├── migrations/
│           └── seed.ts           # Development seed with realistic demonstration data
│
├── docs/
│   ├── PROGRESS.md
│   └── IMPLEMENTATION_PLAN.md
├── .env.example
├── README.md
└── package.json
```

### 1.2 Technology Decisions
- **Frontend**: React + Vite + TypeScript for blazing development speed, strict type safety, and optimal bundle size.
- **Styling**: Tailwind CSS adhering strictly to the sports-tech design palette:
  - Deep Navy / Slate Canvas: `#080D18` (Primary background)
  - Dark Surface / Slate Card: `#111A2B` (Secondary background)
  - Electric Lime: `#B6FF3B` (Primary action accent)
  - Pure White: `#FFFFFF` (Primary typography)
  - Muted Blue-Gray: `#9AA8BD` (Secondary typography & subtle borders)
- **Backend API**: Express + TypeScript with clear layering (Routes -> Middleware -> Controllers -> Services -> Prisma).
- **Database**: PostgreSQL with Prisma ORM. Models include foreign keys, unique constraints, cascade rules, indexes on query hot-paths (sport, status, dates).
- **Authentication & Security**:
  - Argon2id password hashing for quantum/GPU-resistant credential protection.
  - HTTP-only, secure, `SameSite=Lax` cookie-based tokens.
  - Role-based authorization middleware (`requireRole('ATHLETE' | 'SPONSOR' | 'ADMIN')`).
  - Resource ownership checks (e.g., sponsors can only mutate their own campaigns, athletes their applications).
  - Rate limiting on authentication routes.
  - Safe file upload validators (MIME type inspection, size limits, sanitized filenames).
- **Real-Time Communication**: Socket.IO for private messaging and live notification delivery.
- **Explainable Recommendation Engine**: Deterministic rule-based scoring algorithm evaluating sport compatibility, experience tier, location match, and budget alignment.

---

## 2. Relational Database Schema Design (Prisma)

### Key Entities
1. **User**: `id`, `email`, `passwordHash`, `role` (ENUM: `ATHLETE`, `SPONSOR`, `ADMIN`), `status` (ACTIVE, SUSPENDED), `createdAt`, `updatedAt`
2. **AthleteProfile**: `userId`, `fullName`, `avatarUrl`, `coverUrl`, `bio`, `primarySport`, `secondarySports`, `location`, `experienceLevel`, `isPublic`, `isVerified`, `dateOfBirth`, `guardianConsent` (for minors), `socialLinks`
3. **Achievement**: `athleteId`, `title`, `year`, `tournament`, `rank`, `description`, `verified`
4. **Certificate**: `athleteId`, `title`, `issuingOrg`, `issueDate`, `fileUrl`, `verified`
5. **SponsorProfile**: `userId`, `companyName`, `logoUrl`, `description`, `industryCategory`, `website`, `contactPerson`, `businessLocation`, `contactPhone`, `isVerified`
6. **Campaign**: `id`, `sponsorId`, `title`, `sportCategory`, `sponsorshipType`, `budgetMin`, `budgetMax`, `currency`, `description`, `requirements`, `location`, `deadline`, `status` (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, PAUSED, CLOSED), `moderationNote`
7. **Application**: `id`, `campaignId`, `athleteId`, `pitch`, `requestedAmount`, `status` (SUBMITTED, UNDER_REVIEW, SHORTLISTED, ACCEPTED, REJECTED, WITHDRAWN), `sponsorNote`, `statusHistory`
8. **SavedCampaign**: `athleteId`, `campaignId`, `createdAt`
9. **Notification**: `id`, `userId`, `title`, `message`, `type`, `read`, `link`, `createdAt`
10. **Conversation**: `id`, `athleteId`, `sponsorId`, `createdAt`, `updatedAt`
11. **Message**: `id`, `conversationId`, `senderId`, `content`, `read`, `createdAt`
12. **Event**: `id`, `title`, `sport`, `organizer`, `location`, `eventDate`, `description`, `sponsorshipOpen`
13. **SponsorshipAgreement**: `id`, `campaignId`, `applicationId`, `athleteId`, `sponsorId`, `amount`, `durationMonths`, `terms`, `status` (DRAFT, PENDING_SIGNATURE, COMPLETED, CANCELLED), `pdfUrl`
14. **AuditLog**: `id`, `userId`, `action`, `resource`, `details`, `ipAddress`, `createdAt`

---

## 3. Core Business Workflows

### 3.1 Athlete Onboarding & Profile Lifecycle
1. Athlete registers with basic credentials (email, name, sport, experience level).
2. Profile completion score dynamically computed based on avatar, bio, achievements, and certificates.
3. Athletes can set visibility to public/private and upload verified credentials.

### 3.2 Sponsor Campaign Creation & Admin Moderation
1. Sponsor drafts a campaign with clear eligibility criteria, budget ranges, and deadlines.
2. Sponsor submits the campaign for platform review (Status: `PENDING_APPROVAL`).
3. Admin dashboard reviews the campaign, sponsor verification status, and terms.
4. Admin approves (publishes to Marketplace) or rejects with a documented reason.
5. In-app notifications automatically fire to the sponsor.

### 3.3 Marketplace Discovery & Application Pipeline
1. Athletes filter published campaigns by sport, budget range, sponsorship type, and location.
2. Rule-based matching engine scores opportunities (0-100%) and explains the match reasons.
3. Athletes submit targeted applications; system enforces single-submission and deadline constraints.
4. Sponsor reviews applicants, inspects verified achievements, shortlists, and accepts/rejects.
5. Status changes emit notifications to the athlete.

### 3.4 Direct Messaging & Deal Closing
1. Verified applicants and sponsors establish direct message channels.
2. Draft sponsorship agreement generated with downloadable PDF summary for contract terms.

---

## 4. Phase Breakdown & Execution Roadmap

- **Phase 1: Core Marketplace MVP (Current)**
  - Monorepo setup, TypeScript configurations, Tailwind theme.
  - Complete Prisma schema, migrations, and realistic seed data.
  - Auth system: Argon2id, cookie-based JWT sessions, RBAC guards.
  - Athlete & Sponsor profile management.
  - Campaign creation, admin moderation flow, and public marketplace.
  - Application submission and sponsor review workflow.
  - In-app notification center.
  - Comprehensive automated tests (API & Component).

- **Phase 2: Advanced Modules**
  - Explainable rule-based recommendation engine.
  - Real-time Socket.IO chat system.
  - Athlete leaderboards and tournament/event directory.
  - PDF agreement generation and export.
  - Platform analytics dashboards with Recharts.

- **Phase 3: Production Readiness & Hardening**
  - Security audits (XSS, CSRF, SQLi protection, Rate limiting).
  - Storage adapters (Local sandbox file storage with S3 interface abstraction).
  - Production build optimization and deployment documentation.
