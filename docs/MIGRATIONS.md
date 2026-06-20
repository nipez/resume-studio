# Supabase migrations

Apply in order on **hosted Supabase** (SQL Editor or `supabase db push`). After applying, run **`supabase/migrations/verify_schema.sql`** — every row should show `ok = true`.

Local dev: `supabase db reset` applies migrations + `supabase/seed.sql` (seed is **local only**).

---

## Migration index

| File | Adds |
|------|------|
| `0001_init.sql` | Core schema: profiles, resume_versions, applications, events, guided_drafts, RLS |
| `0002_application_metadata.sql` | `applications.job_url`, `hiring_contacts` |
| `0003_student_profile.sql` | `is_student`, `student_level` on profiles |
| `0004_demo_users.sql` | Demo personas for admin view-as |
| `0005_cover_letters.sql` | `cover_letters` table |
| `0006_workspace_drafts.sql` | `workspace_drafts` (job draft sync) |
| `0007_context_notes.sql` | Context notes on drafts |
| `0008_interview_debrief.sql` | Interview transcript/debrief on applications |
| `0009_resume_archive.sql` | `resume_versions.archived_at` |
| `0010_saved_jobs.sql` | **`saved_jobs`** table (job queue) |
| `0011_ai_usage.sql` | `plan_tier`, **`ai_usage_events`**, **`ai_usage_monthly`** |
| `0012_student_persona.sql` | `persona`, `onboarding_persona_set` |
| `0013_application_type.sql` | `applications.application_type` |
| `0014_support_tickets.sql` | **`support_tickets`**, **`support_messages`** |

Starter copies (subset) live under `starter/supabase/migrations/` for greenfield installs.

---

## Production checklist (June 2026)

Nick confirmed running through **0014** + `0010_saved_jobs` fix. If anything fails in admin or saved jobs:

```sql
-- Quick health check (full script is better):
select to_regclass('public.saved_jobs');
select to_regclass('public.support_tickets');
select to_regclass('public.ai_usage_events');
```

Re-run the specific migration file for any `null` / missing table.

---

## verify_schema.sql

Path: `supabase/migrations/verify_schema.sql`

Run in Supabase SQL Editor after deploys or when debugging “column does not exist” in production.

Comments at bottom of that file map failing checks → migration files.

---

## RLS note

Admin features (all users, support replies, AI cost aggregates) use **`createServiceClient()`** (service role) in server actions — not user RLS bypass from the browser.

---

_Last updated: 2026-06-20_
