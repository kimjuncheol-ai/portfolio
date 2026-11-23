
create schema if not exists private;

create table private.site_chat_rate_windows (
  bucket text primary key,
  window_started_at timestamptz not null,
  requests integer not null check (requests > 0)
);

alter table private.site_chat_rate_windows enable row level security;
revoke all on private.site_chat_rate_windows from public, anon, authenticated;
create index site_chat_rate_windows_started_idx
  on private.site_chat_rate_windows (window_started_at);

-- Returns 0 when the question is accepted or the number of seconds to wait.
create function public.site_chat_acquire_slot(p_session text, p_network text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  checked_at timestamptz := clock_timestamp();
  window_start timestamptz;
  bucket_key text;
  max_requests integer;
begin
  if random() < 0.02 then
    delete from private.site_chat_rate_windows
    where bucket in (
      select bucket from private.site_chat_rate_windows
      where window_started_at < checked_at - interval '2 hours'
      order by window_started_at
      limit 500
      for update skip locked
    );
  end if;

  -- Check the session first so repeated requests from that session do not
  -- spend the shared-network allowance once the session is limited.
  foreach bucket_key in array array['session:' || p_session, 'network:' || p_network]
  loop
    max_requests := case when bucket_key like 'session:%' then 12 else 60 end;
    insert into private.site_chat_rate_windows as counters (bucket, window_started_at, requests)
    values (bucket_key, checked_at, 1)
    on conflict (bucket) do update set
      window_started_at = case
        when counters.window_started_at <= checked_at - interval '60 seconds' then checked_at
        else counters.window_started_at
      end,
      requests = case
        when counters.window_started_at <= checked_at - interval '60 seconds' then 1
        else counters.requests + 1
      end
    where counters.window_started_at <= checked_at - interval '60 seconds'
       or counters.requests < max_requests;

    if not found then
      select window_started_at into window_start
      from private.site_chat_rate_windows
      where bucket = bucket_key;
      return greatest(1, ceil(extract(epoch from (window_start + interval '60 seconds' - checked_at)))::integer);
    end if;
  end loop;

  return 0;
end;
$$;

revoke all on function public.site_chat_acquire_slot(text, text) from public, anon, authenticated;
grant execute on function public.site_chat_acquire_slot(text, text) to service_role;

