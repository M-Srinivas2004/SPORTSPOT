import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../../types';
import api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils';
import { ShieldAlert, Terminal } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await api.get<AuditLog[]>('/admin/audit-logs');
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner text="Querying security audit logs..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary">
          System Activity & Security Audit Trail
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Tamper-evident logs of administrative actions, moderation events, agreements, and security changes.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-background-elevated/40 text-[10px] uppercase font-bold text-text-muted">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-background-elevated/20 transition-colors">
                  <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="accent" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-bold">{log.resource}</td>
                  <td className="py-3 px-4 text-text-primary">
                    {log.user?.email || 'System / Anonymous'}
                  </td>
                  <td className="py-3 px-4 text-text-muted truncate max-w-xs font-sans text-xs">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
