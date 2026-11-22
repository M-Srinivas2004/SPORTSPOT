import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Lock, MapPin, Trophy, ShieldCheck, ArrowRight } from 'lucide-react';

export const RegisterAthletePage: React.FC = () => {
  const { registerAthlete } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    primarySport: 'Track & Field',
    secondarySports: '',
    location: '',
    experienceLevel: 'STATE_LEVEL',
    dateOfBirth: '',
    guardianConsent: false,
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
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      await registerAthlete(formData);
      navigate('/dashboard/athlete');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-display text-text-primary">Join as an Athlete</h2>
        <p className="text-xs text-text-secondary mt-1">
          Showcase your achievements and unlock real sponsorship opportunities
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Legal Name"
          required
          placeholder="e.g. Jordan Miles"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="athlete@example.com"
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Primary Sport
            </label>
            <select
              value={formData.primarySport}
              onChange={(e) => setFormData({ ...formData, primarySport: e.target.value })}
              className="w-full rounded-lg bg-background-elevated/70 border border-border-subtle px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              {sportsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              className="w-full rounded-lg bg-background-elevated/70 border border-border-subtle px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="INTERNATIONAL_PRO">International Pro</option>
              <option value="NATIONAL_LEVEL">National Championship Tier</option>
              <option value="STATE_LEVEL">State Level / Semi-Pro</option>
              <option value="INTERMEDIATE">Collegiate / Intermediate</option>
              <option value="BEGINNER">Junior / Grassroots</option>
            </select>
          </div>
        </div>

        <Input
          label="Location (City, State / Country)"
          required
          placeholder="e.g. Austin, TX, USA"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.guardianConsent}
              onChange={(e) => setFormData({ ...formData, guardianConsent: e.target.checked })}
              className="mt-0.5 rounded border-border-subtle bg-background-elevated text-accent focus:ring-accent"
            />
            <span className="text-[11px] text-text-secondary leading-tight">
              I agree to the SPORTSPOT Terms & Safeguarding Rules. If under 18, I confirm legal guardian approval.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-bold shadow-glow mt-2"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Complete Athlete Registration
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
