import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Zap, Trophy, Shield, User, ArrowRight, Menu, X } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Athletes', path: '/athletes' },
    { name: 'Sponsorships', path: '/marketplace' },
    { name: 'Events', path: '/events' },
    { name: 'About Us', path: '/about' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'SPONSOR') return '/dashboard/sponsor';
    return '/dashboard/athlete';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-text-primary">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background-primary/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-accent text-background-primary flex items-center justify-center font-black text-xl font-display group-hover:shadow-glow transition-all">
              <Zap className="w-6 h-6 fill-current stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black tracking-wider font-display text-text-primary">
              SPORT<span className="text-accent">SPOT</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors duration-150 ${
                    isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to={getDashboardPath()}>
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Dashboard ({user.role})
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Login
                  </Button>
                </Link>
                <Link to="/register/athlete">
                  <Button variant="primary" size="md">
                    Join SPORTSPOT
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background-secondary border-b border-border-subtle px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-text-secondary hover:text-accent"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-border-subtle">
              {user ? (
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" variant="primary">
                    Dashboard ({user.role})
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register/athlete" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Join as Athlete
                    </Button>
                  </Link>
                  <Link to="/register/sponsor" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Join as Sponsor
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="bg-background-secondary border-t border-border-subtle pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border-subtle">
            {/* Col 1: Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent text-background-primary flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-black font-display tracking-wider">
                  SPORT<span className="text-accent">SPOT</span>
                </span>
              </Link>
              <p className="text-xs text-text-muted leading-relaxed font-semibold uppercase tracking-wider">
                "YOUR TALENT. THEIR SUPPORT. ONE BIG GAME."
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                The premier digital sports sponsorship marketplace connecting verified elite athletes with forward-thinking brands and corporate backers.
              </p>
            </div>

            {/* Col 2: Marketplace */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary">Marketplace</h5>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><Link to="/marketplace" className="hover:text-accent">Browse Sponsorships</Link></li>
                <li><Link to="/athletes" className="hover:text-accent">Verified Athletes</Link></li>
                <li><Link to="/events" className="hover:text-accent">Tournament Directory</Link></li>
                <li><Link to="/athletes?sort=leaderboard" className="hover:text-accent">Sports Leaderboard</Link></li>
              </ul>
            </div>

            {/* Col 3: Portals */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary">Portals</h5>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><Link to="/register/athlete" className="hover:text-accent">Athlete Registration</Link></li>
                <li><Link to="/register/sponsor" className="hover:text-accent">Sponsor Partner Portal</Link></li>
                <li><Link to="/login" className="hover:text-accent">Account Login</Link></li>
                <li><Link to="/about" className="hover:text-accent">Safeguarding & Minor Protections</Link></li>
              </ul>
            </div>

            {/* Col 4: Platform Security */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary">Security & Trust</h5>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2 text-text-primary">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Verified Credentials</span>
                </div>
                <p className="text-text-muted">
                  All achievements and certificates are audited. Official agreements are backed by legal contracts.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
            <p>© {new Date().getFullYear()} SPORTSPOT Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/about" className="hover:text-text-secondary">Terms of Service</Link>
              <Link to="/about" className="hover:text-text-secondary">Privacy & Safeguarding</Link>
              <Link to="/about" className="hover:text-text-secondary">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
