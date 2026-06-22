-- Soft-archive logged applications (hidden from active list + insights stats)
alter table public.applications
  add column if not exists archived_at timestamptz;

create index if not exists applications_active_idx
  on public.applications(user_id, applied_at desc)
  where archived_at is null;

comment on column public.applications.archived_at is
  'When set, application is hidden from the active list and insights; snapshot is preserved.';
