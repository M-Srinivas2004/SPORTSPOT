import React, { useState, useEffect } from 'react';
import { SponsorshipAgreement } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils';
import { ShieldCheck, Download, FileText, Calendar, Building } from 'lucide-react';

export const AthleteAgreementsPage: React.FC = () => {
  const [agreements, setAgreements] = useState<SponsorshipAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgreements() {
      try {
        setLoading(true);
        // Load via my-applications enriched with agreements
        const res = await api.get<any[]>('/applications/my-applications');
        if (res.success && res.data) {
          const validAgreements = res.data
            .filter((a) => a.agreement)
            .map((a) => ({
              ...a.agreement,
              campaign: a.campaign,
              sponsor: a.campaign?.sponsor,
            }));
          setAgreements(validAgreements);
        }
      } catch (err) {
        console.error('Failed to load agreements:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAgreements();
  }, []);

  const handleDownloadPdf = (agreementId: string) => {
    window.open(`/api/agreements/${agreementId}/download`, '_blank');
  };

  if (loading) return <LoadingSpinner text="Loading your agreements..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
          Formal Sponsorship Agreements
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review legal contracts, quarterly disbursement schedules, and download official PDF agreements.
        </p>
      </div>

      {agreements.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <ShieldCheck className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Active Agreements Yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Once a sponsor accepts your application and generates a contract memorandum, it will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {agreements.map((agr) => (
            <Card key={agr.id} className="space-y-4 border-accent/20 bg-background-elevated/20">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{agr.status}</Badge>
                    <span className="text-xs text-text-muted">ID: {agr.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{agr.campaign?.title}</h3>
                  <p className="text-xs text-text-secondary flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-accent" />
                    <span>Sponsor: {agr.sponsor?.companyName}</span>
                    <span>• Generated: {formatDate(agr.createdAt)}</span>
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => handleDownloadPdf(agr.id)}
                >
                  Download PDF Memorandum
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase block">Endowment Amount</span>
                  <span className="text-base font-black text-accent font-display">
                    {formatCurrency(agr.amount, agr.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase block">Contract Duration</span>
                  <span className="text-sm font-bold text-text-primary">{agr.durationMonths} Months</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase block">Status</span>
                  <span className="text-xs font-semibold text-emerald-400">{agr.status}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background-primary/60 border border-border-subtle text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Contract Terms & Deliverables:</span>
                <p className="text-text-secondary leading-relaxed">{agr.terms}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
