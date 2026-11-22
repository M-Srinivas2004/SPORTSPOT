# SPORTSPOT
> **"YOUR TALENT. THEIR SUPPORT. ONE BIG GAME."**

SPORTSPOT is a professional full-stack sports sponsorship marketplace designed to connect talented athletes with brands, companies, organizations, and institutional sponsors. The platform provides a centralized environment where athletes showcase verified sporting achievements and certificates, while sponsors publish campaigns, evaluate applicant pipelines, and execute legally structured sponsorship agreements.

---

## 1. Platform Objectives

1. **Empower Athletes**: Provide competitors across all experience levels (from grassroots and collegiate to international pro) with a verified stage to attract sponsorship funding.
2. **Streamline Brand Discovery**: Help corporate sponsors discover verified athletic talent through rule-based compatibility matching and audited sporting records.
3. **Structured Campaign Workflows**: Standardize sponsorship campaigns with transparent budget envelopes, sport categories, and performance criteria.
4. **Transparent Evaluation Pipeline**: Offer sponsors a structured review pipeline (Under Review, Shortlisted, Accepted, Rejected) with feedback notes.
5. **Legally Structured Agreements**: Generate formal sponsorship contract memorandums with downloadable PDF documentation.
6. **Youth Safeguarding**: Enforce strict legal guardian consent protocols for athletes under 18 years of age.
7. **Platform Integrity**: Provide platform administrators with moderation queues, user status controls, and audit trails.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS adhering strictly to the sports-tech design palette:
  - Deep Navy Canvas: `#080D18`
  - Slate Surface Card: `#111A2B`
  - Electric Lime Accent: `#B6FF3B`
  - Pure White Text: `#FFFFFF`
  - Muted Slate Secondary Text: `#9AA8BD`
  - Border Accents: `#1C2A44` / `#2A3F66`
- **Routing**: React Router v6 (Role-Guarded Dashboards)
- **State & Query**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Platform Telemetry & Review Analytics)
- **Real-Time Client**: Socket.IO Client

### Backend
- **Runtime**: Node.js (v20+ LTS)
- **Framework**: Express.js with TypeScript
- **Database ORM**: Prisma ORM v5
- **Databases Supported**:
  - **Production**: PostgreSQL (`apps/api/prisma/schema.postgresql.prisma`)
  - **Development / Local Zero-Config**: SQLite (`apps/api/prisma/schema.prisma`)
- **Authentication & Security**:
  - Password Hashing: **Argon2id** (High GPU/side-channel resistance)
  - Session Security: Encrypted JWT in **HTTP-only**, `SameSite=Lax` cookies
  - Role-Based Access Control (RBAC): Strict middleware guards for `ATHLETE`, `SPONSOR`, and `ADMIN`
  - Security Headers: Helmet
  - Rate Limiting: `express-rate-limit` on authentication endpoints
  - File Uploads: Multer with safe MIME filtering, size limits, and randomized collision-free filenames
- **Real-Time Messaging**: Socket.IO server with authenticated user rooms (`user:<userId>`) and conversation channels
- **PDF Generation**: PDFKit (Enterprise sponsorship agreement memorandum generation)

---

## 3. Application Architecture & Folder Structure

