import { describe, it, expect } from 'vitest';

import { detectEntityType, canonicalizeEntity } from '@/shared/entities/canonicalize';

describe('detectEntityType', () => {
  it('classifies common entity shapes', () => {
    expect(detectEntityType('help@paypa1.com')).toBe('email');
    expect(detectEntityType('https://paypa1-secure.com/login')).toBe('url');
    expect(detectEntityType('paypa1-secure.com')).toBe('domain');
    expect(detectEntityType('+1 (561) 555-0142')).toBe('phone');
    expect(detectEntityType('5615550142')).toBe('phone');
    expect(detectEntityType('1.800.555.1234')).toBe('phone');
    expect(detectEntityType('@SupportTeam')).toBe('handle');
    expect(detectEntityType('0x52908400098527886E0F7030069857D2E4169EE7')).toBe('wallet');
  });

  it('returns null for free text', () => {
    expect(detectEntityType('is this a scam text message')).toBeNull();
    expect(detectEntityType('')).toBeNull();
  });
});

describe('canonicalizeEntity', () => {
  it('normalizes recognized entities', () => {
    expect(canonicalizeEntity('HELP@Example.COM')).toEqual({
      type: 'email',
      value: 'help@example.com',
    });
    expect(canonicalizeEntity('5615550142')).toEqual({ type: 'phone', value: '+15615550142' });
    expect(canonicalizeEntity('https://WWW.Example.com/Path/')).toEqual({
      type: 'url',
      value: 'example.com/path',
    });
    expect(canonicalizeEntity('Example.com')).toEqual({ type: 'domain', value: 'example.com' });
  });

  it('returns null for free text', () => {
    expect(canonicalizeEntity('not an entity, just words')).toBeNull();
  });
});
