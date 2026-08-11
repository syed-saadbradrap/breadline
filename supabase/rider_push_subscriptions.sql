-- Run once in Supabase SQL Editor (for rider mobile push notifications)
create table if not exists public.rider_push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rider_push_subscriptions enable row level security;
