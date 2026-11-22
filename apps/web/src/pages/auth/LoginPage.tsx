import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await login({ email, password });
      if (loggedUser.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else if (loggedUser.role === 'SPONSOR') {
        navigate('/dashboard/sponsor');
      } else {
        navigate('/dashboard/athlete');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SportSpot2026!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-display text-text-primary">Sign in to SPORTSPOT</h2>
        <p className="text-xs text-text-secondary mt-1">Access your athlete or sponsor dashboard</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="name@athlete.sportspot.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[11px] text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-bold shadow-glow"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Fill Buttons (For reviewer convenience) */}
      <div className="pt-4 border-t border-border-subtle space-y-2">
        <span className="text-[10px] uppercase font-bold text-text-muted block text-center">
          <Sparkles className="w-3 h-3 inline mr-1 text-accent" /> One-Click Seed Demo Accounts
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillQuickDemo('marcus.vance@athlete.sportspot.io')}
            className="p-2 rounded-lg bg-background-elevated border border-border-subtle hover:border-accent text-[11px] text-text-secondary hover:text-text-primary font-medium text-center"
          >
            Athlete
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('partnerships@apexnutrition.com')}
            className="p-2 rounded-lg bg-background-elevated border border-border-subtle hover:border-accent text-[11px] text-text-secondary hover:text-text-primary font-medium text-center"
          >
            Sponsor
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('admin@sportspot.io')}
            className="p-2 rounded-lg bg-background-elevated border border-border-subtle hover:border-accent text-[11px] text-text-secondary hover:text-text-primary font-medium text-center"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="pt-2 text-center text-xs text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register/athlete" className="text-accent font-bold hover:underline">
          Join as Athlete
        </Link>{' '}
        or{' '}
        <Link to="/register/sponsor" className="text-accent font-bold hover:underline">
          Join as Sponsor
        </Link>
      </div>
    </div>
  );
};
