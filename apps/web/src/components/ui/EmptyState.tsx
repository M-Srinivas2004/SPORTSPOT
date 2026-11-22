import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border-subtle bg-background-secondary/40 my-4">
      {icon && <div className="p-3 bg-background-elevated rounded-xl text-accent mb-3">{icon}</div>}
      <h4 className="text-base font-semibold text-text-primary">{title}</h4>
      <p className="text-xs text-text-secondary max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
