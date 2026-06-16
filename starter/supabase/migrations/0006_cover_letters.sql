-- cover_letters — account-level, cross-device cover letters.
-- Previously cover-letter drafts lived only in the browser's localStorage, so a
-- letter written on one device was invisible on another. These rows are per-user
-- and protected by Row Level Security so they sync wherever the user signs in.

create table if not exists public.cover_letters (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null default 'Cover letter',
  role              text default '',
  company           text default '',
  body              text not null default '',
  -- the resume version this letter was generated from (kept for context; cleared
  -- if that version is later deleted)
  resume_version_id uuid references public.resume_versions(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists cover_letters_user_idx
  on public.cover_letters(user_id, updated_at desc);

drop trigger if exists trg_cover_letters_touch on public.cover_letters;
create trigger trg_cover_letters_touch
  before update on public.cover_letters
  for each row execute function public.touch_updated_at();

alter table public.cover_letters enable row level security;

drop policy if exists "cover_letters owner" on public.cover_letters;
create policy "cover_letters owner" on public.cover_letters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
