-- Soft-archive resume versions (hidden from pickers, restorable from library)
alter table public.resume_versions
  add column if not exists archived_at timestamptz;

create index if not exists resume_versions_active_idx
  on public.resume_versions(user_id, updated_at desc)
  where archived_at is null;
