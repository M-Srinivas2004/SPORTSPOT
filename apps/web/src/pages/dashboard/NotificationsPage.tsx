import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner text="Loading notifications..." className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            Notification Center
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit updates on application submissions, campaign approvals, and direct messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllAsRead}
          >
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <Bell className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Notifications</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You are fully caught up! New alerts will appear here as they occur.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-colors ${
                n.isRead
                  ? 'bg-background-secondary/60 border-border-subtle'
                  : 'bg-accent/5 border-accent/30 shadow-glow'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary">{n.title}</span>
                    <Badge variant={n.isRead ? 'default' : 'accent'} size="sm">
                      {n.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-text-muted block pt-1">
                    {formatDate(n.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>
                      Mark Read
                    </Button>
                  )}
                  {n.actionUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id);
                        navigate(n.actionUrl!);
                      }}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
