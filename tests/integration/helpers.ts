/** Shared integration-test helper: unwrap a Supabase response or throw. */
export function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  if (res.data === null) throw new Error('expected data, received null');
  return res.data;
}
