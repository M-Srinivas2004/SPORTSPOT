import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getDaysRemaining(deadlineString: string): number {
  const deadline = new Date(deadlineString).getTime();
  const now = new Date().getTime();
  const diffTime = deadline - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function formatExperience(level: string): string {
  switch (level) {
    case 'INTERNATIONAL_PRO':
      return 'International Pro';
    case 'NATIONAL_LEVEL':
      return 'National Tier';
    case 'STATE_LEVEL':
      return 'State Champion / Semi-Pro';
    case 'INTERMEDIATE':
      return 'Collegiate / Intermediate';
    case 'BEGINNER':
      return 'Rising Talent / Junior';
    default:
      return level.replace('_', ' ');
  }
}
