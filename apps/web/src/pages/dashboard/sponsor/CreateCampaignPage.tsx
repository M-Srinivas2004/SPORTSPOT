import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Send, Save, ArrowLeft } from 'lucide-react';

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    sportCategory: 'Track & Field',
    sponsorshipType: 'FINANCIAL',
    budgetMin: 5000,
    budgetMax: 15000,
    currency: 'USD',
    description: '',
    eligibilityRequirements: '',
    location: 'Global',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sportsList = [
    'Track & Field',
    'Gymnastics',
    'Badminton',
    'Swimming',
    'Basketball',
    'Boxing',
    'Tennis',
    'Weightlifting',
    'Cycling',
    'Soccer',
    'All Sports',
  ];

  const typesList = [
    { value: 'FINANCIAL', label: 'Financial Grant & Endorsement' },
    { value: 'EQUIPMENT', label: 'Gear, Spikes & Apparel Sponsorship' },
    { value: 'TRAINING', label: 'Elite Coaching & Training Camp Subsidies' },
    { value: 'TRAVEL', label: 'Tournament Travel & Logistics Stipend' },
    { value: 'INDIVIDUAL', label: 'Individual Competitor Representation' },
    { value: 'TEAM', label: 'Team / Relay Squad Sponsorship' },
  ];

  const handleSubmit = async (submitForReview: boolean) => {
    try {
      if (!formData.title || formData.title.length < 5) {
        setErrorMsg('Title must be at least 5 characters.');
        return;
      }
      if (!formData.description || formData.description.length < 20) {
        setErrorMsg('Description must be at least 20 characters.');
        return;
      }
      if (!formData.eligibilityRequirements || formData.eligibilityRequirements.length < 10) {
        setErrorMsg('Eligibility requirements must be at least 10 characters.');
        return;
      }
      if (Number(formData.budgetMax) < Number(formData.budgetMin)) {
        setErrorMsg('Maximum budget cannot be less than minimum budget.');
        return;
      }

      setLoading(true);
      setErrorMsg('');

      const res = await api.post('/campaigns', {
        ...formData,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        submitForReview,
      });

      if (res.success) {
        navigate('/dashboard/sponsor/campaigns');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/sponsor/campaigns')}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-elevated"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            Create Sponsorship Campaign
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Set competition eligibility, grant amounts, and review preferences.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <Card className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Campaign Title"
            required
            placeholder="e.g. Apex NextGen National Track & Field Grant 2026"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Target Discipline
              </label>
              <select
                value={formData.sportCategory}
                onChange={(e) => setFormData({ ...formData, sportCategory: e.target.value })}
                className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                {sportsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Sponsorship Category
              </label>
              <select
                value={formData.sponsorshipType}
                onChange={(e) => setFormData({ ...formData, sponsorshipType: e.target.value })}
                className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                {typesList.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Minimum Budget (USD)"
              type="number"
              required
              value={formData.budgetMin}
              onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
            />
            <Input
              label="Maximum Budget (USD)"
              type="number"
              required
              value={formData.budgetMax}
              onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
            />
            <Input
              label="Location Eligibility"
              required
              placeholder="e.g. Global or North America"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Campaign Description & Deliverables
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detail what your brand is providing (grant sum, supplements, apparel) and what is expected of sponsored athletes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Eligibility & Performance Criteria
            </label>
            <textarea
              rows={3}
              required
              placeholder="Specify required competition tiers (e.g. State finalist, National qualifier, FIG or WADA compliance)..."
              value={formData.eligibilityRequirements}
              onChange={(e) => setFormData({ ...formData, eligibilityRequirements: e.target.value })}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          <div className="w-full sm:w-1/2">
            <Input
              label="Application Deadline"
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border-subtle flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            isLoading={loading}
            leftIcon={<Save className="w-4 h-4" />}
            onClick={() => handleSubmit(false)}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => handleSubmit(true)}
          >
            Submit for Admin Review
          </Button>
        </div>
      </Card>
    </div>
  );
};
