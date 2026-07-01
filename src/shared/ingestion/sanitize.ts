/**
 * Input Ingestion Sanitization and OCR block sorting (PRD-301.1).
 */

const CYRILLIC_HOMOGLYPHS: Record<string, string> = {
  // Lowercase
  'а': 'a', // U+0430 -> U+0061
  'е': 'e', // U+0435 -> U+0065
  'о': 'o', // U+043E -> U+006F
  'р': 'p', // U+0440 -> U+0070
  'с': 'c', // U+0441 -> U+0063
  'у': 'y', // U+0443 -> U+0079
  'х': 'x', // U+0445 -> U+0078
  'і': 'i', // U+0456 -> U+0069
  'ѕ': 's', // U+0455 -> U+0073
  // Uppercase
  'А': 'A', // U+0410 -> U+0041
  'В': 'B', // U+0412 -> U+0042
  'Е': 'E', // U+0415 -> U+0045
  'К': 'K', // U+041A -> U+004B
  'М': 'M', // U+041C -> U+004D
  'Н': 'H', // U+041D -> U+0048
  'О': 'O', // U+041E -> U+004F
  'Р': 'P', // U+0420 -> U+0050
  'С': 'C', // U+0421 -> U+0043
  'Т': 'T', // U+0422 -> U+0054
  'Х': 'X', // U+0425 -> U+0058
  'Ү': 'Y', // U+04AE -> U+0059
};

export interface NormalizationResult {
  normalized: string;
  containsConfusables: boolean;
}

/**
 * NFC normalizes the input text and scans for/replaces Cyrillic homoglyphs
 * commonly used in lookalike brand names/domains.
 */
export function normalizeUnicode(text: string): NormalizationResult {
  if (!text) return { normalized: '', containsConfusables: false };

  // 1) Apply Normalization Form Canonical Composition (NFC)
  const normalized = text.normalize('NFC');
  let containsConfusables = false;

  // 2) Scan and replace homoglyphs
  let result = '';
  for (const char of normalized) {
    if (char in CYRILLIC_HOMOGLYPHS) {
      result += CYRILLIC_HOMOGLYPHS[char];
      containsConfusables = true;
    } else {
      result += char;
    }
  }

  return {
    normalized: result,
    containsConfusables,
  };
}

export interface OcrBlock {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Sorts extracted OCR text blocks into logical reading order.
 * Group blocks into horizontal rows (overlapping y coordinates) and sorts them left-to-right.
 */
export function sortOcrBlocks(blocks: OcrBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  // Copy blocks to avoid side-effects
  const items = [...blocks];

  // Group blocks by horizontal rows (zones)
  // Two blocks share a row if their vertical projection overlap is >= 50% of the height of either block.
  const rows: OcrBlock[][] = [];

  // Sort items primarily by top y-coordinate
  items.sort((a, b) => a.y - b.y);

  for (const item of items) {
    let placed = false;
    for (const row of rows) {
      // Compare with the average y or first item of the row to find row overlap
      const rowItem = row[0];
      const minVal = Math.max(item.y, rowItem.y);
      const maxVal = Math.min(item.y + item.h, rowItem.y + rowItem.h);
      const overlap = maxVal - minVal;

      if (overlap > 0) {
        const minHeight = Math.min(item.h, rowItem.h);
        if (overlap >= minHeight * 0.5) {
          row.push(item);
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      rows.push([item]);
    }
  }

  // Sort rows from top to bottom
  rows.sort((a, b) => {
    const avgA = a.reduce((sum, item) => sum + item.y, 0) / a.length;
    const avgB = b.reduce((sum, item) => sum + item.y, 0) / b.length;
    return avgA - avgB;
  });

  // Sort blocks within each row from left to right
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
  }

  // Reconstruct reading text
  return rows
    .map((row) => row.map((item) => item.text).join(' '))
    .join('\n');
}
