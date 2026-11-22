import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils';
import { Search, ShieldCheck, CheckCircle2, Ban, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>('/admin/users', { search, role });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleVerifyProfile = async (type: 'athlete' | 'sponsor', profileId: string, userId: string) => {
    try {
      const res = await api.patch(`/admin/verify/${type}/${profileId}`);
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
          User Account Administration
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Audit athlete verification badges, review sponsor credentials, and manage platform account statuses.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-background-secondary p-4 rounded-2xl border border-border-subtle flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search users by email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-xs rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Roles</option>
            <option value="ATHLETE">Athletes</option>
            <option value="SPONSOR">Sponsors</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchUsers}>
            Search
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading registered user records..." className="py-20" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-background-elevated/40 text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-3 px-4">Entity Name / Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Discipline / Industry</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.map((u) => {
                  const isAthlete = u.role === 'ATHLETE';
                  const isSponsor = u.role === 'SPONSOR';
                  const name =
                    u.athleteProfile?.fullName || u.sponsorProfile?.companyName || u.email;
                  const isVerified =
                    u.athleteProfile?.isVerified || u.sponsorProfile?.isVerified || false;

                  return (
                    <tr key={u.id} className="hover:bg-background-elevated/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-text-primary">{name}</div>
                        <div className="text-[11px] text-text-muted">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u.role === 'ADMIN' ? 'accent' : 'default'} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {u.athleteProfile?.primarySport || u.sponsorProfile?.industryCategory || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {isVerified ? (
                          <span className="text-accent font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-text-muted">Unverified</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-muted">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isVerified && isAthlete && u.athleteProfile && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyProfile('athlete', u.athleteProfile.id, u.id)}
                          >
                            Verify Athlete
                          </Button>
                        )}
                        {!isVerified && isSponsor && u.sponsorProfile && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyProfile('sponsor', u.sponsorProfile.id, u.id)}
                          >
                            Verify Sponsor
                          </Button>
                        )}
                        {u.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant={u.status === 'ACTIVE' ? 'ghost' : 'outline'}
                            className={u.status === 'ACTIVE' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400'}
                            onClick={() => handleToggleStatus(u.id, u.status)}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
