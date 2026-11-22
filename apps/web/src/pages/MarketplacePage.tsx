import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, getDaysRemaining } from '../utils';
import {
  Search,
  Filter,
  Sparkles,
  Clock,
  MapPin,
  Building,
  Bookmark,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter States
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState(user?.role === 'ATHLETE' ? 'recommended' : 'newest');
  const [page, setPage] = useState(1);

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

  const typeOptions = [
    'ALL',
    'FINANCIAL',
    'EQUIPMENT',
    'TRAINING',
    'TRAVEL',
    'INDIVIDUAL',
    'TEAM',
  ];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get<Campaign[]>('/campaigns', {
        search,
        sport,
        type,
        minBudget,
        maxBudget,
        sort,
        page,
        limit: 9,
      });

      if (res.success && res.data) {
        setCampaigns(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [sport, type, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  const handleToggleSave = async (campaignId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'ATHLETE') return;

    try {
      const res = await api.post<{ isSaved: boolean }>(`/campaigns/${campaignId}/save`);
      if (res.success) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, isSaved: res.data?.isSaved } : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div>
        <Badge variant="accent" size="sm" className="mb-2">ACTIVE OPPORTUNITIES</Badge>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
          Sponsorship Marketplace
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Explore and apply for verified brand sponsorships, equipment contracts, and training endowments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-background-secondary p-5 rounded-2xl border border-border-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by campaign title, sport, brand or requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border-subtle">
          {/* Sport Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">
              Sport Category
            </label>
            <select
              value={sport}
              onChange={(e) => {
                setSport(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            >
              {sportsOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Sports' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">
              Sponsorship Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Types' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full text-xs rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            >
              {user?.role === 'ATHLETE' && (
                <option value="recommended">Best Matched (Algorithm)</option>
              )}
              <option value="newest">Recently Published</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="deadline">Closing Soon</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-[34px]"
              onClick={() => {
                setSearch('');
                setSport('ALL');
                setType('ALL');
                setMinBudget('');
                setMaxBudget('');
                setSort('newest');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <LoadingSpinner text="Searching live sponsorship campaigns..." />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-8 h-8" />}
          title="No campaigns matched your criteria"
          description="Try broadening your sports filter or search query to find open sponsorship opportunities."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSport('ALL');
            setType('ALL');
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => {
              const daysLeft = getDaysRemaining(c.deadline);
              return (
                <Card
                  key={c.id}
                  hoverable
                  glow
                  className="flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Header: Sport & Type + Bookmark */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{c.sportCategory}</Badge>
                        <Badge variant="accent">{c.sponsorshipType}</Badge>
                      </div>

                      {user?.role === 'ATHLETE' && (
                        <button
                          onClick={(e) => handleToggleSave(c.id, e)}
                          title={c.isSaved ? 'Remove from saved' : 'Save opportunity'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            c.isSaved
                              ? 'bg-accent/20 border-accent text-accent'
                              : 'bg-background-elevated border-border-subtle text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>

                    {/* Recommendation Badge if athlete */}
                    {c.matchScore !== null && c.matchScore !== undefined && (
                      <div className="mb-3 p-2 rounded-lg bg-accent/10 border border-accent/20 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-accent flex items-center gap-1 text-[11px]">
                            <Sparkles className="w-3 h-3" /> {c.matchScore}% COMPATIBILITY MATCH
                          </span>
                        </div>
                        {c.matchReason && (
                          <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-1">
                            {c.matchReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                      <Link to={`/marketplace/${c.id}`}>{c.title}</Link>
                    </h3>

                    {/* Sponsor Meta */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                      <Building className="w-3.5 h-3.5 text-accent" />
                      <span className="font-medium text-text-secondary">
                        {c.sponsor?.companyName}
                      </span>
                      {c.sponsor?.isVerified && (
                        <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {c.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {daysLeft} days left
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary mt-3 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">
                        Budget Range
                      </span>
                      <span className="text-sm font-extrabold text-accent font-display">
                        {formatCurrency(c.budgetMin, c.currency)} - {formatCurrency(c.budgetMax, c.currency)}
                      </span>
                    </div>

                    <Link to={`/marketplace/${c.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {total > 9 && (
            <div className="flex justify-center items-center gap-3 pt-6">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-text-secondary">
                Page {page} of {Math.ceil(total / 9)}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= Math.ceil(total / 9)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
