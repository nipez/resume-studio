-- Admin "demo users" registry: lightweight personas an admin creates to walk
-- through the product as a new user. Each row links a real auth user (the demo
-- persona) to the admin who created it.
create table if not exists public.demo_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_by  uuid not null references auth.users(id) on delete cascade,
  email       text,
  label       text not null default 'Demo user',
  created_at  timestamptz not null default now()
);

create index if not exists demo_users_created_by_idx
  on public.demo_users(created_by);

alter table public.demo_users enable row level security;

-- An admin can see/manage only the demo users they created. Server-side admin
-- actions use the service role; this policy guards any direct client access.
drop policy if exists "demo_users owner" on public.demo_users;
create policy "demo_users owner" on public.demo_users
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
