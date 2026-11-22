# SPORTSPOT Deployment Guide: GitHub Copilot + GitHub + Vercel

This guide outlines the end-to-end process for deploying SPORTSPOT to **GitHub**, utilizing **GitHub Copilot**, and hosting on **Vercel**.

---

## 1. GitHub Copilot Integration

GitHub Copilot is pre-configured with repository-level context in:
[`/.github/copilot-instructions.md`](../.github/copilot-instructions.md)

### What Copilot Knows About SPORTSPOT:
- **Design System**: Strict dark sports-tech color palette (`#080D18`, `#111A2B`, `#B6FF3B`, `#FFFFFF`, `#9AA8BD`).
- **Architecture**: Monorepo with React 18 / Vite (`apps/web`) and Express.js / Prisma (`apps/api`).
- **Role Guarding**: RBAC rules for `ATHLETE`, `SPONSOR`, and `ADMIN`.
- **Minor Safeguarding**: Legal guardian consent requirements for athletes under 18.
- **Contract Engine**: PDFKit legal agreement generation pipeline.

---

## 2. Pushing the Project to GitHub

### Step 2.1: Create a Repository on GitHub
1. Open your browser and navigate to [https://github.com/new](https://github.com/new).
2. Set the repository name to: **`SPORTSPOT`** (or your preferred name).
3. Choose **Public** or **Private**.
4. **Do NOT** initialize with a README, .gitignore, or license (these already exist locally).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/<your-username>/SPORTSPOT.git`).

### Step 2.2: Add Remote and Push
Run the following commands in your terminal from the project root (`c:\Users\srini\OneDrive\Desktop\SPORTS`):

```powershell
# Set your GitHub remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/<your-username>/SPORTSPOT.git

# Ensure current branch is main
git branch -M main

# Push the code and commit history to GitHub
git push -u origin main
```

*(Windows Git Credential Manager will prompt you once to authenticate with GitHub).*

### Step 2.3: Automated GitHub Actions CI
Once pushed, the automated workflow at [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) will trigger on GitHub Actions:
- Installs dependencies.
- Generates Prisma client.
- Runs the complete automated test suite (API unit/integration tests and Web tests).
- Verifies the production build for both `apps/web` and `apps/api`.

---

## 3. Deploying to Vercel

Vercel provides native, automatic continuous deployment directly linked to your GitHub repository.

### Step 3.1: Connect Your GitHub Repository to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Sign in with your **GitHub account**.
3. Under **"Import Git Repository"**, locate your `SPORTSPOT` repository and click **Import**.

### Step 3.2: Configure Project Settings in Vercel
Vercel will detect the repository configuration using the pre-configured [`vercel.json`](../vercel.json):

- **Framework Preset**: `Vite`
- **Root Directory**: `./` (Default root)
- **Build Command**: `npm run build --workspace=apps/web`
- **Output Directory**: `apps/web/dist`
- **Install Command**: `npm install`

### Step 3.3: Configure Environment Variables (Optional)
If your production API is deployed on a dedicated server (e.g., Railway, Render, Fly.io, or AWS EC2):
1. In Vercel Project Settings under **Environment Variables**, add:
   - `VITE_API_URL`: `https://api.yourdomain.com/api` (or your production backend endpoint)
   - `VITE_SOCKET_URL`: `https://api.yourdomain.com` (for real-time chat/notifications)
2. For local or standalone frontend preview, the app defaults to `/api` proxy.

### Step 3.4: Deploy
1. Click **Deploy**.
2. Within 60 seconds, Vercel will complete the build and assign a production URL (e.g., `https://sportspot.vercel.app`).
3. Future pushes to the `main` branch will automatically trigger production deployments, and pull requests will generate instant preview URLs.

---

## 4. Backend Hosting Options

The Express backend (`apps/api`) can run on any Node.js hosting platform:
- **Render / Railway / Fly.io / DigitalOcean / AWS**:
  - Run command: `npm run start --workspace=apps/api`
  - Build command: `npm run build --workspace=apps/api`
  - Connect a PostgreSQL database using `DATABASE_URL` and `apps/api/prisma/schema.postgresql.prisma`.
