import { describe, it, expect } from 'vitest';

import { extractEntities } from '@/shared/entities/extractEntities';

describe('extractEntities', () => {
  it('pulls phones, urls/domains, emails, and wallets from free text', () => {
    const text =
      'They texted from +1 (561) 555-0142 and emailed help@paypa1-secure.com, ' +
      'link https://paypa1-secure.com/login, send to 0x52908400098527886E0F7030069857D2E4169EE7';
    const found = extractEntities(text);
    const byType = (t: string) => found.filter((e) => e.type === t).map((e) => e.value);

    expect(byType('phone')).toContain('+15615550142');
    expect(byType('email')).toContain('help@paypa1-secure.com');
    expect(byType('url')).toContain('paypa1-secure.com/login');
    expect(byType('wallet')).toContain('0x52908400098527886e0f7030069857d2e4169ee7');
  });

  it('does not turn an email’s @-domain into a handle', () => {
    const found = extractEntities('contact me at scammer@evil.example');
    expect(found.some((e) => e.type === 'handle')).toBe(false);
    expect(found.some((e) => e.type === 'email' && e.value === 'scammer@evil.example')).toBe(true);
  });

  it('returns nothing for text with no entities', () => {
    expect(extractEntities('is this a scam, I am not sure')).toEqual([]);
    expect(extractEntities('')).toEqual([]);
  });
});
