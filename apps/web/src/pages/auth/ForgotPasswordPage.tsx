import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post<any>('/auth/forgot-password', { email });
      setMessage(res.message || 'Password reset request processed.');
    } catch (err: any) {
      setMessage(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-display text-text-primary">Reset Your Password</h2>
        <p className="text-xs text-text-secondary mt-1">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {message ? (
        <div className="p-4 rounded-xl bg-background-elevated border border-border-subtle text-xs space-y-3">
          <div className="flex items-center gap-2 text-accent font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Request Processed</span>
          </div>
          <p className="text-text-secondary leading-relaxed">{message}</p>
          <Link to="/login" className="inline-block pt-2">
            <Button size="sm" variant="outline">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold shadow-glow"
            isLoading={loading}
          >
            Send Reset Instructions
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      </div>
    </div>
  );
};
