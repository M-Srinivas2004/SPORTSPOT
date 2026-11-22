import React, { useState, useEffect } from 'react';
import { Event } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils';
import { Calendar, PlusCircle, MapPin, Building } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    sport: 'Track & Field',
    organizer: '',
    location: '',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    registrationLink: '',
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get<Event[]>('/events');
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/events', formData);
      if (res.success) {
        setModalOpen(false);
        setFormData({
          title: '',
          sport: 'Track & Field',
          organizer: '',
          location: '',
          eventDate: new Date().toISOString().split('T')[0],
          description: '',
          registrationLink: '',
        });
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    }
  };

  if (loading) return <LoadingSpinner text="Loading events..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            Events & Tournament Management
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Maintain championship schedules and official competition listings.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Publish New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <Card key={ev.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="default">{ev.sport}</Badge>
              <Badge variant="accent">Listed</Badge>
            </div>
            <h3 className="text-base font-bold text-text-primary">{ev.title}</h3>
            <div className="text-xs text-text-muted space-y-1">
              <p className="flex items-center gap-1.5 text-accent font-semibold">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(ev.eventDate)}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {ev.location}
              </p>
              <p className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Organizer: {ev.organizer}
              </p>
            </div>
            <p className="text-xs text-text-secondary pt-2 border-t border-border-subtle line-clamp-3">
              {ev.description}
            </p>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Sporting Event"
        description="Add a tournament or championship to the public calendar"
      >
        <form onSubmit={handleCreateEvent} className="space-y-3">
          <Input
            label="Event / Championship Title"
            required
            placeholder="e.g. World Athletics Diamond League Qualifier"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sport Category"
              required
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
            />
            <Input
              label="Event Date"
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Organizer / Federation"
              required
              placeholder="e.g. USATF"
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            />
            <Input
              label="Venue & Location"
              required
              placeholder="e.g. Eugene, OR, USA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Event Description
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-background-elevated border border-border-subtle px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <Input
            label="Official Registration URL"
            type="url"
            placeholder="https://event.org"
            value={formData.registrationLink}
            onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
          />

          <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save & Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
