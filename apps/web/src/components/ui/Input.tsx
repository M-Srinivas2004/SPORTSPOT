import React from 'react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-background-elevated/70 border border-border-subtle px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-150',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/50',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
