import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Campaign } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils';
import {
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Bookmark,
  Share2,
  ArrowLeft,
  ShieldAlert,
  Send,
  Trophy,
} from 'lucide-react';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pitch, setPitch] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await api.get<Campaign>(`/campaigns/${id}`);
      if (res.success && res.data) {
        setCampaign(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim() || pitch.length < 20) {
      setErrorMsg('Application statement must be at least 20 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/applications', {
        campaignId: campaign?.id,
        pitch: pitch.trim(),
        requestedAmount: requestedAmount ? parseFloat(requestedAmount) : undefined,
      });

      if (res.success) {
        setSuccessMsg('Your application was submitted successfully!');
        setApplyModalOpen(false);
        fetchCampaign();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user || user.role !== 'ATHLETE' || !campaign) return;
    try {
      const res = await api.post<{ isSaved: boolean }>(`/campaigns/${campaign.id}/save`);
      if (res.success) {
        setCampaign((prev) => (prev ? { ...prev, isSaved: res.data?.isSaved } : null));
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading campaign details..." className="py-24" />;
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-text-primary">Campaign Not Found</h2>
        <p className="text-xs text-text-secondary mt-1">This sponsorship campaign may have ended or been withdrawn.</p>
        <Link to="/marketplace" className="inline-block mt-4">
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(campaign.deadline);
  const isExpired = daysLeft === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Campaign Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{campaign.sportCategory}</Badge>
              <Badge variant="accent">{campaign.sponsorshipType}</Badge>
              <Badge variant={isExpired ? 'danger' : 'success'}>
                {isExpired ? 'CLOSED' : `${daysLeft} DAYS LEFT`}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-display text-text-primary leading-tight">
              {campaign.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent" /> {campaign.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" /> Deadline: {formatDate(campaign.deadline)}
              </span>
              <span>Published {formatDate(campaign.createdAt)}</span>
            </div>
          </div>

          {/* Explainable Recommendation Box */}
          {campaign.matchScore !== null && campaign.matchScore !== undefined && (
            <Card className="bg-accent/10 border-accent/30 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h4 className="text-sm font-bold text-accent">
                  {campaign.matchScore}% Compatibility Match For Your Profile
                </h4>
              </div>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                {campaign.matchReason}
              </p>
            </Card>
          )}

          {/* Description */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wide">
              Campaign Description
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
              {campaign.description}
            </p>
          </Card>

          {/* Eligibility Requirements */}
          <Card className="space-y-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wide">
                Eligibility & Performance Requirements
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
              {campaign.eligibilityRequirements}
            </p>
          </Card>
        </div>

        {/* Right Col: Sponsor Card & Action Box */}
        <div className="space-y-6">
          {/* Action Box */}
          <Card className="space-y-5 bg-background-elevated/40 border-accent/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Total Budget Envelope
              </span>
              <p className="text-2xl font-black text-accent font-display mt-0.5">
                {formatCurrency(campaign.budgetMin, campaign.currency)} - {formatCurrency(campaign.budgetMax, campaign.currency)}
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle space-y-3">
              {user?.role === 'ATHLETE' ? (
                campaign.hasApplied ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-400">Application Submitted</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Check status in your dashboard.</p>
                  </div>
                ) : isExpired ? (
                  <Button variant="outline" className="w-full" disabled>
                    Application Deadline Passed
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-glow"
                    onClick={() => setApplyModalOpen(true)}
                  >
                    Apply For Sponsorship
                  </Button>
                )
              ) : !user ? (
                <div className="space-y-2">
                  <Link to="/register/athlete" className="block">
                    <Button variant="primary" size="md" className="w-full font-bold">
                      Register to Apply
                    </Button>
                  </Link>
                  <Link to="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Already have an account? Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-text-muted text-center py-2">
                  You are logged in as {user.role}. (Applications are reserved for athletes).
                </p>
              )}

              {user?.role === 'ATHLETE' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<Bookmark className={`w-4 h-4 ${campaign.isSaved ? 'text-accent fill-current' : ''}`} />}
                  onClick={handleToggleSave}
                >
                  {campaign.isSaved ? 'Saved in My Favorites' : 'Save Campaign'}
                </Button>
              )}
            </div>
          </Card>

          {/* Sponsor Profile Mini Card */}
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-background-elevated border border-border-subtle flex items-center justify-center font-bold text-lg text-accent overflow-hidden">
                {campaign.sponsor?.logoUrl ? (
                  <img src={campaign.sponsor.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  campaign.sponsor?.companyName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-text-primary truncate">
                    {campaign.sponsor?.companyName}
                  </h4>
                  {campaign.sponsor?.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-muted">{campaign.sponsor?.industryCategory}</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
              {campaign.sponsor?.description || 'Corporate sports sponsor supporting athletic talent.'}
            </p>

            <div className="pt-3 border-t border-border-subtle text-xs text-text-muted space-y-1">
              <p>Location: {campaign.sponsor?.businessLocation}</p>
              <p>Representative: {campaign.sponsor?.contactPerson}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Application Submission Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Submit Sponsorship Application"
        description={`Applying for: ${campaign.title}`}
        maxWidth="lg"
      >
        <form onSubmit={handleApply} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase text-text-secondary block mb-1">
              Your Athlete Pitch & Vision (Required)
            </label>
            <textarea
              rows={5}
              required
              placeholder="Describe your athletic background, training cycle, upcoming tournaments, and why this sponsor's brand aligns with your goals..."
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <p className="text-[10px] text-text-muted mt-1">Minimum 20 characters required.</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-text-secondary block mb-1">
              Requested Grant / Value (Optional, in {campaign.currency})
            </label>
            <input
              type="number"
              placeholder={`Between ${campaign.budgetMin} and ${campaign.budgetMax}`}
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
