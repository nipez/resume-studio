-- Resume Studio — initial schema
-- Postgres / Supabase. Run via `supabase db push` or paste into the SQL editor.
-- Every table is per-user and protected by Row Level Security.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type template_style as enum ('classic', 'twocol', 'editorial');
create type application_status as enum ('applied','response','interview','offer','rejected','ghosted','not_applied');
create type event_type as enum ('interview','followup','note');

-- ============================================================
-- profiles  (1:1 with auth.users — replaces the prototype's hardcoded person)
-- ============================================================
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  -- the user's "position me as…" voice/strategy notes, fed as context into every AI prompt
  positioning        text default '',
  default_version_id uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- resume_versions  (prototype: versions[])
-- ============================================================
create table public.resume_versions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null default 'My Resume',
  template_style template_style not null default 'twocol',
  -- { role, company, depth } when this version was produced by tailoring; null otherwise
  tailored_for   jsonb,
  -- ResumeData: { name, headline, phone, email, location, linkedin, summary,
  --   skills: text[], experience: [{company,title,dates,blurb,bullets:text[]}],
  --   education: [{school,degree,year}] }
  data           jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index resume_versions_user_idx on public.resume_versions(user_id, updated_at desc);

-- profiles.default_version_id points at a resume_version (added after the table exists)
alter table public.profiles
  add constraint profiles_default_version_fk
  foreign key (default_version_id) references public.resume_versions(id) on delete set null;

-- ============================================================
-- applications  (prototype: applications[] — first-class records that SNAPSHOT what was sent)
-- ============================================================
create table public.applications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  role                text default '',
  company             text default '',
  job_desc            text default '',
  applied_at          timestamptz not null default now(),
  -- source version (kept for analytics even if that version is later edited/deleted)
  resume_version_id   uuid references public.resume_versions(id) on delete set null,
  resume_version_name text,
  -- IMMUTABLE snapshot of exactly what was sent: { name, template_style, data }
  resume_snapshot     jsonb not null default '{}'::jsonb,
  cover_letter        text default '',          -- snapshot of the cover letter sent
  answers             jsonb not null default '[]'::jsonb,  -- [{ q, a }] Q&A snapshot
  status              application_status not null default 'applied',
  status_history      jsonb not null default '[]'::jsonb,  -- [{ status, at }]
  insight             jsonb,                    -- { fitScore, strengths, gaps, advice }
  prep                jsonb,                    -- { questions, talkingPoints, ask }
  notes               text default '',
  created_at          timestamptz not null default now()
);
create index applications_user_idx on public.applications(user_id, applied_at desc);
create index applications_status_idx on public.applications(user_id, status);

-- ============================================================
-- application_events  (prototype: app.events[] — timeline & reminders)
-- ============================================================
create table public.application_events (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           event_type not null default 'followup',
  title          text default '',
  date           date,
  "time"         text default '',
  notes          text default '',
  done           boolean not null default false,
  created_at     timestamptz not null default now()
);
create index application_events_app_idx on public.application_events(application_id);
create index application_events_due_idx on public.application_events(user_id, date) where done = false;

-- ============================================================
-- guided_drafts  (prototype: state.guided — resumable wizard progress, 1 per user)
-- ============================================================
create table public.guided_drafts (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  step           int not null default 0,
  template_style template_style not null default 'twocol',
  make_default   boolean not null default true,
  -- ResumeData + each experience also carries a `raw` plain-language field
  data           jsonb not null default '{}'::jsonb,
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger trg_profiles_touch        before update on public.profiles        for each row execute function public.touch_updated_at();
create trigger trg_resume_versions_touch before update on public.resume_versions for each row execute function public.touch_updated_at();
create trigger trg_guided_drafts_touch   before update on public.guided_drafts   for each row execute function public.touch_updated_at();

-- ============================================================
-- Auto-create a profile row when a user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security — every table: a user sees ONLY their own rows
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.resume_versions     enable row level security;
alter table public.applications        enable row level security;
alter table public.application_events  enable row level security;
alter table public.guided_drafts       enable row level security;

-- profiles: id IS the user id
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles self write"  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

-- generic user_id-owned tables
create policy "rv all"  on public.resume_versions    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "app all" on public.applications        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ev all"  on public.application_events  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gd all"  on public.guided_drafts       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Storage buckets (create in dashboard or via API):
--   resume-uploads  — user-uploaded PDFs/TXT to parse (private)
--   generated-pdfs  — exported resume/cover PDFs (private, signed URLs)
-- Add RLS storage policies so users only access objects under their own {user_id}/ prefix.
-- ============================================================
