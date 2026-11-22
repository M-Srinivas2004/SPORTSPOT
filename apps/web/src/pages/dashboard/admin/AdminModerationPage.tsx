import React, { useState, useEffect } from 'react';
import { Campaign } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils';
import { CheckCircle2, XCircle, AlertTriangle, Building, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminModerationPage: React.FC = () => {
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get<Campaign[]>('/admin/campaigns/pending');
      if (res.success && res.data) {
        setPendingCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to load pending campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await api.patch(`/admin/campaigns/${id}/moderate`, {
        status: 'APPROVED',
      });
      if (res.success) {
        confetti({ particleCount: 70, spread: 50 });
        fetchPending();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve campaign');
    }
  };

  const handleOpenReject = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModerationNote('Please ensure eligibility criteria explicitly defines amateur/collegiate safeguarding parameters.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    try {
      setSubmitting(true);
      const res = await api.patch(`/admin/campaigns/${selectedCampaign.id}/moderate`, {
        status: 'REJECTED',
        moderationNote,
      });
      if (res.success) {
        setRejectModalOpen(false);
        fetchPending();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject campaign');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Checking campaign moderation queue..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            Campaign Moderation Queue
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit submitted sponsorship programs before they become publicly accessible in the marketplace.
          </p>
        </div>
        <Badge variant="warning" size="md">
          {pendingCampaigns.length} Pending Approvals
        </Badge>
      </div>

      {pendingCampaigns.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Moderation Queue Clear!</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            All submitted campaigns have been audited and either approved or addressed.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingCampaigns.map((camp) => (
            <Card key={camp.id} className="space-y-4 border-amber-500/20 bg-background-elevated/20">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{camp.sportCategory}</Badge>
                    <Badge variant="accent">{camp.sponsorshipType}</Badge>
                    <Badge variant="warning">PENDING APPROVAL</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{camp.title}</h3>
                  <p className="text-xs text-text-secondary flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-accent" />
                    <span>Sponsor: {camp.sponsor?.companyName}</span>
                    <span>• Submitted: {formatDate(camp.createdAt)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleApprove(camp.id)}
                  >
                    Approve & Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={() => handleOpenReject(camp)}
                  >
                    Reject with Feedback
                  </Button>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Budget Range</span>
                  <span className="text-sm font-extrabold text-accent font-display">
                    {formatCurrency(camp.budgetMin, camp.currency)} - {formatCurrency(camp.budgetMax, camp.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Location Focus</span>
                  <span className="text-xs text-text-primary font-medium">{camp.location}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Deadline</span>
                  <span className="text-xs text-text-primary font-medium">{formatDate(camp.deadline)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Description:</span>
                <p className="text-text-secondary leading-relaxed bg-background-primary/40 p-3 rounded-xl border border-border-subtle">
                  {camp.description}
                </p>
              </div>

              {/* Eligibility */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Eligibility Requirements:</span>
                <p className="text-text-secondary leading-relaxed bg-background-primary/40 p-3 rounded-xl border border-border-subtle">
                  {camp.eligibilityRequirements}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Campaign Submission"
        description={`Provide mandatory feedback note for sponsor: ${selectedCampaign?.sponsor?.companyName}`}
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Moderation Reason & Revision Advice
            </label>
            <textarea
              rows={4}
              required
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={submitting}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
