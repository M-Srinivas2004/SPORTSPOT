# GitHub Copilot Instructions for SPORTSPOT

## Project Overview
SPORTSPOT is a sports sponsorship marketplace connecting verified athletes with brands, companies, and organizations.
- **Brand Tagline**: *"YOUR TALENT. THEIR SUPPORT. ONE BIG GAME."*
- **Architecture**: Monorepo with `apps/web` (React 18 + Vite + Tailwind CSS) and `apps/api` (Node.js + Express + Prisma ORM + Socket.IO).

---

## Tech Stack & Standards

### Frontend (`apps/web`)
- **Framework**: React 18+ with TypeScript (`.tsx`)
- **Styling**: Tailwind CSS adhering strictly to the sports-tech design palette:
  - Deep Navy Canvas: `#080D18` (`bg-[#080D18]`)
  - Slate Surface Card: `#111A2B` (`bg-[#111A2B]`)
  - Electric Lime Accent: `#B6FF3B` (`text-[#B6FF3B]`, `bg-[#B6FF3B]`)
  - Pure White Text: `#FFFFFF`
  - Muted Slate Secondary Text: `#9AA8BD`
  - Border Accents: `#1C2A44` / `#2A3F66`
- **State & Data Fetching**: TanStack Query (`useQuery`, `useMutation`)
- **Routing**: React Router v6 with role-guarded routes (`ProtectedRoute`)
- **Icons**: Lucide React (`lucide-react`)
- **Visuals**: Recharts for platform telemetry and application analytics

### Backend (`apps/api`)
- **Runtime**: Node.js v20+ with TypeScript
- **Framework**: Express.js REST API architecture
- **Database**: Prisma ORM with SQLite for local development (`prisma/schema.prisma`) and PostgreSQL schema for production (`prisma/schema.postgresql.prisma`)
- **Authentication**: Argon2id password hashing + HTTP-only cookies containing signed JWTs
- **Real-Time**: Socket.IO for chat and notifications
- **Contract Engine**: PDFKit generating verified sponsorship agreement PDF documents

---

## Roles and Access Control (RBAC)
SPORTSPOT has three distinct roles with strict server-side validation:
1. `ATHLETE`: Manage profile, achievements, certificates, apply to campaigns, sign agreements, chat with sponsors.
2. `SPONSOR`: Manage company profile, create campaigns (DRAFT -> PENDING_APPROVAL -> APPROVED), review applicant pipelines (Under Review, Shortlisted, Accepted, Rejected), generate agreements.
3. `ADMIN`: Moderate campaigns, verify athlete/sponsor credentials, audit logs, manage sports events.

*Note: Never rely solely on frontend button hiding for security. Every backend endpoint must verify `req.user.role` and resource ownership.*

---

## Coding Rules for Copilot
1. **No Fake Data or Placeholders**: Always query Prisma models or return properly structured real database records.
2. **Never Hardcode Secrets**: Read from `process.env` with fallbacks documented in `.env.example`.
3. **Consistent Styling**: Maintain the dark sports-tech color scheme across all UI components. Avoid generic light themes.
4. **Minor Safeguarding**: If an athlete is under 18 years of age, legal guardian consent fields (`guardianName`, `guardianEmail`, `guardianConsentSigned`) are mandatory before profile verification and agreement generation.
5. **Testing**: Maintain tests using Vitest (`apps/api/src/__tests__` and `apps/web/src/__tests__`). Run tests with `npm test`.
