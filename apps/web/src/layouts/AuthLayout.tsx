import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-accent text-background-primary flex items-center justify-center font-black text-2xl group-hover:shadow-glow transition-all">
            <Zap className="w-7 h-7 fill-current stroke-[2.5]" />
          </div>
          <span className="text-3xl font-black tracking-wider font-display text-text-primary">
            SPORT<span className="text-accent">SPOT</span>
          </span>
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-text-muted">
          "YOUR TALENT. THEIR SUPPORT. ONE BIG GAME."
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        <div className="bg-background-secondary border border-border-subtle py-8 px-6 sm:px-10 rounded-2xl shadow-2xl relative">
          <Outlet />
        </div>

        {/* Security Assurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Secured with Argon2id & HTTP-only encrypted sessions</span>
        </div>
      </div>
    </div>
  );
};
