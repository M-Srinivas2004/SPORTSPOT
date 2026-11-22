import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, getDaysRemaining } from '../../../utils';
import { Bookmark, Building, Clock, MapPin } from 'lucide-react';

export const AthleteSavedCampaignsPage: React.FC = () => {
  const [saved, setSaved] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get<Campaign[]>('/campaigns/saved');
      if (res.success && res.data) {
        setSaved(res.data);
      }
    } catch (err) {
      console.error('Failed to load saved campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/save`);
      setSaved((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to remove saved campaign:', err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading saved campaigns..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
          Saved Sponsorship Campaigns
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Opportunities bookmarked for future application review.
        </p>
      </div>

      {saved.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <Bookmark className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Saved Opportunities</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Browse the marketplace and bookmark campaigns you want to track or apply to later.
          </p>
          <Link to="/marketplace" className="inline-block pt-2">
            <Button size="sm" variant="outline">Browse Marketplace</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((c) => (
            <Card key={c.id} hoverable glow className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{c.sportCategory}</Badge>
                  <Badge variant="accent">{c.sponsorshipType}</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary line-clamp-1 hover:text-accent">
                  <Link to={`/marketplace/${c.id}`}>{c.title}</Link>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">By {c.sponsor?.companyName}</p>
                <p className="text-xs text-text-secondary mt-2 line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted block font-bold">Max Value</span>
                  <span className="text-sm font-black text-accent">{formatCurrency(c.budgetMax, c.currency)}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleRemove(c.id)}>
                    Remove
                  </Button>
                  <Link to={`/marketplace/${c.id}`}>
                    <Button size="sm" variant="outline">Apply</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
