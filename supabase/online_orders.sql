-- Run once in Supabase SQL Editor
create table if not exists public.online_orders (
  id uuid primary key,
  order_number text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  payload jsonb not null,
  pos_order_number text,
  pos_order_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists online_orders_status_idx on public.online_orders (status);
create index if not exists online_orders_created_idx on public.online_orders (created_at desc);

alter table public.online_orders enable row level security;
