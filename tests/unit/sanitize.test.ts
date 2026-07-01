import { describe, it, expect } from 'vitest';
import { normalizeUnicode, sortOcrBlocks } from '@/shared/ingestion/sanitize';

describe('Ingestion Sanitization', () => {
  describe('normalizeUnicode', () => {
    it('applies NFC Unicode normalization', () => {
      // Decomposed character 'e' (U+0065) + 'combining diaeresis' (U+0308)
      const input = 'e\u0308';
      const result = normalizeUnicode(input);

      // NFC normalizes it to 'ë' (U+00EB)
      expect(result.normalized).toBe('\u00EB');
      expect(result.containsConfusables).toBe(false);
    });

    it('detects and converts Cyrillic homoglyphs in Latin words', () => {
      // 'goоgle.com' where 'о' is Cyrillic U+043E
      const input = 'go\u043Egle.com';
      const result = normalizeUnicode(input);

      expect(result.normalized).toBe('google.com');
      expect(result.containsConfusables).toBe(true);
    });

    it('returns containsConfusables = false for clean Latin text', () => {
      const input = 'chase-security-update.com';
      const result = normalizeUnicode(input);

      expect(result.normalized).toBe(input);
      expect(result.containsConfusables).toBe(false);
    });
  });

  describe('sortOcrBlocks', () => {
    it('sorts blocks top-to-bottom and left-to-right', () => {
      const blocks = [
        { text: 'World!', x: 100, y: 10, w: 50, h: 20 },
        { text: 'Hello', x: 10, y: 10, w: 50, h: 20 },
        { text: 'Step 2', x: 10, y: 50, w: 50, h: 20 },
      ];

      const result = sortOcrBlocks(blocks);

      // Hello and World! overlap vertically (y=10, h=20 -> [10, 30])
      // Hello is left (x=10) of World! (x=100) -> Hello World!
      // Step 2 is on the next line (y=50) -> Hello World!\nStep 2
      expect(result).toBe('Hello World!\nStep 2');
    });

    it('returns empty string for empty input', () => {
      expect(sortOcrBlocks([])).toBe('');
    });
  });
});
