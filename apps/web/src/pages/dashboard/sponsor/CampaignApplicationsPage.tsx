import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Application, Campaign } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatExperience } from '../../../utils';
import {
  Users,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Send,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CampaignApplicationsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Agreement Modal State
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [agreementData, setAgreementData] = useState({
    amount: 15000,
    durationMonths: 12,
    terms: 'Sponsor agrees to disburse funds in quarterly installments subject to verified competition schedule maintenance and brand apparel display.',
  });
  const [generatingAgreement, setGeneratingAgreement] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get<Application[]>(`/applications/campaign/${campaignId}`);
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
    if (campaignId) fetchApplications();
  }, [campaignId]);

  const handleUpdateStatus = async (appId: string, status: string, sponsorNote?: string) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status, sponsorNote });
      if (res.success) {
        if (status === 'ACCEPTED') {
          confetti({ particleCount: 80, spread: 60 });
        }
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update application status');
    }
  };

  const handleOpenAgreementModal = (app: Application) => {
    setSelectedApp(app);
    setAgreementData({
      amount: app.requestedAmount || 15000,
      durationMonths: 12,
      terms: `Sponsor agrees to provide endorsement support of $${(app.requestedAmount || 15000).toLocaleString()} to athlete ${app.athlete?.fullName}. In exchange, athlete agrees to display sponsor insignia during approved championship warmups, participate in 2 annual promotional showcases, and post 4 verified quarterly updates.`,
    });
    setAgreementModalOpen(true);
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setGeneratingAgreement(true);
      const res = await api.post('/agreements', {
        applicationId: selectedApp.id,
        amount: Number(agreementData.amount),
        durationMonths: Number(agreementData.durationMonths),
        terms: agreementData.terms,
      });

      if (res.success) {
        confetti({ particleCount: 120, spread: 80 });
        setAgreementModalOpen(false);
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate agreement');
    } finally {
      setGeneratingAgreement(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading campaign applicants..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard/sponsor/campaigns"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            Applicant Review Pipeline
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Evaluate submitted athlete credentials, match scores, and execute agreements.
          </p>
        </div>

        <Badge variant="accent" size="md">
          {applications.length} Total Applicants
        </Badge>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <Users className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Applications Received Yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Once athletes discover your published campaign in the marketplace, their submissions will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => (
            <Card key={app.id} className="space-y-4 border-border-subtle hover:border-border-active transition-all">
              {/* Header: Athlete info & Compatibility */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border-subtle">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-background-elevated border-2 border-accent/40 overflow-hidden shrink-0 shadow-glow">
                    <img
                      src={app.athlete?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-text-primary">
                        <Link to={`/athletes/${app.athleteId}`} className="hover:text-accent">
                          {app.athlete?.fullName}
                        </Link>
                      </h3>
                      {app.athlete?.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      )}
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
                    </div>

                    <p className="text-xs text-accent font-semibold">
                      {app.athlete?.primarySport} • {formatExperience(app.athlete?.experienceLevel || '')}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Location: {app.athlete?.location} • Applied on {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Match score chip */}
                {app.matchScore && (
                  <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-right sm:min-w-[140px]">
                    <span className="text-xs font-black text-accent block">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                      {app.matchScore}% Match
                    </span>
                    <span className="text-[10px] text-text-muted block">Algorithm Score</span>
                  </div>
                )}
              </div>

              {/* Match Explanation */}
              {app.matchReason && (
                <p className="text-xs text-text-secondary bg-background-elevated/40 p-2.5 rounded-lg border border-border-subtle leading-relaxed">
                  <span className="font-bold text-text-primary">Compatibility Analysis: </span>
                  {app.matchReason}
                </p>
              )}

              {/* Pitch */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Athlete's Pitch Statement:</span>
                <p className="text-xs text-text-primary leading-relaxed bg-background-secondary p-3.5 rounded-xl border border-border-subtle">
                  "{app.pitch}"
                </p>
              </div>

              {/* Requested amount & Credentials counter */}
              <div className="flex flex-wrap items-center justify-between text-xs text-text-secondary pt-2 gap-4">
                <div className="flex items-center gap-4">
                  {app.requestedAmount && (
                    <span className="font-bold text-text-primary">
                      Requested: <span className="text-accent">{formatCurrency(app.requestedAmount)}</span>
                    </span>
                  )}
                  <span>{app.athlete?.achievements?.length || 0} Achievements Recorded</span>
                  <span>{app.athlete?.certificates?.length || 0} Certificates</span>
                </div>

                {/* Pipeline Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {app.status !== 'SHORTLISTED' && app.status !== 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED', 'Your profile meets our initial review criteria.')}
                    >
                      Shortlist
                    </Button>
                  )}

                  {app.status !== 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenAgreementModal(app)}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      Accept & Draft Agreement
                    </Button>
                  )}

                  {app.status === 'ACCEPTED' && app.agreement && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Agreement Executed
                    </span>
                  )}

                  {app.status !== 'REJECTED' && app.status !== 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-400 hover:text-rose-300"
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED', 'Not selected for this campaign cycle.')}
                    >
                      Decline
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Agreement Modal */}
      <Modal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        title="Draft Formal Sponsorship Agreement"
        description={`Contract with athlete: ${selectedApp?.athlete?.fullName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAgreement} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Agreed Amount (USD)"
              type="number"
              required
              value={agreementData.amount}
              onChange={(e) => setAgreementData({ ...agreementData, amount: Number(e.target.value) })}
            />
            <Input
              label="Duration (Months)"
              type="number"
              required
              value={agreementData.durationMonths}
              onChange={(e) => setAgreementData({ ...agreementData, durationMonths: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Agreement Terms & Deliverables
            </label>
            <textarea
              rows={5}
              required
              value={agreementData.terms}
              onChange={(e) => setAgreementData({ ...agreementData, terms: e.target.value })}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAgreementModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={generatingAgreement}>
              Generate Contract & PDF
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
