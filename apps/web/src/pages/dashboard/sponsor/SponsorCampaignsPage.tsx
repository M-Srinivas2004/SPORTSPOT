import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getDaysRemaining } from '../../../utils';
import { PlusCircle, Users, ExternalLink, Send, Clock, ShieldAlert } from 'lucide-react';

export const SponsorCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get<Campaign[]>('/campaigns/my-campaigns');
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmitForReview = async (id: string) => {
    try {
      const res = await api.post(`/campaigns/${id}/submit`);
      if (res.success) {
        fetchCampaigns();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit campaign for approval');
    }
  };

  if (loading) return <LoadingSpinner text="Loading campaigns..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            Sponsorship Campaigns
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Publish, edit, and monitor your athletic endowment and equipment programs.
          </p>
        </div>
        <Link to="/dashboard/sponsor/campaigns/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <p className="text-xs text-text-muted">No campaigns created yet.</p>
          <Link to="/dashboard/sponsor/campaigns/new">
            <Button size="sm" variant="primary">Create Campaign</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => {
            const daysLeft = getDaysRemaining(camp.deadline);
            return (
              <Card key={camp.id} className="space-y-4 border-border-subtle hover:border-border-active transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-border-subtle">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{camp.sportCategory}</Badge>
                      <Badge variant="accent">{camp.sponsorshipType}</Badge>
                      <Badge
                        variant={
                          camp.status === 'APPROVED'
                            ? 'success'
                            : camp.status === 'PENDING_APPROVAL'
                            ? 'warning'
                            : camp.status === 'REJECTED'
                            ? 'danger'
                            : 'default'
                        }
                      >
                        {camp.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{camp.title}</h3>
                    <p className="text-xs text-text-muted">
                      Created {formatDate(camp.createdAt)} • Deadline: {formatDate(camp.deadline)} ({daysLeft} days left)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {camp.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        onClick={() => handleSubmitForReview(camp.id)}
                      >
                        Submit For Approval
                      </Button>
                    )}
                    <Link to={`/dashboard/sponsor/campaigns/${camp.id}/applications`}>
                      <Button size="sm" variant="outline" leftIcon={<Users className="w-3.5 h-3.5" />}>
                        Review Applications ({camp._count?.applications || 0})
                      </Button>
                    </Link>
                    {camp.status === 'APPROVED' && (
                      <Link to={`/marketplace/${camp.id}`}>
                        <Button size="sm" variant="ghost" title="View in Public Marketplace">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Budget Range</span>
                    <span className="text-sm font-extrabold text-accent">
                      {formatCurrency(camp.budgetMin, camp.currency)} - {formatCurrency(camp.budgetMax, camp.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Location Focus</span>
                    <span className="text-xs text-text-primary font-medium">{camp.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Total Applicants</span>
                    <span className="text-xs font-bold text-text-primary">{camp._count?.applications || 0} Athletes</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Views</span>
                    <span className="text-xs text-text-muted">{camp.viewsCount} impressions</span>
                  </div>
                </div>

                {camp.moderationNote && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    <span className="font-bold block text-[10px] uppercase">Admin Moderation Feedback:</span>
                    <p className="mt-0.5">{camp.moderationNote}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
