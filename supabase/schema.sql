-- AgriTrack AI — Supabase schema
-- Run this in the Supabase SQL editor to create the farms table.
-- The app works without it (in-memory fallback), but this enables persistence.

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  farm_name text not null,
  crop text not null,
  state text not null,
  planting_date date,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) and allow anonymous inserts/reads for the MVP demo.
alter table public.farms enable row level security;

create policy "Allow anonymous read" on public.farms
  for select using (true);

create policy "Allow anonymous insert" on public.farms
  for insert with check (true);

create policy "Allow anonymous delete" on public.farms
  for delete using (true);