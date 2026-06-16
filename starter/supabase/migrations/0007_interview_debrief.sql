-- Post-interview transcript paste + AI debrief on applications
alter table public.applications
  add column if not exists interview_transcript text default '',
  add column if not exists interview_debrief jsonb;
