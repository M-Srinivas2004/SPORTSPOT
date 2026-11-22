import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <Card hoverable className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {title}
          </p>
          <h4 className="text-2xl font-black text-text-primary mt-1 font-display tracking-tight">
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-semibold mt-2',
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <div className="p-3 bg-background-elevated rounded-xl text-accent border border-border-subtle">
          {icon}
        </div>
      </div>
    </Card>
  );
};
