import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Campaign, Application } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils';
import {
  Trophy,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bookmark,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AthleteOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.athleteProfile;

  const [recommended, setRecommended] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute profile completion percentage
  let completionScore = 30; // base registered
  if (profile?.avatarUrl) completionScore += 20;
  if (profile?.bio && profile.bio.length > 20) completionScore += 20;
  if (profile?.achievements && profile.achievements.length > 0) completionScore += 15;
  if (profile?.certificates && profile.certificates.length > 0) completionScore += 15;
  completionScore = Math.min(100, completionScore);

  useEffect(() => {
    async function loadAthleteData() {
      try {
        setLoading(true);
        const [campaignsRes, appsRes] = await Promise.all([
          api.get<Campaign[]>('/campaigns', { limit: 3, sort: 'recommended' }),
          api.get<Application[]>('/applications/my-applications'),
        ]);

        if (campaignsRes.success && campaignsRes.data) {
          setRecommended(campaignsRes.data);
        }
        if (appsRes.success && appsRes.data) {
          setApplications(appsRes.data);
        }
      } catch (err) {
        console.error('Failed to load athlete dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAthleteData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your athlete overview..." className="py-20" />;

  const activeAppsCount = applications.filter((a) => a.status !== 'WITHDRAWN' && a.status !== 'REJECTED').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-background-secondary via-[#14223A] to-background-secondary border border-border-subtle p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent">ATHLETE HEADQUARTERS</Badge>
              {profile?.isVerified && (
                <Badge variant="success" size="sm" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
              Welcome back, {profile?.fullName || 'Athlete'}!
            </h1>
            <p className="text-xs text-text-secondary max-w-xl">
              Discipline: <span className="text-accent font-bold">{profile?.primarySport}</span> • Track your campaign submissions, matching recommendations, and formal agreements.
            </p>
          </div>

          <div className="bg-background-elevated/70 p-4 rounded-2xl border border-border-subtle min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-text-muted">Profile Strength</span>
              <span className="text-accent">{completionScore}%</span>
            </div>
            <div className="w-full bg-background-primary h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-500 shadow-glow"
                style={{ width: `${completionScore}%` }}
              />
            </div>
            {completionScore < 100 && (
              <Link to="/dashboard/athlete/profile" className="text-[11px] text-accent hover:underline mt-2 block font-medium">
                Complete profile credentials →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Applications"
          value={activeAppsCount}
          subtitle="Under review by sponsors"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Verified Achievements"
          value={profile?.achievements?.length || 2}
          subtitle="Audited competition podiums"
          icon={<Trophy className="w-5 h-5" />}
        />
        <StatCard
          title="Active Agreements"
          value={acceptedCount}
          subtitle="Signed sponsorship grants"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Profile Impressions"
          value={profile?.profileViews || 12}
          subtitle="Total sponsor profile visits"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Recommended Campaigns for Athlete (Rule-based matching) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">
              Recommended Opportunities For You
            </h2>
          </div>
          <Link to="/marketplace?sort=recommended" className="text-xs text-accent hover:underline font-semibold">
            Explore all recommendations →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommended.map((c) => (
            <Card key={c.id} hoverable glow className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{c.sportCategory}</Badge>
                  {c.matchScore && (
                    <Badge variant="accent" size="sm">
                      {c.matchScore}% Match
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-bold text-text-primary line-clamp-1 hover:text-accent transition-colors">
                  <Link to={`/marketplace/${c.id}`}>{c.title}</Link>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">By {c.sponsor?.companyName}</p>
                <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted block font-bold">Max Grant</span>
                  <span className="text-xs font-black text-accent">
                    {formatCurrency(c.budgetMax, c.currency)}
                  </span>
                </div>
                <Link to={`/marketplace/${c.id}`}>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Application History */}
      <Card className="space-y-4 p-0 overflow-hidden">
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            Recent Application Submissions
          </h2>
          <Link to="/dashboard/athlete/applications" className="text-xs text-accent hover:underline font-semibold">
            View All ({applications.length})
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-xs text-text-muted py-8 text-center">
            You haven't submitted any applications yet. Explore the marketplace to apply!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-background-elevated/40 text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Sponsor</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-background-elevated/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-text-primary">
                      {app.campaign?.title}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {app.campaign?.sponsor?.companyName}
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {app.matchScore ? (
                        <span className="text-accent font-extrabold">{app.matchScore}%</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          app.status === 'ACCEPTED'
                            ? 'success'
                            : app.status === 'SHORTLISTED'
                            ? 'accent'
                            : app.status === 'REJECTED'
                            ? 'danger'
                            : 'default'
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to="/dashboard/athlete/applications">
                        <Button size="sm" variant="ghost">View</Button>
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
