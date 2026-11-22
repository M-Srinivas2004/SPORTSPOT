import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Application } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils';
import { FileText, Building, Sparkles, AlertCircle, XCircle, ExternalLink } from 'lucide-react';

export const AthleteApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get<Application[]>('/applications/my-applications');
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this sponsorship application?')) return;
    try {
      const res = await api.post(`/applications/${appId}/withdraw`);
      if (res.success) {
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your application submissions..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            My Sponsorship Applications
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track evaluation statuses, sponsor feedback notes, and partnership agreements.
          </p>
        </div>
        <Link to="/marketplace">
          <Button variant="primary" size="sm">
            Browse More Opportunities
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <FileText className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Applications Yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Find campaigns matching your sport discipline and submit your first application.
          </p>
          <Link to="/marketplace" className="inline-block pt-2">
            <Button size="sm" variant="outline">
              Explore Marketplace
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="space-y-4 border-border-subtle hover:border-border-active transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default">{app.campaign?.sportCategory}</Badge>
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
                    {app.matchScore && (
                      <Badge variant="accent" size="sm">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {app.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    <Link to={`/marketplace/${app.campaignId}`} className="hover:text-accent transition-colors">
                      {app.campaign?.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-accent" />
                    <span>{app.campaign?.sponsor?.companyName}</span>
                    <span>• Submitted {formatDate(app.createdAt)}</span>
                  </p>
                </div>

                {/* Status action */}
                <div className="flex items-center gap-2">
                  {app.status === 'ACCEPTED' && (
                    <Link to="/dashboard/athlete/agreements">
                      <Button size="sm" variant="primary">
                        View Executed Agreement
                      </Button>
                    </Link>
                  )}
                  {app.status !== 'ACCEPTED' && app.status !== 'WITHDRAWN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-400 hover:text-rose-300"
                      onClick={() => handleWithdraw(app.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>

              {/* Pitch Statement */}
              <div className="text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Your Submitted Pitch:</span>
                <p className="text-text-secondary leading-relaxed bg-background-elevated/40 p-3 rounded-xl border border-border-subtle">
                  "{app.pitch}"
                </p>
              </div>

              {/* Sponsor Feedback Note */}
              {app.sponsorNote && (
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs">
                  <span className="text-accent font-bold block text-[10px] uppercase">Note from Sponsor:</span>
                  <p className="text-text-primary mt-0.5">{app.sponsorNote}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
