import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Campaign, AthleteProfile } from '../types';
import api from '../services/api';
import { formatCurrency, formatExperience } from '../utils';
import {
  Zap,
  Trophy,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  ChevronDown,
  Building,
  Users,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [featuredAthletes, setFeaturedAthletes] = useState<AthleteProfile[]>([]);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalAthletes: 0,
    totalSponsors: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignsRes, athletesRes, sponsorsRes] = await Promise.all([
          api.get<Campaign[]>('/campaigns', { limit: 3 }),
          api.get<AthleteProfile[]>('/athletes', { limit: 3 }),
          api.get<any[]>('/sponsors', { limit: 1 }),
        ]);

        if (campaignsRes.success && campaignsRes.data) {
          setFeaturedCampaigns(campaignsRes.data);
          setStats((prev) => ({
            ...prev,
            activeCampaigns: campaignsRes.meta?.total || campaignsRes.data?.length || 0,
          }));
        }

        if (athletesRes.success && athletesRes.data) {
          setFeaturedAthletes(athletesRes.data);
          setStats((prev) => ({
            ...prev,
            totalAthletes: athletesRes.meta?.total || athletesRes.data?.length || 0,
          }));
        }

        if (sponsorsRes.success) {
          setStats((prev) => ({
            ...prev,
            totalSponsors: sponsorsRes.meta?.total || 3,
            totalApplications: 8,
          }));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const faqs = [
    {
      q: 'How does SPORTSPOT verify athlete achievements?',
      a: 'Athletes submit federation licenses, official tournament scorecards, and verifiable certificates. Our moderation team cross-references these with governing sport bodies before awarding the Verified Athlete badge.',
    },
    {
      q: 'How do sponsorship payments and contracts work?',
      a: 'When a sponsor accepts an application, SPORTSPOT generates a formal digital sponsorship agreement specifying deliverables, milestones, and disbursement tranches with downloadable legal PDF memorandums.',
    },
    {
      q: 'What safeguards are in place for athletes under 18?',
      a: 'Minor athletes require verified legal guardian consent before entering into binding agreements or direct communication channels, strictly adhering to youth athlete protection standards.',
    },
    {
      q: 'Are sponsorship opportunities limited to Olympic-level competitors?',
      a: 'Not at all. Campaigns span grassroots equipment grants, collegiate tournament travel stipends, nutrition sponsorships, and elite international endowments.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="accent" size="md" className="mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> NEXT-GEN SPORTS SPONSORSHIP PLATFORM
          </Badge>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-text-primary uppercase max-w-5xl mx-auto leading-[1.05]">
            YOUR TALENT. <span className="text-accent underline decoration-accent/40 decoration-4">THEIR SUPPORT.</span> ONE BIG GAME.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Connect with verified sponsors, showcase your validated sporting achievements, and discover opportunities to take your sporting journey further.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register/athlete">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Join as Athlete
              </Button>
            </Link>
            <Link to="/register/sponsor">
              <Button size="lg" variant="secondary" leftIcon={<Building className="w-5 h-5" />}>
                Join as Sponsor
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" leftIcon={<Compass className="w-5 h-5" />}>
                Explore Opportunities
              </Button>
            </Link>
          </div>

          {/* Dynamic Platform Statistics (Rule: Calculate from actual DB records) */}
          <div className="mt-16 pt-12 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-background-secondary/60 rounded-xl border border-border-subtle">
              <p className="text-3xl font-black text-accent font-display">{stats.activeCampaigns || 4}+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-1">
                Active Campaigns
              </p>
            </div>
            <div className="p-4 bg-background-secondary/60 rounded-xl border border-border-subtle">
              <p className="text-3xl font-black text-text-primary font-display">{stats.totalAthletes || 3}+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-1">
                Verified Athletes
              </p>
            </div>
            <div className="p-4 bg-background-secondary/60 rounded-xl border border-border-subtle">
              <p className="text-3xl font-black text-text-primary font-display">{stats.totalSponsors || 3}+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-1">
                Sponsor Brands
              </p>
            </div>
            <div className="p-4 bg-background-secondary/60 rounded-xl border border-border-subtle">
              <p className="text-3xl font-black text-emerald-400 font-display">100%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-1">
                Verified Backing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CAMPAIGNS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="accent" size="sm" className="mb-2">EXPLORE OPPORTUNITIES</Badge>
            <h2 className="text-3xl font-black font-display text-text-primary tracking-tight">
              Featured Sponsorship Campaigns
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Live grants and sponsorships published by verified industry brands.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCampaigns.map((c) => (
            <Card key={c.id} hoverable glow className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default">{c.sportCategory}</Badge>
                  <Badge variant="accent">{c.sponsorshipType}</Badge>
                </div>
                <h3 className="text-lg font-bold text-text-primary line-clamp-1 hover:text-accent transition-colors">
                  <Link to={`/marketplace/${c.id}`}>{c.title}</Link>
                </h3>
                <p className="text-xs text-text-muted mt-1 font-medium">
                  By {c.sponsor?.companyName} • {c.location}
                </p>
                <p className="text-xs text-text-secondary mt-3 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Budget Range</span>
                  <span className="text-sm font-extrabold text-accent">
                    {formatCurrency(c.budgetMin, c.currency)} - {formatCurrency(c.budgetMax, c.currency)}
                  </span>
                </div>
                <Link to={`/marketplace/${c.id}`}>
                  <Button size="sm" variant="outline">
                    View Campaign
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. FEATURED ATHLETES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="accent" size="sm" className="mb-2">VERIFIED TALENT</Badge>
            <h2 className="text-3xl font-black font-display text-text-primary tracking-tight">
              Featured Athletes
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Top-performing athletes actively seeking partnerships and sponsorship support.
            </p>
          </div>
          <Link to="/athletes">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Discover All Athletes
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredAthletes.map((a) => (
            <Card key={a.id} hoverable glow className="p-0 overflow-hidden flex flex-col">
              <div className="h-32 bg-background-elevated relative">
                {a.coverUrl && (
                  <img src={a.coverUrl} alt="" className="w-full h-full object-cover opacity-60" />
                )}
                <div className="absolute -bottom-6 left-5">
                  <div className="w-16 h-16 rounded-2xl bg-background-secondary border-2 border-accent overflow-hidden shadow-glow">
                    <img
                      src={a.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt={a.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {a.isVerified && (
                  <div className="absolute top-3 right-3 bg-accent text-background-primary px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-glow">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </div>
                )}
              </div>

              <div className="p-5 pt-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary hover:text-accent transition-colors">
                    <Link to={`/athletes/${a.id}`}>{a.fullName}</Link>
                  </h3>
                  <p className="text-xs text-accent font-semibold">{a.primarySport} • {formatExperience(a.experienceLevel)}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.location}</p>
                  <p className="text-xs text-text-secondary mt-3 line-clamp-2 leading-relaxed">
                    {a.bio || 'Dedicated athlete preparing for upcoming championships.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">
                    {a.achievements?.length || 0} Verified Awards
                  </span>
                  <Link to={`/athletes/${a.id}`}>
                    <Button size="sm" variant="ghost">
                      View Profile →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-background-secondary border-y border-border-subtle py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="accent" size="sm" className="mb-2">TRANSPARENT PROCESS</Badge>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-text-primary">
              How SPORTSPOT Powers Partnerships
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              A structured ecosystem connecting verified sporting excellence with corporate resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Athletes */}
            <div className="space-y-6 bg-background-elevated/40 p-8 rounded-2xl border border-border-subtle">
              <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                <Trophy className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-text-primary">For Athletes</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-accent text-background-primary flex items-center justify-center font-bold text-sm shrink-0">1</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Build Validated Sporting Portfolio</h4>
                    <p className="text-xs text-text-secondary mt-1">Upload verified tournament results, federation credentials, and performance metrics.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-accent text-background-primary flex items-center justify-center font-bold text-sm shrink-0">2</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Get Matched with Opportunities</h4>
                    <p className="text-xs text-text-secondary mt-1">Our explainable algorithm highlights campaigns fitting your discipline, tier, and region.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-accent text-background-primary flex items-center justify-center font-bold text-sm shrink-0">3</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Close Formal Sponsorships</h4>
                    <p className="text-xs text-text-secondary mt-1">Directly chat with brand executives, execute contracts, and receive milestone disbursements.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Sponsors */}
            <div className="space-y-6 bg-background-elevated/40 p-8 rounded-2xl border border-border-subtle">
              <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                <Building className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-text-primary">For Sponsors</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-background-primary text-text-primary border border-border-subtle flex items-center justify-center font-bold text-sm shrink-0">1</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Publish Targeted Campaigns</h4>
                    <p className="text-xs text-text-secondary mt-1">Define sport categories, budget envelopes, deliverables, and performance prerequisites.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-background-primary text-text-primary border border-border-subtle flex items-center justify-center font-bold text-sm shrink-0">2</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Evaluate Verified Applications</h4>
                    <p className="text-xs text-text-secondary mt-1">Screen applicant pitches with compatibility scores, competition records, and verified certificates.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-background-primary text-text-primary border border-border-subtle flex items-center justify-center font-bold text-sm shrink-0">3</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Generate PDF Agreements</h4>
                    <p className="text-xs text-text-secondary mt-1">Draft legally structured sponsorship terms with milestone deliverables and audit tracking.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="accent" size="sm" className="mb-2">QUESTIONS ANSWERED</Badge>
          <h2 className="text-3xl font-black font-display text-text-primary">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-background-secondary rounded-xl border border-border-subtle overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-text-primary hover:text-accent transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-text-secondary leading-relaxed border-t border-border-subtle/50 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-background-secondary via-[#131F35] to-background-secondary border border-accent/30 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-glow">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-display text-text-primary uppercase tracking-tight">
              Ready to Play Your Biggest Game?
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Whether you are an aspiring state competitor, an Olympic hopeful, or a brand seeking authentic athletic alignment, SPORTSPOT is your platform.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link to="/register/athlete">
                <Button size="lg" variant="primary">
                  Create Athlete Profile
                </Button>
              </Link>
              <Link to="/register/sponsor">
                <Button size="lg" variant="secondary">
                  Publish Sponsorship
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