```
SPORTSPOT/
│
├── apps/
│   ├── web/                         # React 18 + Vite + Tailwind CSS Frontend
│   │   ├── src/
│   │   │   ├── components/ui/       # Reusable UI system (Button, Badge, Card, Modal, Input, StatCard...)
│   │   │   ├── contexts/            # AuthContext, NotificationContext, SocketContext
│   │   │   ├── layouts/             # PublicLayout, DashboardLayout (Role-based), AuthLayout
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx               # Public landing page with dynamic DB metrics
│   │   │   │   ├── MarketplacePage.tsx        # Campaign discovery with rule-based matching badges
│   │   │   │   ├── CampaignDetailPage.tsx     # Full specifications & application modal
│   │   │   │   ├── AthletesDirectoryPage.tsx  # Verified athlete roster & Sports Leaderboard
│   │   │   │   ├── AthleteProfilePage.tsx     # Public athlete portfolio
│   │   │   │   ├── EventsPage.tsx             # Tournament & championship calendar
│   │   │   │   ├── AboutPage.tsx              # Safeguarding policies & mission
│   │   │   │   ├── auth/                      # LoginPage, RegisterAthlete, RegisterSponsor, ForgotPassword
│   │   │   │   └── dashboard/
│   │   │   │       ├── athlete/               # Overview, ProfileEdit, Applications, Agreements, Saved
│   │   │   │       ├── sponsor/               # Overview, Campaigns, CreateCampaign, Pipeline, Agreements
│   │   │   │       ├── admin/                 # Overview, ModerationQueue, Users, Events, AuditLogs
│   │   │   │       ├── MessagesPage.tsx       # Live real-time encrypted messaging
│   │   │   │       └── NotificationsPage.tsx  # In-app notification center
│   │   │   ├── routes/              # AppRouter with role-based redirection
│   │   │   ├── services/            # Typed API clients (Fetch / JSON)
│   │   │   ├── types/               # Domain interfaces & Enums
│   │   │   └── utils/               # Formatters (currency, dates, tiers)
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── vite.config.ts
│   │
│   └── api/                         # Node.js + Express.js REST API
│       ├── src/
│       │   ├── config/              # env.ts, db.ts (Prisma singleton)
│       │   ├── controllers/         # Auth, Athlete, Sponsor, Campaign, Application, Admin, Message, Event...
│       │   ├── middleware/          # auth.ts (RBAC), errorHandler.ts, upload.ts, validate.ts
│       │   ├── routes/              # Modular Express routers
│       │   ├── services/            # recommendationEngine.ts, notificationService.ts, pdfService.ts
│       │   ├── utils/               # security.ts (Argon2id/JWT), response.ts, audit.ts
│       │   ├── validators/          # Zod validation schemas
│       │   └── server.ts            # Express app + Socket.IO server setup
│       ├── prisma/
│       │   ├── schema.prisma        # Development relational schema
│       │   ├── schema.postgresql.prisma # Production PostgreSQL schema
│       │   └── seed.ts              # Development seed script with realistic demo data
│       └── package.json
│
├── docs/
│   ├── PROGRESS.md                  # Development progress report
│   └── IMPLEMENTATION_PLAN.md       # Technical architecture specification
├── uploads/                         # Storage directory for certificates & generated agreements
├── .env.example
├── README.md
└── package.json                     # Monorepo root workspace configuration
```

---

## 4. Getting Started & Installation

### Prerequisites
- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 10.0.0 or higher (or pnpm / yarn)

### 1. Clone & Install Dependencies
From the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration settings:
```ini
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sportspot?schema=public"
SESSION_SECRET="sportspot_super_secure_session_secret_default_key_32chars"
JWT_SECRET="sportspot_jwt_token_secret_default_key_998877"
COOKIE_DOMAIN="localhost"
COOKIE_SECURE=false
UPLOAD_DIR="./uploads"
```

### 3. Initialize Database & Seed Demo Records
Synchronize the database schema and populate realistic demonstration data:
```bash
# Push schema to create tables and indexes
npx prisma db push --schema=apps/api/prisma/schema.prisma

# Seed realistic demonstration records
npx tsx apps/api/prisma/seed.ts
```

---

## 5. Demonstration Accounts

The seed script initializes pre-configured accounts for all three user roles:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@sportspot.io` | `SportSpot2026!` | Platform administrator with full moderation and audit access |
| **SPONSOR** | `partnerships@apexnutrition.com` | `SportSpot2026!` | Apex Performance Nutrition (Sports Nutrition brand) |
| **SPONSOR** | `sponsorships@vortexgear.com` | `SportSpot2026!` | Vortex Athletics Apparel (Equipment & spikes sponsor) |
| **ATHLETE** | `marcus.vance@athlete.sportspot.io` | `SportSpot2026!` | Marcus Vance (100m National Champion, Track & Field) |
| **ATHLETE** | `elena.rostova@athlete.sportspot.io` | `SportSpot2026!` | Elena Rostova (FIG World Cup Beam Medalist, Gymnastics) |
| **ATHLETE** | `priya.sharma@athlete.sportspot.io` | `SportSpot2026!` | Priya Sharma (State Badminton Champion) |

> **Tip**: The login page includes convenient one-click buttons to instantly autofill these credentials.

---

## 6. Running the Application

### Development Mode

Run both the API backend and React frontend concurrently:
```bash
# Terminal 1: Backend API (Listening on http://localhost:5000)
npm run dev:api

