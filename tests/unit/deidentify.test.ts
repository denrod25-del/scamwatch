import { describe, it, expect } from 'vitest';

import { redactPII } from '@/lib/reports/deidentify';

describe('redactPII', () => {
  it('redacts Social Security numbers', () => {
    const { text, redactions } = redactPII('my ssn is 123-45-6789, please help');
    expect(text).not.toContain('123-45-6789');
    expect(text).toContain('[redacted-ssn]');
    expect(redactions).toBe(1);
  });

  it('redacts valid (Luhn) payment-card numbers but leaves invalid digit runs', () => {
    const valid = redactPII('they charged my card 4242 4242 4242 4242 twice');
    expect(valid.text).toContain('[redacted-card]');
    expect(valid.text).not.toContain('4242 4242 4242 4242');

    const invalid = redactPII('order number 1111 1111 1111 1111 shipped');
    expect(invalid.text).toContain('1111 1111 1111 1111'); // fails Luhn → kept
    expect(invalid.redactions).toBe(0);
  });

  it('leaves scam indicators (URLs, phone numbers) intact', () => {
    const { text } = redactPII('texted from +1 561 555 0142 with link paypa1-secure.com');
    expect(text).toContain('paypa1-secure.com');
    expect(text).toContain('+1 561 555 0142');
  });
});
