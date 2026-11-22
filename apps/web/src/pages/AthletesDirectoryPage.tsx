import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AthleteProfile } from '../types';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatExperience } from '../utils';
import { Search, Trophy, CheckCircle2, MapPin, Award, Users } from 'lucide-react';

export const AthletesDirectoryPage: React.FC = () => {
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'roster' | 'leaderboard'>('roster');

  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('ALL');
  const [experienceLevel, setExperienceLevel] = useState('ALL');

  const sportsOptions = [
    'ALL',
    'Track & Field',
    'Gymnastics',
    'Badminton',
    'Swimming',
    'Basketball',
    'Boxing',
    'Tennis',
  ];

  const experienceOptions = [
    'ALL',
    'INTERNATIONAL_PRO',
    'NATIONAL_LEVEL',
    'STATE_LEVEL',
    'INTERMEDIATE',
    'BEGINNER',
  ];

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      if (viewMode === 'leaderboard') {
        const res = await api.get<any[]>('/athletes/leaderboard', { sport });
        if (res.success && res.data) setLeaderboard(res.data);
      } else {
        const res = await api.get<AthleteProfile[]>('/athletes', {
          search,
          sport,
          experienceLevel,
          limit: 12,
        });
        if (res.success && res.data) setAthletes(res.data);
      }
    } catch (err) {
      console.error('Failed to load athletes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [sport, experienceLevel, viewMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAthletes();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="accent" size="sm" className="mb-2">ATHLETE ROSTER</Badge>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
            Discover Verified Athletes
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse talented competitors across athletics, gymnastics, racket sports, and more.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-background-secondary p-1 rounded-xl border border-border-subtle self-start">
          <button
            onClick={() => setViewMode('roster')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'roster'
                ? 'bg-accent text-background-primary shadow-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Directory Roster
          </button>
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'leaderboard'
                ? 'bg-accent text-background-primary shadow-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sports Leaderboard
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-background-secondary p-4 rounded-2xl border border-border-subtle flex flex-col sm:flex-row gap-3">
        {viewMode === 'roster' && (
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <Input
              placeholder="Search athlete name, discipline, or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </form>
        )}

        <div className="flex gap-3">
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="text-xs rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
          >
            {sportsOptions.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Sports' : s}
              </option>
            ))}
          </select>

          {viewMode === 'roster' && (
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="text-xs rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            >
              {experienceOptions.map((e) => (
                <option key={e} value={e}>
                  {e === 'ALL' ? 'All Tiers' : formatExperience(e)}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" size="sm" onClick={fetchAthletes}>
            Filter
          </Button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingSpinner text="Loading athletes..." />
      ) : viewMode === 'leaderboard' ? (
        /* Leaderboard Table View */
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-border-subtle">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> Official Sports Leaderboard Rankings
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Rankings computed transparently from verified national championships, world standings, and formal agreements.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-background-elevated/40 text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Competition Tier</th>
                  <th className="py-3 px-4">Verified Awards</th>
                  <th className="py-3 px-4">Score Points</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {leaderboard.map((item) => (
                  <tr key={item.id} className="hover:bg-background-elevated/20 transition-colors">
                    <td className="py-3 px-4 font-black text-accent text-sm">#{item.rank}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-accent/40"
                        />
                        <span className="font-bold text-text-primary">{item.fullName}</span>
                        {item.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{item.primarySport}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{formatExperience(item.experienceLevel)}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{item.verifiedAchievementsCount}</td>
                    <td className="py-3 px-4 font-black font-display text-accent">{item.rankScore} pts</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/athletes/${item.id}`}>
                        <Button size="sm" variant="ghost">View Profile</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : athletes.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No athletes found"
          description="Try removing search filters to view more profiles."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSport('ALL');
            setExperienceLevel('ALL');
          }}
        />
      ) : (
        /* Directory Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((a) => (
            <Card key={a.id} hoverable glow className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-28 bg-background-elevated relative">
                  {a.coverUrl && (
                    <img src={a.coverUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute -bottom-5 left-5">
                    <div className="w-14 h-14 rounded-2xl bg-background-secondary border-2 border-accent overflow-hidden shadow-glow">
                      <img
                        src={a.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={a.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {a.isVerified && (
                    <div className="absolute top-2.5 right-2.5 bg-accent text-background-primary px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-glow">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </div>
                  )}
                </div>

                <div className="p-5 pt-8">
                  <h3 className="text-base font-bold text-text-primary hover:text-accent transition-colors">
                    <Link to={`/athletes/${a.id}`}>{a.fullName}</Link>
                  </h3>
                  <p className="text-xs text-accent font-semibold">
                    {a.primarySport} • {formatExperience(a.experienceLevel)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {a.location}
                  </p>
                  <p className="text-xs text-text-secondary mt-2.5 line-clamp-2 leading-relaxed">
                    {a.bio || 'Competitor seeking sponsorship partners.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  {a._count?.achievements || 0} Achievements
                </span>
                <Link to={`/athletes/${a.id}`}>
                  <Button size="sm" variant="outline">
                    View Portfolio
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
