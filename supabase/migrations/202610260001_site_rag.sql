create extension if not exists vector with schema extensions;

create table if not exists public.site_documents (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  source_url text not null,
  page_title text not null,
  section text not null default 'body',
  content text not null check (char_length(content) between 20 and 4000),
  checksum text not null,
  embedding extensions.vector(384) not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_path, checksum)
);

create index if not exists site_documents_embedding_hnsw
  on public.site_documents using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists site_documents_page_path_idx
  on public.site_documents (page_path);

create table if not exists public.site_chat_sessions (
  id uuid primary key,
  entry_page text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.site_chat_messages (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.site_chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_documents enable row level security;
alter table public.site_chat_sessions enable row level security;
alter table public.site_chat_messages enable row level security;
alter table public.site_admins enable row level security;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.site_admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

drop policy if exists "admins read site documents" on public.site_documents;
create policy "admins read site documents"
  on public.site_documents for select to authenticated
  using ((select public.is_site_admin()));

drop policy if exists "admins update site documents" on public.site_documents;
create policy "admins update site documents"
  on public.site_documents for update to authenticated
  using ((select public.is_site_admin()))
  with check ((select public.is_site_admin()));

drop policy if exists "admins read admin membership" on public.site_admins;
create policy "admins read admin membership"
  on public.site_admins for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "admins read chat sessions" on public.site_chat_sessions;
create policy "admins read chat sessions"
  on public.site_chat_sessions for select to authenticated
  using ((select public.is_site_admin()));

drop policy if exists "admins read chat messages" on public.site_chat_messages;
create policy "admins read chat messages"
  on public.site_chat_messages for select to authenticated
  using ((select public.is_site_admin()));

revoke all on public.site_documents from anon;
revoke all on public.site_chat_sessions from anon;
revoke all on public.site_chat_messages from anon;
revoke all on public.site_admins from anon;
grant select, update on public.site_documents to authenticated;
grant select on public.site_chat_sessions, public.site_chat_messages, public.site_admins to authenticated;
grant all on public.site_documents, public.site_chat_sessions, public.site_chat_messages, public.site_admins to service_role;

create or replace function public.match_site_documents(
  query_embedding extensions.vector(384),
  match_threshold float default 0.55,
  match_count int default 6
)
returns table (
  id uuid,
  page_path text,
  source_url text,
  page_title text,
  section text,
  content text,
  similarity float
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    d.id,
    d.page_path,
    d.source_url,
    d.page_title,
    d.section,
    d.content,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.site_documents d
  where d.active = true
    and 1 - (d.embedding <=> query_embedding) >= match_threshold
  order by d.embedding <=> query_embedding
  limit least(match_count, 12);
$$;

revoke all on function public.match_site_documents(extensions.vector, float, int) from public, anon, authenticated;
grant execute on function public.match_site_documents(extensions.vector, float, int) to service_role;

comment on table public.site_documents is 'Chunks collected only from the approved portfolio pages.';
comment on function public.match_site_documents is 'Server-only semantic retrieval for the portfolio RAG assistant.';
