import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils';

export interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 'md',
  text,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-accent', sizes[size])} />
      {text && <p className="text-xs font-medium text-text-secondary animate-pulse">{text}</p>}
    </div>
  );
};
