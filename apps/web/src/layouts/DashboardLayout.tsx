import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Zap,
  LayoutDashboard,
  Trophy,
  FileText,
  Bookmark,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Users,
  CheckCircle,
  PlusCircle,
  FolderOpen,
  Calendar,
  ShieldCheck,
  Building,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export interface DashboardLayoutProps {
  requiredRole?: 'ATHLETE' | 'SPONSOR' | 'ADMIN';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ requiredRole }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Role validation
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    const fallbackPath =
      user.role === 'ADMIN'
        ? '/dashboard/admin'
        : user.role === 'SPONSOR'
        ? '/dashboard/sponsor'
        : '/dashboard/athlete';
    navigate(fallbackPath, { replace: true });
    return null;
  }

  // Sidebar Links by Role
  const athleteLinks = [
    { name: 'Overview', path: '/dashboard/athlete', icon: LayoutDashboard },
    { name: 'My Profile & Records', path: '/dashboard/athlete/profile', icon: Trophy },
    { name: 'My Applications', path: '/dashboard/athlete/applications', icon: FileText },
    { name: 'Saved Campaigns', path: '/dashboard/athlete/saved', icon: Bookmark },
    { name: 'Agreements & Grants', path: '/dashboard/athlete/agreements', icon: ShieldCheck },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  ];

  const sponsorLinks = [
    { name: 'Overview', path: '/dashboard/sponsor', icon: LayoutDashboard },
    { name: 'Campaigns Management', path: '/dashboard/sponsor/campaigns', icon: FolderOpen },
    { name: 'Create Campaign', path: '/dashboard/sponsor/campaigns/new', icon: PlusCircle },
    { name: 'Company Profile', path: '/dashboard/sponsor/profile', icon: Building },
    { name: 'Agreements', path: '/dashboard/sponsor/agreements', icon: ShieldCheck },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  ];

  const adminLinks = [
    { name: 'Platform Overview', path: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Campaign Moderation', path: '/dashboard/admin/campaigns', icon: CheckCircle },
    { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
    { name: 'Events & Tournaments', path: '/dashboard/admin/events', icon: Calendar },
    { name: 'System Audit Logs', path: '/dashboard/admin/audit-logs', icon: ShieldCheck },
  ];

  const links =
    user.role === 'ADMIN'
      ? adminLinks
      : user.role === 'SPONSOR'
      ? sponsorLinks
      : athleteLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background-primary flex text-text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-background-secondary border-r border-border-subtle shrink-0 fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-border-subtle">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-background-primary flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black font-display tracking-wider">
                SPORT<span className="text-accent">SPOT</span>
              </span>
              <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">
                {user.role} PORTAL
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">
            Main Menu
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-background-primary shadow-glow font-bold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-background-primary' : 'text-text-muted'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-border-subtle">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">
              Public View
            </p>
            <Link
              to="/marketplace"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-accent hover:bg-background-elevated"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Explore Marketplace</span>
            </Link>
            <Link
              to="/athletes"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-accent hover:bg-background-elevated"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Athletes Roster</span>
            </Link>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-border-subtle bg-background-elevated/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs">
                {user.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-text-primary truncate">
                  {user.athleteProfile?.fullName || user.sponsorProfile?.companyName || user.email}
                </p>
                <p className="text-[10px] text-text-muted truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-20 bg-background-primary/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-elevated"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-text-primary capitalize">
              {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-background-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-background-primary text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-background-secondary border border-border-subtle shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text-primary">Notifications</h4>
                      {unreadCount > 0 && <Badge variant="accent" size="sm">{unreadCount} new</Badge>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-accent hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                            if (n.actionUrl) {
                              setNotificationsOpen(false);
                              navigate(n.actionUrl);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.isRead
                              ? 'bg-background-elevated/30 border-border-subtle text-text-secondary'
                              : 'bg-accent/5 border-accent/20 text-text-primary font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-text-primary">{n.title}</span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-text-secondary line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <Badge variant="accent" size="md">
              {user.role}
            </Badge>

            {/* Quick Action Button for Sponsor */}
            {user.role === 'SPONSOR' && (
              <Link to="/dashboard/sponsor/campaigns/new">
                <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  New Campaign
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-background-primary/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-background-secondary border-r border-border-subtle p-6 flex flex-col z-10">
              <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
                <span className="text-lg font-black font-display tracking-wider">
                  SPORT<span className="text-accent">SPOT</span>
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-background-elevated"
                  >
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
