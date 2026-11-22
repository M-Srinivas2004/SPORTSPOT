import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Public Pages
import { HomePage } from '../pages/HomePage';
import { MarketplacePage } from '../pages/MarketplacePage';
import { CampaignDetailPage } from '../pages/CampaignDetailPage';
import { AthletesDirectoryPage } from '../pages/AthletesDirectoryPage';
import { AthleteProfilePage } from '../pages/AthleteProfilePage';
import { EventsPage } from '../pages/EventsPage';
import { AboutPage } from '../pages/AboutPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterAthletePage } from '../pages/auth/RegisterAthletePage';
import { RegisterSponsorPage } from '../pages/auth/RegisterSponsorPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Athlete Dashboard Pages
import { AthleteOverviewPage } from '../pages/dashboard/athlete/AthleteOverviewPage';
import { AthleteProfileEditPage } from '../pages/dashboard/athlete/AthleteProfileEditPage';
import { AthleteApplicationsPage } from '../pages/dashboard/athlete/AthleteApplicationsPage';
import { AthleteAgreementsPage } from '../pages/dashboard/athlete/AthleteAgreementsPage';
import { AthleteSavedCampaignsPage } from '../pages/dashboard/athlete/AthleteSavedCampaignsPage';

// Sponsor Dashboard Pages
import { SponsorOverviewPage } from '../pages/dashboard/sponsor/SponsorOverviewPage';
import { SponsorCampaignsPage } from '../pages/dashboard/sponsor/SponsorCampaignsPage';
import { CreateCampaignPage } from '../pages/dashboard/sponsor/CreateCampaignPage';
import { CampaignApplicationsPage } from '../pages/dashboard/sponsor/CampaignApplicationsPage';
import { SponsorProfileEditPage } from '../pages/dashboard/sponsor/SponsorProfileEditPage';
import { SponsorAgreementsPage } from '../pages/dashboard/sponsor/SponsorAgreementsPage';

// Admin Dashboard Pages
import { AdminOverviewPage } from '../pages/dashboard/admin/AdminOverviewPage';
import { AdminModerationPage } from '../pages/dashboard/admin/AdminModerationPage';
import { AdminUsersPage } from '../pages/dashboard/admin/AdminUsersPage';
import { AdminEventsPage } from '../pages/dashboard/admin/AdminEventsPage';
import { AdminAuditLogsPage } from '../pages/dashboard/admin/AdminAuditLogsPage';

// Shared Dashboard Pages
import { MessagesPage } from '../pages/dashboard/MessagesPage';
import { NotificationsPage } from '../pages/dashboard/NotificationsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<CampaignDetailPage />} />
          <Route path="/athletes" element={<AthletesDirectoryPage />} />
          <Route path="/athletes/:id" element={<AthleteProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/athlete" element={<RegisterAthletePage />} />
          <Route path="/register/sponsor" element={<RegisterSponsorPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Athlete Protected Dashboard */}
        <Route path="/dashboard/athlete" element={<DashboardLayout requiredRole="ATHLETE" />}>
          <Route index element={<AthleteOverviewPage />} />
          <Route path="profile" element={<AthleteProfileEditPage />} />
          <Route path="applications" element={<AthleteApplicationsPage />} />
          <Route path="saved" element={<AthleteSavedCampaignsPage />} />
          <Route path="agreements" element={<AthleteAgreementsPage />} />
        </Route>

        {/* Sponsor Protected Dashboard */}
        <Route path="/dashboard/sponsor" element={<DashboardLayout requiredRole="SPONSOR" />}>
          <Route index element={<SponsorOverviewPage />} />
          <Route path="campaigns" element={<SponsorCampaignsPage />} />
          <Route path="campaigns/new" element={<CreateCampaignPage />} />
          <Route path="campaigns/:campaignId/applications" element={<CampaignApplicationsPage />} />
          <Route path="profile" element={<SponsorProfileEditPage />} />
          <Route path="agreements" element={<SponsorAgreementsPage />} />
        </Route>

        {/* Administrator Protected Dashboard */}
        <Route path="/dashboard/admin" element={<DashboardLayout requiredRole="ADMIN" />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="campaigns" element={<AdminModerationPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* Shared Dashboard Routes (Accessible to Athlete, Sponsor, Admin) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
