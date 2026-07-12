-- Saved target-search profiles for Job Discovery (human-in-the-loop; no LinkedIn scraping)
create table if not exists public.job_search_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default '',
  criteria    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists job_search_profiles_user_idx
  on public.job_search_profiles(user_id, updated_at desc);

drop trigger if exists trg_job_search_profiles_touch on public.job_search_profiles;
create trigger trg_job_search_profiles_touch
  before update on public.job_search_profiles
  for each row execute function public.touch_updated_at();

alter table public.job_search_profiles enable row level security;

drop policy if exists "job_search_profiles owner" on public.job_search_profiles;
create policy "job_search_profiles owner" on public.job_search_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
