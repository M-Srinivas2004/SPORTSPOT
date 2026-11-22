import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Trophy, Award, Trash2, PlusCircle, CheckCircle2, Save } from 'lucide-react';

export const AthleteProfileEditPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.athleteProfile;

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    bio: profile?.bio || '',
    primarySport: profile?.primarySport || 'Track & Field',
    secondarySports: profile?.secondarySports || '',
    location: profile?.location || '',
    experienceLevel: profile?.experienceLevel || 'STATE_LEVEL',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Achievement Modal State
  const [achModalOpen, setAchModalOpen] = useState(false);
  const [achData, setAchData] = useState({
    title: '',
    year: new Date().getFullYear(),
    tournament: '',
    rankOrMedal: '',
    description: '',
  });

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certData, setCertData] = useState({
    title: '',
    issuingOrg: '',
    issueDate: new Date().toISOString().split('T')[0],
    fileUrl: '/uploads/certificates/sample.pdf',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.put('/athletes/profile', formData);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/athletes/achievements', {
        ...achData,
        year: Number(achData.year),
      });
      if (res.success) {
        setAchModalOpen(false);
        setAchData({
          title: '',
          year: new Date().getFullYear(),
          tournament: '',
          rankOrMedal: '',
          description: '',
        });
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add achievement');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await api.delete(`/athletes/achievements/${id}`);
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to delete achievement');
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/athletes/certificates', certData);
      if (res.success) {
        setCertModalOpen(false);
        setCertData({
          title: '',
          issuingOrg: '',
          issueDate: new Date().toISOString().split('T')[0],
          fileUrl: '/uploads/certificates/sample.pdf',
        });
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add certificate');
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await api.delete(`/athletes/certificates/${id}`);
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to delete certificate');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
          Athlete Profile & Verified Records
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Maintain your personal information, competitive history, and federation credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 1. General Profile Info */}
      <Card className="space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary pb-3 border-b border-border-subtle">
          General Athletic Information
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Sporting Bio & Vision
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-lg bg-background-elevated/70 border border-border-subtle px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
              placeholder="Highlight your current training regimen, competition targets, and personal athletic milestones..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Sport"
              required
              value={formData.primarySport}
              onChange={(e) => setFormData({ ...formData, primarySport: e.target.value })}
            />

            <Input
              label="Secondary Sports (Comma-separated)"
              value={formData.secondarySports}
              placeholder="e.g. Sprint, Weightlifting"
              onChange={(e) => setFormData({ ...formData, secondarySports: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Competition Tier
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
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

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Sporting Achievements Management */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" /> Sporting Achievements & Awards
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Document podium finishes, tournament records, and championship honors.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setAchModalOpen(true)}
          >
            Add Achievement
          </Button>
        </div>

        {profile?.achievements?.length === 0 ? (
          <p className="text-xs text-text-muted py-6 text-center">
            No achievements recorded yet. Add your verified competition awards above.
          </p>
        ) : (
          <div className="space-y-3">
            {profile?.achievements?.map((ach) => (
              <div
                key={ach.id}
                className="p-4 rounded-xl bg-background-elevated/40 border border-border-subtle flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary">{ach.title}</span>
                    <Badge variant="accent" size="sm">{ach.rankOrMedal}</Badge>
                  </div>
                  <p className="text-xs text-accent font-semibold">
                    {ach.tournament} • Year {ach.year}
                  </p>
                  <p className="text-xs text-text-secondary">{ach.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteAchievement(ach.id)}
                  className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Delete Achievement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Certificates & Licenses Management */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" /> Federation Certificates & Licenses
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Upload governing body certifications, anti-doping verifications, or federation IDs.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setCertModalOpen(true)}
          >
            Add Certificate
          </Button>
        </div>

        {profile?.certificates?.length === 0 ? (
          <p className="text-xs text-text-muted py-6 text-center">
            No certificates uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile?.certificates?.map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-xl bg-background-elevated/40 border border-border-subtle flex items-center justify-between gap-3"
              >
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-text-primary truncate">{cert.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{cert.issuingOrg}</p>
                </div>
                <button
                  onClick={() => handleDeleteCertificate(cert.id)}
                  className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Achievement Modal */}
      <Modal
        isOpen={achModalOpen}
        onClose={() => setAchModalOpen(false)}
        title="Add Sporting Achievement"
        description="Enter verifiable competition outcome details"
      >
        <form onSubmit={handleAddAchievement} className="space-y-3">
          <Input
            label="Achievement Title"
            required
            placeholder="e.g. National 100m Gold Medalist"
            value={achData.title}
            onChange={(e) => setAchData({ ...achData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Competition Year"
              type="number"
              required
              value={achData.year}
              onChange={(e) => setAchData({ ...achData, year: Number(e.target.value) })}
            />
            <Input
              label="Rank / Medal"
              required
              placeholder="e.g. 1st Place / Gold"
              value={achData.rankOrMedal}
              onChange={(e) => setAchData({ ...achData, rankOrMedal: e.target.value })}
            />
          </div>

          <Input
            label="Tournament / Meet Name"
            required
            placeholder="e.g. USATF National Championship"
            value={achData.tournament}
            onChange={(e) => setAchData({ ...achData, tournament: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Description & Race Splits / Stats
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide final score, official timing, or round summary..."
              value={achData.description}
              onChange={(e) => setAchData({ ...achData, description: e.target.value })}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Certificate Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Add Certificate or License"
        description="Record governing federation certification"
      >
        <form onSubmit={handleAddCertificate} className="space-y-3">
          <Input
            label="Certificate Title"
            required
            placeholder="e.g. USATF Licensed National Level Athlete"
            value={certData.title}
            onChange={(e) => setCertData({ ...certData, title: e.target.value })}
          />

          <Input
            label="Issuing Organization"
            required
            placeholder="e.g. USA Track & Field Federation"
            value={certData.issuingOrg}
            onChange={(e) => setCertData({ ...certData, issuingOrg: e.target.value })}
          />

          <Input
            label="Issue Date"
            type="date"
            required
            value={certData.issueDate}
            onChange={(e) => setCertData({ ...certData, issueDate: e.target.value })}
          />

          <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCertModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
