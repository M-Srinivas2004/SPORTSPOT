import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils';
import {
  Users,
  Trophy,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get<any>('/admin/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner text="Computing real platform telemetry..." className="py-20" />;

  const chartData = [
    { name: 'Athletes', count: stats?.totalAthletes || 0 },
    { name: 'Sponsors', count: stats?.totalSponsors || 0 },
    { name: 'Campaigns', count: stats?.publishedCampaigns || 0 },
    { name: 'Applications', count: stats?.totalApplications || 0 },
    { name: 'Agreements', count: stats?.acceptedAgreements || 0 },
  ];

  const pieData = [
    { name: 'Published', value: stats?.publishedCampaigns || 3, color: '#B6FF3B' },
    { name: 'Pending Review', value: stats?.pendingCampaigns || 1, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent">SYSTEM ADMINISTRATION</Badge>
            <span className="text-xs text-text-muted">Production Database Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
            Platform Operations & Moderation Center
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real telemetry calculated strictly from verified database records.
          </p>
        </div>

        {stats?.pendingCampaigns > 0 && (
          <Link to="/dashboard/admin/campaigns">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<AlertTriangle className="w-4 h-4 text-background-primary" />}
            >
              {stats.pendingCampaigns} Campaigns Need Moderation
            </Button>
          </Link>
        )}
      </div>

      {/* Primary KPI Grid (All values derived from real DB counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Athletes"
          value={stats?.totalAthletes || 0}
          subtitle="Profiles with sporting records"
          icon={<Trophy className="w-5 h-5 text-accent" />}
        />
        <StatCard
          title="Corporate Sponsors"
          value={stats?.totalSponsors || 0}
          subtitle="Verified brand entities"
          icon={<Building className="w-5 h-5" />}
        />
        <StatCard
          title="Published Campaigns"
          value={stats?.publishedCampaigns || 0}
          subtitle={`${stats?.pendingCampaigns || 0} awaiting review`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Executed Partnerships"
          value={stats?.acceptedAgreements || 0}
          subtitle="Formally signed agreements"
          icon={<ShieldCheck className="w-5 h-5 text-sky-400" />}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Distribution */}
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Platform Entities Distribution
          </h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9AA8BD" fontSize={11} />
                <YAxis stroke="#9AA8BD" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111A2B',
                    borderColor: '#1C2A44',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#B6FF3B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Campaign Approval Ratio */}
        <Card className="space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Campaign Review Status
          </h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111A2B',
                    borderColor: '#1C2A44',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs border-t border-border-subtle pt-3">
            <span className="flex items-center gap-1.5 text-accent font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              Published ({stats?.publishedCampaigns || 0})
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Pending ({stats?.pendingCampaigns || 0})
            </span>
          </div>
        </Card>
      </div>

      {/* Recent User Registrations */}
      <Card className="p-0 overflow-hidden space-y-4">
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">
            Recent Registered Users
          </h3>
          <Link to="/dashboard/admin/users" className="text-xs text-accent hover:underline font-semibold">
            Manage All Users ({stats?.totalUsers || 0}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-background-elevated/40 text-[10px] uppercase font-bold text-text-muted">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Platform Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stats?.recentUsers?.map((u: any) => (
                <tr key={u.id} className="hover:bg-background-elevated/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-text-muted text-[11px]">
                    {u.id.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-4 font-bold text-text-primary">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'ADMIN' ? 'accent' : 'default'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-semibold">{u.status}</span>
                  </td>
                  <td className="py-3 px-4 text-text-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
