-- Resume Studio schema health check
-- Run in Supabase SQL Editor after applying migrations (or anytime you want
-- to confirm production matches the app). Every row should show ok = true.

with checks as (
  select 'table: profiles' as check_name,
    to_regclass('public.profiles') is not null as ok
  union all select 'table: resume_versions', to_regclass('public.resume_versions') is not null
  union all select 'table: applications', to_regclass('public.applications') is not null
  union all select 'table: application_events', to_regclass('public.application_events') is not null
  union all select 'table: guided_drafts', to_regclass('public.guided_drafts') is not null
  union all select 'table: cover_letters', to_regclass('public.cover_letters') is not null
  union all select 'table: workspace_drafts', to_regclass('public.workspace_drafts') is not null
  union all select 'table: saved_jobs', to_regclass('public.saved_jobs') is not null
  union all select 'table: demo_users', to_regclass('public.demo_users') is not null

  union all select 'applications.job_url',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'applications' and column_name = 'job_url')
  union all select 'applications.hiring_contacts',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'applications' and column_name = 'hiring_contacts')
  union all select 'applications.interview_transcript',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'applications' and column_name = 'interview_transcript')
  union all select 'applications.interview_debrief',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'applications' and column_name = 'interview_debrief')

  union all select 'profiles.is_student',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_student')
  union all select 'profiles.student_level',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'student_level')
  union all select 'profiles.plan_tier',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'plan_tier')
  union all select 'profiles.persona',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'persona')
  union all select 'profiles.onboarding_persona_set',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'onboarding_persona_set')
  union all select 'applications.application_type',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'applications' and column_name = 'application_type')

  union all select 'table: ai_usage_monthly', to_regclass('public.ai_usage_monthly') is not null
  union all select 'table: ai_usage_events', to_regclass('public.ai_usage_events') is not null

  union all select 'resume_versions.archived_at',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'resume_versions' and column_name = 'archived_at')

  union all select 'workspace_drafts.context_notes',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'workspace_drafts' and column_name = 'context_notes')
  union all select 'guided_drafts.context_notes',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'guided_drafts' and column_name = 'context_notes')
  union all select 'saved_jobs.tailored_version_id',
    exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'saved_jobs' and column_name = 'tailored_version_id')
)
select
  check_name,
  ok,
  case when ok then 'ok' else 'MISSING — see supabase/migrations/' end as status
from checks
order by ok asc, check_name asc;

-- Migration file reference (when a check fails):
--   table: workspace_drafts        → 0006_workspace_drafts.sql
--   workspace_drafts.context_notes → 0007_context_notes.sql (requires 0006)
--   table: cover_letters           → 0005_cover_letters.sql
--   applications.interview_*       → 0008_interview_debrief.sql
--   resume_versions.archived_at    → 0009_resume_archive.sql
--   table: saved_jobs              → 0010_saved_jobs.sql
--   profiles.plan_tier             → 0011_ai_usage.sql
--   profiles.persona             → 0012_student_persona.sql
--   table: ai_usage_*              → 0011_ai_usage.sql
--   applications.job_url           → 0002_application_metadata.sql
--   profiles.is_student            → 0003_student_profile.sql
--   table: demo_users              → 0004_demo_users.sql (optional)