# Terminal 2: Frontend Web (Listening on http://localhost:5173)
npm run dev:web
```
Open your browser at: **`http://localhost:5173`**

### Production Build & Verification
Compile and bundle both the backend and frontend:
```bash
# Build backend TypeScript
npm run build:api

# Build frontend Vite bundle
npm run build:web
```

---

## 7. Automated Testing Suite

SPORTSPOT includes automated unit and integration tests powered by Vitest:

```bash
# Run API integration and recommendation engine tests
npx vitest run apps/api/src/__tests__/api.test.ts

# Run frontend formatting and calculation tests
npx vitest run apps/web/src/__tests__/web.test.tsx
```

### Verified Test Scenarios
- Health check endpoint (`GET /api/health`)
- Deterministic explainable rule-based matching engine
- Role-based authorization & unauthenticated access prevention
- Argon2id password verification and session cookie issuance
- Duplicate email prevention on athlete/sponsor registration
- Public marketplace campaign retrieval & verified athlete listing
- Sports leaderboard calculation based on verified tournament awards

---

## 8. Core Features & Business Workflows

### 1. Explainable Rule-Based Recommendation Engine
SPORTSPOT implements a deterministic matching engine evaluating 4 sporting factors:
- **Discipline Compatibility (40%)**: Direct sport match vs. secondary sports.
- **Location Alignment (20%)**: Target geographic focus (Global vs. Local).
- **Competition Tier (25%)**: Satisfies listed tournament tier requirements.
- **Grant Suitability (15%)**: Alignment with sponsorship type (Financial, Equipment, Training).
Returns an exact percentage (0-100%) and a clear textual reason (e.g., *"Direct sport match: Track & Field and Meets high-level national competition tier requirements"*).

### 2. Campaign Moderation Lifecycle
1. Sponsor drafts a campaign and submits it for review (Status: `PENDING_APPROVAL`).
2. Campaign appears in the **Admin Moderation Center**.
3. Administrator audits sponsor credentials, budget envelope, and eligibility criteria.
4. Administrator approves (instantly publishing to the Public Marketplace) or rejects with an explanatory feedback note.
5. In-app notifications are automatically dispatched to the sponsor.

### 3. Application & Contract Pipeline
1. Athletes filter published campaigns and submit a customized pitch statement.
2. System enforces single-submission constraints and checks deadline validity.
3. Sponsor reviews candidate pitches, competition records, and compatibility scores.
4. Sponsor shortlists, accepts, or declines applicants with feedback notes.
5. Upon acceptance, the sponsor drafts agreement terms; SPORTSPOT automatically generates an official PDF memorandum via PDFKit.
6. The athlete can securely download the PDF memorandum from their dashboard.

### 4. Real-Time Encrypted Direct Messaging
- Athletes and sponsors can engage in private direct chat.
- Backed by Socket.IO with WebSocket and long-polling fallbacks.
- Messages are persisted in the database and emit live unread indicators.

---

## 9. Deployment Readiness & Production PostgreSQL

For cloud deployment (e.g. Docker, Railway, AWS ECS, Render):
1. Configure your PostgreSQL database connection in `.env`:
   ```ini
   DATABASE_URL="postgresql://user:password@host:5432/sportspot?schema=public"
   ```
2. Run Prisma migrations with the production schema:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.postgresql.prisma
   ```
3. Set `NODE_ENV=production` and `COOKIE_SECURE=true`.
4. Start the compiled API service:
   ```bash
   npm run build:api
   npm start --workspace=apps/api
   ```
5. Serve the frontend static assets from `apps/web/dist` through NGINX, Cloudflare, or your CDN of choice.

---

## 10. License
SPORTSPOT is released under proprietary commercial software licensing. All rights reserved.
