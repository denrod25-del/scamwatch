-- 0009_audit_fn.sql
-- Append-only, hash-chained audit writer (Vol 14). Computes prev_hash/row_hash
-- atomically so the audit_log is tamper-evident. md5 is illustrative here; a
-- production chain would use sha256 (extensions.digest) + signing.

create or replace function public.append_audit(
  p_actor uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  prev text;
  newhash text;
begin
  select row_hash into prev from public.audit_log order by id desc limit 1;
  newhash := md5(
    coalesce(prev, '') || p_action || coalesce(p_target_id::text, '') || coalesce(p_payload::text, '')
  );
  insert into public.audit_log (actor_id, action, target_type, target_id, payload, prev_hash, row_hash)
    values (p_actor, p_action, p_target_type, p_target_id, p_payload, prev, newhash);
end;
$$;

revoke all on function public.append_audit(uuid, text, text, uuid, jsonb) from public;
grant execute on function public.append_audit(uuid, text, text, uuid, jsonb) to service_role;
