import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, HeartHandshake, Award, Lock, Mail, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="accent" size="sm">OUR MISSION</Badge>
        <h1 className="text-3xl sm:text-5xl font-black font-display text-text-primary tracking-tight">
          About SPORTSPOT
        </h1>
        <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
          "YOUR TALENT. THEIR SUPPORT. ONE BIG GAME."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3 text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Merit-Driven Access</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Eliminating back-room agency gatekeeping. Giving athletes of all tiers an open, verifiable stage to attract corporate funding.
          </p>
        </Card>

        <Card className="space-y-3 text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Youth Safeguarding</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Strict guardian consent, verified age-gating, and monitored communication to safeguard aspiring youth and collegiate athletes.
          </p>
        </Card>

        <Card className="space-y-3 text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Contract Integrity</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Structured sponsorship agreements with transparent milestone deliverables, legal terms, and verifiable financial disbursements.
          </p>
        </Card>
      </div>

      {/* Safeguarding Policy Section (Requirement from Section 9 & 10) */}
      <Card className="p-8 space-y-4 border-accent/20 bg-background-secondary">
        <h2 className="text-xl font-black font-display text-text-primary uppercase tracking-wide flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-accent" /> Youth Protection & Safeguarding Policy
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          SPORTSPOT adheres strictly to international child safeguarding regulations in athletic training and endorsements:
        </p>
        <ul className="space-y-2 text-xs text-text-secondary list-disc pl-5 leading-relaxed">
          <li>Athletes under 18 years of age must submit formal legal guardian verification before enabling unrestricted direct messaging.</li>
          <li>All financial agreements involving minors require co-signatory legal guardian authorization.</li>
          <li>Communications between adult sponsors and minor athletes are subject to automated compliance auditing and moderation.</li>
          <li>Zero tolerance for predatory endorsement clauses or abusive performance prerequisites.</li>
        </ul>
      </Card>

      {/* Contact Section */}
      <div className="text-center pt-8 border-t border-border-subtle space-y-3">
        <h3 className="text-lg font-bold text-text-primary">Need Platform Assistance?</h3>
        <p className="text-xs text-text-secondary">Reach our engineering and athlete moderation team directly.</p>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-text-muted pt-2">
          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-accent" /> support@sportspot.io</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" /> SPORTSPOT Headquarters • Austin, TX</span>
        </div>
      </div>
    </div>
  );
};
