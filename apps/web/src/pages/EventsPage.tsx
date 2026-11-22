import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils';
import { Calendar, MapPin, Building, Trophy, ExternalLink } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('ALL');

  const sportsOptions = ['ALL', 'Track & Field', 'Badminton', 'Gymnastics', 'Swimming'];

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await api.get<Event[]>('/events', { sport });
        if (res.success && res.data) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [sport]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Badge variant="accent" size="sm" className="mb-2">TOURNAMENT CALENDAR</Badge>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
          Sporting Events & Tournaments
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Explore upcoming championship competitions and opportunities for tournament sponsorships.
        </p>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {sportsOptions.map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sport === s
                ? 'bg-accent text-background-primary shadow-glow'
                : 'bg-background-secondary border border-border-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            {s === 'ALL' ? 'All Disciplines' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading upcoming events..." />
      ) : events.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-12">No scheduled events found for this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <Card key={ev.id} hoverable glow className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="default">{ev.sport}</Badge>
                  <Badge variant={ev.sponsorshipOpen ? 'accent' : 'outline'}>
                    {ev.sponsorshipOpen ? 'Sponsorships Open' : 'Closed'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-text-primary">{ev.title}</h3>

                <div className="space-y-1.5 text-xs text-text-muted">
                  <p className="flex items-center gap-1.5 text-accent font-medium">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(ev.eventDate)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" /> {ev.location}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-text-muted" /> Organizer: {ev.organizer}
                  </p>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-border-subtle">
                  {ev.description}
                </p>
              </div>

              {ev.registrationLink && (
                <div className="pt-4 mt-4 border-t border-border-subtle">
                  <a href={ev.registrationLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Official Event Site
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
