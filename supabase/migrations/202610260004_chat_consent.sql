alter table public.site_chat_sessions
  add column if not exists consent_version text,
  add column if not exists consent_at timestamptz;

comment on column public.site_chat_sessions.consent_version is 'Privacy consent text version accepted before chatting.';
comment on column public.site_chat_sessions.consent_at is 'Time the visitor accepted chatbot data collection.';
