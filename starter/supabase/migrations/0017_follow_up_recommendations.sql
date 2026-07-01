-- Follow-up recommendation support: optional hiring decision date + dismissed suggestions
alter table public.applications
  add column if not exists decision_by date,
  add column if not exists follow_up_dismissed jsonb not null default '[]'::jsonb;
