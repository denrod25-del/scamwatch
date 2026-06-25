import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import VerdictCard from '@/components/ui/VerdictCard';

describe('VerdictCard', () => {
  it('shows the verdict label and a verify-with-official-sources disclaimer', () => {
    render(
      <VerdictCard verdict="Likely Scam" confidence={0.8} subject="example.com">
        Calibrated context for the reader.
      </VerdictCard>,
    );
    expect(screen.getByText('Likely Scam')).toBeInTheDocument();
    expect(screen.getByText(/verify with official organizations/i)).toBeInTheDocument();
  });

  it('renders explanation/context BEFORE the verdict (explain-before-warning, DS-7.1.1)', () => {
    const { container } = render(
      <VerdictCard verdict="Likely Scam" confidence={0.8} subject="x">
        CONTEXT_MARKER
      </VerdictCard>,
    );
    const text = container.textContent ?? '';
    expect(text.indexOf('CONTEXT_MARKER')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('CONTEXT_MARKER')).toBeLessThan(text.indexOf('Likely Scam'));
  });
});
