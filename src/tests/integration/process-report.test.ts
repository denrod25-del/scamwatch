import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { submitReport } from '@/shared/reports/submit';
import { processReport } from '@/shared/reports/processReport';
import { canonicalizeEntity } from '@/shared/entities/canonicalize';

const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const liveDb = Boolean(url && serviceKey);

const BUCKET = 'report-media';
const JPEG_WITH_EXIF = Uint8Array.from([
  0xff, 0xd8, 0xff, 0xe1, 0x00, 0x0a, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xaa, 0xbb, 0xff, 0xe0,
  0x00, 0x09, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xcc, 0xdd, 0xff, 0xda, 0x00, 0x03, 0x01, 0x11, 0x22,
  0xff, 0xd9,
]);

function hasExif(bytes: Uint8Array): boolean {
  const needle = [0x45, 0x78, 0x69, 0x66];
  outer: for (let i = 0; i + needle.length <= bytes.length; i++) {
    for (let j = 0; j < needle.length; j++) if (bytes[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

describe.skipIf(!liveDb)('report processing worker against local Supabase', () => {
  let sb: SupabaseClient;
  const reports: string[] = [];
  const storagePaths: string[] = [];
  const suffix = String(Date.now());
  const phone = `+1555${suffix.slice(-7)}`;
  const domain = `itest${suffix}.example`;
  const canonValues = [phone, domain]
    .map((v) => canonicalizeEntity(v)?.value)
    .filter((v): v is string => Boolean(v));

  beforeAll(() => {
    sb = createClient(url as string, serviceKey as string, { auth: { persistSession: false } });
  });

  afterAll(async () => {
    for (const id of reports) {
      await sb.from('scores').delete().eq('subject_id', id);
      await sb.from('reports').delete().eq('id', id);
    }
    for (const v of canonValues) await sb.from('entities').delete().eq('value_canonical', v);
    if (storagePaths.length) await sb.storage.from(BUCKET).remove(storagePaths);
  });

  it('extracts entities from the narrative, classifies, and moves to pending_review', async () => {
    const submitted = await submitReport(
      {
        channel: 'sms',
        narrative: `They texted me from ${phone} with a link to ${domain} asking for money.`,
        reporterId: null,
      },
      { getClient: async () => sb },
    );
    reports.push(submitted.id);
    expect(submitted.entityCount).toBe(0); // no indicators provided — extraction is the source

    const result = await processReport(sb, submitted.id);
    expect(result).not.toBeNull();
    expect(result?.status).toBe('pending_review');
    expect(result?.entitiesAdded).toBeGreaterThanOrEqual(2);

    const { data: row } = await sb
      .from('reports')
      .select('status, processed_at')
      .eq('id', submitted.id)
      .single();
    expect(row?.status).toBe('pending_review');
    expect(row?.processed_at).not.toBeNull();

    const { count: links } = await sb
      .from('report_entities')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', submitted.id);
    expect(links ?? 0).toBeGreaterThanOrEqual(2);

    const { count: scores } = await sb
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', submitted.id);
    expect(scores ?? 0).toBe(1);
  });

  it('strips EXIF from JPEG evidence and marks media processed', async () => {
    const submitted = await submitReport(
      { channel: 'web', narrative: 'screenshot attached', reporterId: null },
      { getClient: async () => sb },
    );
    reports.push(submitted.id);

    const path = `reports/itest-${suffix}.jpg`;
    storagePaths.push(path);
    const up = await sb.storage
      .from(BUCKET)
      .upload(path, Buffer.from(JPEG_WITH_EXIF), { contentType: 'image/jpeg', upsert: true });
    expect(up.error).toBeNull();
    await sb.from('report_media').insert({ report_id: submitted.id, storage_path: path });

    await processReport(sb, submitted.id);

    const { data: blob } = await sb.storage.from(BUCKET).download(path);
    if (!blob) throw new Error('download returned no blob');
    const cleaned = new Uint8Array(await blob.arrayBuffer());
    expect(hasExif(cleaned)).toBe(false);

    const { data: mediaRow } = await sb
      .from('report_media')
      .select('exif_stripped, scanned')
      .eq('report_id', submitted.id)
      .single();
    expect(mediaRow?.exif_stripped).toBe(true);
    expect(mediaRow?.scanned).toBe(true);
  });
});
