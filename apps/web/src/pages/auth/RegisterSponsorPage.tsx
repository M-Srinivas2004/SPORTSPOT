import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Building, Mail, Lock, User, MapPin, Globe, ArrowRight } from 'lucide-react';

export const RegisterSponsorPage: React.FC = () => {
  const { registerSponsor } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    industryCategory: 'Sports Nutrition & Health',
    contactPerson: '',
    businessLocation: '',
    email: '',
    password: '',
    website: '',
    contactPhone: '',
  });

  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      await registerSponsor(formData);
      navigate('/dashboard/sponsor');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sponsor registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-display text-text-primary">Join as a Sponsor Partner</h2>
        <p className="text-xs text-text-secondary mt-1">
          Publish campaigns, discover verified talent, and manage athletic partnerships
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Company / Brand Name"
          required
          placeholder="e.g. Apex Performance Nutrition"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          leftIcon={<Building className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <Input
            label="Representative Person"
            required
            placeholder="e.g. Sarah Jenkins"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            leftIcon={<User className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Business Email Address"
          type="email"
          required
          placeholder="partnerships@brand.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password (min 8 chars)"
          type="password"
          required
          placeholder="••••••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Corporate Location"
            required
            placeholder="e.g. Portland, OR, USA"
            value={formData.businessLocation}
            onChange={(e) => setFormData({ ...formData, businessLocation: e.target.value })}
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <Input
            label="Website (Optional)"
            type="url"
            placeholder="https://brand.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            leftIcon={<Globe className="w-4 h-4" />}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-bold shadow-glow mt-2"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Sponsor Account
        </Button>
      </form>

      <div className="text-center text-xs text-text-secondary">
        Already registered?{' '}
        <Link to="/login" className="text-accent font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
