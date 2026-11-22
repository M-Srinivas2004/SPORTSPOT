import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Campaign } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils';
import {
  FolderOpen,
  Users,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const SponsorOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const sponsor = user?.sponsorProfile;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSponsorData() {
      try {
        setLoading(true);
        const res = await api.get<Campaign[]>('/campaigns/my-campaigns');
        if (res.success && res.data) {
          setCampaigns(res.data);
        }
      } catch (err) {
        console.error('Failed to load sponsor data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSponsorData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading sponsor overview..." className="py-20" />;

  const totalCampaigns = campaigns.length;
  const approvedCampaigns = campaigns.filter((c) => c.status === 'APPROVED').length;
  const pendingApprovals = campaigns.filter((c) => c.status === 'PENDING_APPROVAL').length;
  const totalApplications = campaigns.reduce((acc, c) => acc + (c._count?.applications || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-background-secondary via-[#14223A] to-background-secondary border border-border-subtle p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent">SPONSOR BRAND PORTAL</Badge>
              {sponsor?.isVerified && <Badge variant="success">VERIFIED BRAND</Badge>}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
              {sponsor?.companyName || 'Sponsor Partner'}
            </h1>
            <p className="text-xs text-text-secondary max-w-xl">
              Industry: <span className="text-accent font-bold">{sponsor?.industryCategory}</span> • Manage your targeted athletic grant campaigns, evaluate applicants, and execute agreements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/sponsor/campaigns/new">
              <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Create New Campaign
              </Button>
            </Link>
            <Link to="/athletes">
              <Button variant="outline" size="md" leftIcon={<Users className="w-4 h-4" />}>
                Discover Athletes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campaigns"
          value={totalCampaigns}
          subtitle={`${approvedCampaigns} actively published`}
          icon={<FolderOpen className="w-5 h-5" />}
        />
        <StatCard
          title="Applications Received"
          value={totalApplications}
          subtitle="Across all active campaigns"
          icon={<Users className="w-5 h-5 text-accent" />}
        />
        <StatCard
          title="Pending Moderation"
          value={pendingApprovals}
          subtitle="Awaiting admin approval"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Active Partnerships"
          value={sponsor?._count?.agreements || 1}
          subtitle="Executed sponsorship contracts"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Campaign Management Summary */}
      <Card className="space-y-4 p-0 overflow-hidden">
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            Your Sponsorship Campaigns
          </h2>
          <Link to="/dashboard/sponsor/campaigns" className="text-xs text-accent hover:underline font-semibold">
            Manage All Campaigns →
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-text-muted">You haven't created any sponsorship campaigns yet.</p>
            <Link to="/dashboard/sponsor/campaigns/new">
              <Button size="sm" variant="primary">Create First Campaign</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-background-elevated/40 text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-3 px-4">Campaign Title</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Budget Range</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {campaigns.slice(0, 5).map((camp) => (
                  <tr key={camp.id} className="hover:bg-background-elevated/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-text-primary">
                      {camp.title}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{camp.sportCategory}</td>
                    <td className="py-3 px-4">{camp.sponsorshipType}</td>
                    <td className="py-3 px-4 font-semibold text-accent">
                      {formatCurrency(camp.budgetMin, camp.currency)} - {formatCurrency(camp.budgetMax, camp.currency)}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <Badge variant="accent" size="sm">
                        {camp._count?.applications || 0} Applicants
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          camp.status === 'APPROVED'
                            ? 'success'
                            : camp.status === 'PENDING_APPROVAL'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {camp.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/dashboard/sponsor/campaigns/${camp.id}/applications`}>
                        <Button size="sm" variant="outline">
                          Review Applicants
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
