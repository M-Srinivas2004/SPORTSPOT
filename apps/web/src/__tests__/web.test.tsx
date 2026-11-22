import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatExperience, getDaysRemaining } from '../utils';

describe('SPORTSPOT Frontend Utility & Logic Tests', () => {
  describe('Formatters', () => {
    it('formatCurrency should properly format USD amounts', () => {
      const formatted = formatCurrency(25000, 'USD');
      expect(formatted).toContain('25,000');
      expect(formatted).toContain('$');
    });

    it('formatDate should format standard ISO strings', () => {
      const formatted = formatDate('2026-06-15T00:00:00.000Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Jun');
    });

    it('formatExperience should translate experience level enums to user-friendly titles', () => {
      expect(formatExperience('INTERNATIONAL_PRO')).toBe('International Pro');
      expect(formatExperience('NATIONAL_LEVEL')).toBe('National Tier');
      expect(formatExperience('STATE_LEVEL')).toBe('State Champion / Semi-Pro');
      expect(formatExperience('INTERMEDIATE')).toBe('Collegiate / Intermediate');
      expect(formatExperience('BEGINNER')).toBe('Rising Talent / Junior');
    });

    it('getDaysRemaining should compute positive days for future dates', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const days = getDaysRemaining(futureDate);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('getDaysRemaining should return 0 for expired deadlines', () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(getDaysRemaining(pastDate)).toBe(0);
    });
  });
});
