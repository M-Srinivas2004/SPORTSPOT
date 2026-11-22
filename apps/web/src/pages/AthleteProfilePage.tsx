import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AthleteProfile } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatExperience, formatDate } from '../utils';
import {
  Trophy,
  Award,
  FileCheck,
  CheckCircle2,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Shield,
  Eye,
} from 'lucide-react';

export const AthleteProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await api.get<AthleteProfile>(`/athletes/${id}`);
        if (res.success && res.data) {
          setAthlete(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

  const handleStartMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'SPONSOR' && user.sponsorProfile && athlete) {
      try {
        const res = await api.post<any>('/messages/conversations', {
          athleteId: athlete.id,
          sponsorId: user.sponsorProfile.id,
        });
        if (res.success && res.data) {
          navigate(`/dashboard/messages?conversation=${res.data.id}`);
        }
      } catch (err) {
        console.error('Failed to start conversation:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading athlete portfolio..." className="py-24" />;
  if (!athlete) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-text-primary">Athlete Profile Not Found</h2>
        <Link to="/athletes" className="mt-4 inline-block">
          <Button variant="outline">Back to Roster</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link to="/athletes" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Athletes
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl bg-background-secondary border border-border-subtle overflow-hidden relative shadow-2xl">
        <div className="h-56 bg-background-elevated relative">
          {athlete.coverUrl ? (
            <img src={athlete.coverUrl} alt="" className="w-full h-full object-cover opacity-70" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-background-secondary via-[#14223A] to-background-secondary" />
          )}
          <div className="absolute top-4 right-4 bg-background-primary/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border-subtle flex items-center gap-2 text-xs text-text-secondary">
            <Eye className="w-3.5 h-3.5 text-accent" />
            <span>{athlete.profileViews} Views</span>
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-8 relative pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-background-secondary border-4 border-background-primary overflow-hidden shadow-glow shrink-0">
                <img
                  src={athlete.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                  alt={athlete.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
                    {athlete.fullName}
                  </h1>
                  {athlete.isVerified && (
                    <Badge variant="accent" size="sm" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED ATHLETE
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-bold text-accent">
                  {athlete.primarySport} {athlete.secondarySports && `• ${athlete.secondarySports}`}
                </p>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {athlete.location} • {formatExperience(athlete.experienceLevel)}
                </p>
              </div>
            </div>

            {user?.role === 'SPONSOR' && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                onClick={handleStartMessage}
              >
                Propose Sponsorship
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Bio, Achievements, Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Sporting Biography & Vision
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
              {athlete.bio || 'Professional athlete dedicated to high performance and competitive excellence.'}
            </p>
          </Card>

          {/* Sporting Achievements */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" /> Verified Sporting Achievements
              </h3>
              <span className="text-xs text-text-muted">
                {athlete.achievements?.length || 0} Records
              </span>
            </div>

            {athlete.achievements?.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">
                No tournament records published yet.
              </p>
            ) : (
              <div className="space-y-3">
                {athlete.achievements?.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-xl bg-background-elevated/40 border border-border-subtle space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-text-primary">{ach.title}</h4>
                      <Badge variant="accent" size="sm">{ach.rankOrMedal}</Badge>
                    </div>
                    <p className="text-xs text-accent font-medium">
                      {ach.tournament} • Year {ach.year}
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">{ach.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Official Certificates */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-accent" /> Verified Credentials & Certificates
              </h3>
            </div>

            {athlete.certificates?.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">
                No certificate records uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {athlete.certificates?.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-xl bg-background-elevated/40 border border-border-subtle flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-bold text-text-primary truncate">{cert.title}</h5>
                      <p className="text-[11px] text-text-muted mt-0.5">{cert.issuingOrg}</p>
                      <p className="text-[10px] text-text-secondary mt-1">
                        Issued: {formatDate(cert.issueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Profile Summary
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Primary Sport</span>
                <span className="text-text-primary font-semibold">{athlete.primarySport}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Experience Tier</span>
                <span className="text-text-primary font-semibold">{formatExperience(athlete.experienceLevel)}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Training Location</span>
                <span className="text-text-primary font-semibold">{athlete.location}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Active Deals</span>
                <span className="text-text-primary font-semibold">{athlete._count?.agreements || 0} Endorsements</span>
              </div>
            </div>
          </Card>

          <Card className="bg-background-elevated/40 border-accent/20 p-5 space-y-3 text-center">
            <Shield className="w-8 h-8 text-accent mx-auto" />
            <h4 className="text-sm font-bold text-text-primary">SPORTSPOT Verified Protection</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every profile document is screened to prevent misrepresentation and safeguard fair sponsorship opportunities.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
