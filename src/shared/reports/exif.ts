/**
 * Minimal, dependency-free JPEG metadata stripper (Vol 14 — de-identify uploaded
 * evidence). Removes APP1 segments (EXIF — incl. GPS — and XMP) while preserving
 * image data and other segments (e.g. APP0/JFIF). Pure + unit-tested.
 *
 * Scope: JPEG only. PNG/WebP metadata and full re-encode are a future step (would
 * use `sharp`); the worker leaves non-JPEG bytes untouched.
 */

export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export function stripJpegExif(bytes: Uint8Array): Uint8Array {
  if (!isJpeg(bytes)) return bytes;

  const out: number[] = [0xff, 0xd8]; // SOI
  let i = 2;

  while (i + 1 < bytes.length) {
    if ((bytes[i] ?? 0) !== 0xff) {
      // Not a marker boundary — copy the remainder (entropy-coded data).
      for (let k = i; k < bytes.length; k++) out.push(bytes[k] ?? 0);
      break;
    }
    const marker = bytes[i + 1] ?? 0;

    // Start of Scan: image data follows to EOI — copy everything from here.
    if (marker === 0xda) {
      for (let k = i; k < bytes.length; k++) out.push(bytes[k] ?? 0);
      break;
    }
    // End of Image.
    if (marker === 0xd9) {
      out.push(0xff, 0xd9);
      break;
    }
    // Standalone markers (no length payload): RSTn / TEM.
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      out.push(0xff, marker);
      i += 2;
      continue;
    }

    if (i + 3 >= bytes.length) {
      for (let k = i; k < bytes.length; k++) out.push(bytes[k] ?? 0);
      break;
    }
    const len = ((bytes[i + 2] ?? 0) << 8) + (bytes[i + 3] ?? 0); // includes the 2 length bytes
    const segEnd = i + 2 + len;
    if (segEnd > bytes.length) {
      for (let k = i; k < bytes.length; k++) out.push(bytes[k] ?? 0);
      break;
    }

    if (marker !== 0xe1) {
      // Keep everything except APP1 (EXIF/XMP).
      for (let k = i; k < segEnd; k++) out.push(bytes[k] ?? 0);
    }
    i = segEnd;
  }

  return Uint8Array.from(out);
}
