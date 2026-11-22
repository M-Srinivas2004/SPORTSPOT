import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Building, Save, CheckCircle2 } from 'lucide-react';

export const SponsorProfileEditPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const sponsor = user?.sponsorProfile;

  const [formData, setFormData] = useState({
    companyName: sponsor?.companyName || '',
    description: sponsor?.description || '',
    industryCategory: sponsor?.industryCategory || 'Sports Nutrition & Health',
    website: sponsor?.website || '',
    contactPerson: sponsor?.contactPerson || '',
    businessLocation: sponsor?.businessLocation || '',
    contactPhone: sponsor?.contactPhone || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const industries = [
    'Sports Nutrition & Health',
    'Apparel & Equipment',
    'Beverages & Hydration',
    'Financial Services & Grants',
    'Automotive & Transit',
    'Tech & Wearables',
    'Healthcare & Recovery',
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.put('/sponsors/profile', formData);
      if (res.success) {
        setSuccessMsg('Company profile updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
          Company Profile Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Manage your brand identity, corporate contact details, and platform credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <Card className="space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Company / Brand Name"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Industry Category
            </label>
            <select
              value={formData.industryCategory}
              onChange={(e) => setFormData({ ...formData, industryCategory: e.target.value })}
              className="w-full rounded-lg bg-background-elevated/70 border border-border-subtle px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Corporate Description & Sports Endorsement Mission
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-background-elevated/70 border border-border-subtle px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
              placeholder="Highlight your company's sporting heritage, products, and vision for athlete partnerships..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />

            <Input
              label="Contact Phone (Optional)"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Location"
              required
              value={formData.businessLocation}
              onChange={(e) => setFormData({ ...formData, businessLocation: e.target.value })}
            />

            <Input
              label="Official Website URL"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-border-subtle flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Company Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
