import { describe, it, expect } from 'vitest';

import { isJpeg, stripJpegExif } from '@/lib/reports/exif';

function contains(hay: Uint8Array, needle: number[]): boolean {
  outer: for (let i = 0; i + needle.length <= hay.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

const EXIF = [0x45, 0x78, 0x69, 0x66]; // "Exif"
const JFIF = [0x4a, 0x46, 0x49, 0x46]; // "JFIF"

// SOI | APP1(Exif) | APP0(JFIF) | SOS + scan | EOI
const JPEG = Uint8Array.from([
  0xff, 0xd8, 0xff, 0xe1, 0x00, 0x0a, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xaa, 0xbb, 0xff, 0xe0,
  0x00, 0x09, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xcc, 0xdd, 0xff, 0xda, 0x00, 0x03, 0x01, 0x11, 0x22,
  0xff, 0xd9,
]);

describe('isJpeg', () => {
  it('detects JPEG and rejects PNG', () => {
    expect(isJpeg(JPEG)).toBe(true);
    expect(isJpeg(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
  });
});

describe('stripJpegExif', () => {
  it('removes the EXIF (APP1) segment, keeps JFIF (APP0) and image data', () => {
    expect(contains(JPEG, EXIF)).toBe(true);

    const out = stripJpegExif(JPEG);

    expect(contains(out, EXIF)).toBe(false);
    expect(contains(out, JFIF)).toBe(true);
    expect(contains(out, [0x11, 0x22])).toBe(true); // scan data preserved
    expect(isJpeg(out)).toBe(true);
    expect(out.length).toBeLessThan(JPEG.length);
    expect(out[out.length - 2]).toBe(0xff);
    expect(out[out.length - 1]).toBe(0xd9); // EOI preserved
  });

  it('leaves non-JPEG bytes untouched', () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    expect(stripJpegExif(png)).toEqual(png);
  });
});
