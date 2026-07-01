-- 0010_match_embeddings.sql
-- Stored procedure for pgvector similarity match (PRD Vol 8/10).

create or replace function public.match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_owner_type text
)
returns table (
  id uuid,
  owner_id uuid,
  similarity float
)
language plpgsql stable security definer set search_path = public as $$
begin
  return query
  select
    embeddings.id,
    embeddings.owner_id,
    (1 - (embeddings.embedding <=> query_embedding))::float as similarity
  from public.embeddings
  where embeddings.owner_type = filter_owner_type
    and (1 - (embeddings.embedding <=> query_embedding)) > match_threshold
  order by embeddings.embedding <=> query_embedding asc
  limit match_count;
end;
$$;

revoke all on function public.match_embeddings(vector(1536), float, int, text) from public;
grant execute on function public.match_embeddings(vector(1536), float, int, text) to service_role;
grant execute on function public.match_embeddings(vector(1536), float, int, text) to authenticated;
grant execute on function public.match_embeddings(vector(1536), float, int, text) to anon;
