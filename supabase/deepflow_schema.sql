-- DeepFlow MVP Supabase schema
-- Run this in Supabase Dashboard > SQL Editor.

create table if not exists public.deepflow_sync_events (
  id bigint generated always as identity primary key,
  sync_id text not null unique,
  client_id text not null,
  profile_id text,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  app_version text not null default 'deepflow-mvp-v1',
  created_at timestamptz not null default now()
);

create index if not exists deepflow_sync_events_client_id_idx
  on public.deepflow_sync_events (client_id);

create index if not exists deepflow_sync_events_profile_id_idx
  on public.deepflow_sync_events (profile_id);

create index if not exists deepflow_sync_events_event_type_idx
  on public.deepflow_sync_events (event_type);

create index if not exists deepflow_sync_events_created_at_idx
  on public.deepflow_sync_events (created_at desc);

alter table public.deepflow_sync_events enable row level security;

drop policy if exists "DeepFlow clients can insert sync events"
  on public.deepflow_sync_events;

create policy "DeepFlow clients can insert sync events"
  on public.deepflow_sync_events
  for insert
  to anon, authenticated
  with check (true);

-- No public SELECT policy is created on purpose.
-- Browse data as the project owner in Supabase Dashboard > Table Editor.
