import React from 'react';
import { cn } from '../../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  glow = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-background-secondary rounded-xl border border-border-subtle p-5 transition-all duration-200',
        hoverable && 'hover:border-border-active hover:bg-[#131F35] hover:-translate-y-0.5',
        glow && 'hover:border-accent/40 hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
