-- Saved jobs queue: roles to apply to before logging an application
create table if not exists public.saved_jobs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  role                text not null default '',
  company             text not null default '',
  job_desc            text not null default '',
  job_url             text not null default '',
  context_notes       text not null default '',
  notes               text not null default '',
  tailored_version_id uuid references public.resume_versions(id) on delete set null,
  cover_text          text not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists saved_jobs_user_idx
  on public.saved_jobs(user_id, updated_at desc);

drop trigger if exists trg_saved_jobs_touch on public.saved_jobs;
create trigger trg_saved_jobs_touch
  before update on public.saved_jobs
  for each row execute function public.touch_updated_at();

alter table public.saved_jobs enable row level security;

drop policy if exists "saved_jobs owner" on public.saved_jobs;
create policy "saved_jobs owner" on public.saved_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
