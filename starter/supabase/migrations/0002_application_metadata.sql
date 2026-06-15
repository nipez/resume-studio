-- Application metadata: posting URL and AI-suggested hiring contacts
alter table public.applications
  add column if not exists job_url text default '',
  add column if not exists hiring_contacts jsonb;
