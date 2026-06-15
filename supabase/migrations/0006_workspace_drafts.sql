-- workspace_drafts — the shared "current job" scratchpad, one row per user.
-- The Tailor / Cover / Questions tabs share a single working job context (role,
-- company, description, URL, cover-letter text, hiring manager) plus a list of
-- application Q&A. This previously lived only in browser localStorage, so the
-- scratchpad did not follow the user to another device. These rows are per-user
-- and protected by Row Level Security; localStorage is kept only as a fast cache.

create table if not exists public.workspace_drafts (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  job_role    text not null default '',
  job_company text not null default '',
  job_desc    text not null default '',
  job_url     text not null default '',
  cover_text  text not null default '',
  cover_hm    text not null default '',
  -- [{ id, q, a }] application question/answer drafts
  qa          jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_workspace_drafts_touch on public.workspace_drafts;
create trigger trg_workspace_drafts_touch
  before update on public.workspace_drafts
  for each row execute function public.touch_updated_at();

alter table public.workspace_drafts enable row level security;

drop policy if exists "workspace_drafts owner" on public.workspace_drafts;
create policy "workspace_drafts owner" on public.workspace_drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
