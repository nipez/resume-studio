# ResumeTrakr — continuity handoff

**Read this first** when reopening the project in Cursor, Codex, or another machine after a crash or long break.

| Doc | Purpose |
|-----|---------|
| [HANDOFF.md](./HANDOFF.md) | This file — status, how to resume |
| [ROADMAP.md](./ROADMAP.md) | Shipped vs planned |
| [MIGRATIONS.md](./MIGRATIONS.md) | Supabase SQL to run / verify |
| [ai-cost-benchmarks.md](./ai-cost-benchmarks.md) | Real API cost data for pricing |
| [../AGENTS.md](../AGENTS.md) | Local dev + agent gotchas |
| [../README.md](../README.md) | Setup, env vars, deploy |

---

## Project snapshot (June 2026)

- **Product:** ResumeTrakr — AI resume builder, tailor, cover letter, application tracker.
- **Stack:** Next.js 14 App Router, TypeScript, Tailwind, Supabase (Auth + Postgres), Railway deploy, Anthropic Claude.
- **Production:** https://resumetrakr.com (`NEXT_PUBLIC_SITE_URL` must match on Railway).
- **Repo:** `resume-studio` on GitHub (Nick / nipez).
- **Super admin:** Nick (`nickperez@gmail.com` by default; override with `ADMIN_EMAILS` env).

---

## Where we left off (latest shipped on `main`)

Recent merges (PRs #81–#85, June 2026):

| Area | What shipped |
|------|----------------|
| **Student persona** | Simple Home default for students; welcome panel; student copy on tailor/applications; `application_type` on logged apps |
| **Super admin** | Persona filters, onboarding column, sort, pagination, reset persona, **Support** tab, **AI costs** tab |
| **Help / support** | Floating **Help me** widget; `/messages` inbox; admin replies (`support_tickets` / `support_messages`) |
| **Saved jobs** | Job posting URL field on save; **Edit** on saved job cards to add URL later |
| **AI costs admin** | Today / 7d / MTD / chart from `ai_usage_events` (estimated, not Anthropic billing API) |
| **Fixes** | View-as exit; cover letter from editor; JD autofill on cover; dashboard default Full; TypeScript `Array.from()` for Map/Set (Railway ES3 target) |

### Beta context

- **Alia** (`aliadiorio@gmail.com`) — first external beta tester (product, Bumped). Drove ATS label, editor click hint, shorten-to-2-pages AI. ~**3¢** Anthropic for a full session (see ai-cost-benchmarks).
- **John Smith** — student demo persona (super admin → Demo personas).

---

## Resume work in 60 seconds

1. Clone/pull `main`.
2. Confirm Supabase migrations through **0014** (run `verify_schema.sql` — all rows `ok`).
3. Railway: env vars from `.env.example`; `NEXT_PUBLIC_SITE_URL=https://resumetrakr.com`.
4. Local: see [AGENTS.md](../AGENTS.md) — use `http://127.0.0.1:3000`, not `localhost`, for auth.
5. Pick next item from [ROADMAP.md](./ROADMAP.md).
6. Branch: `cursor/<short-description>-82c8` → commit → push → PR → merge.

---

## Agent / branch conventions (Cloud Agent)

- Feature branches: **`cursor/<descriptive-name>-82c8`**
- Base branch: **`main`**
- Push: `git push -u origin cursor/<name>-82c8`
- **TypeScript build (Railway):** `tsconfig` has no explicit target (defaults ES3). Do **not** use `[...map.entries()]` or `[...new Set()]`. Use **`Array.from(...)`** and **`.concat()`** instead. (Fixed in `lib/support/actions.ts`, `lib/admin/ai-usage.ts`.)

---

## Key URLs & routes

| Route | Who |
|-------|-----|
| `/dashboard` | Home (Simple/Full toggle; students default Simple) |
| `/admin` | Super admin only |
| `/messages` | User help inbox |
| `/applications` | Saved jobs queue + logged applications |
| `/api/admin/view-as?userId=` | Enter view-as |
| `/api/admin/exit-view-as` | Exit view-as (if stuck impersonating) |

---

## Important code locations

| Subsystem | Paths |
|-----------|--------|
| Student persona | `lib/profile/persona.ts`, `components/dashboard/student-welcome-panel.tsx` |
| Dashboard Simple/Full | `components/dashboard/dashboard-shell.tsx` |
| Saved jobs | `lib/saved-jobs/`, `components/applications/save-job-modal.tsx`, `saved-jobs-section.tsx` |
| Applications | `lib/applications/`, `components/applications/applications-list.tsx` |
| Support / Help me | `lib/support/`, `components/support/help-me-widget.tsx` |
| Super admin | `lib/admin/`, `components/admin/admin-panel.tsx` |
| AI usage + cost | `lib/ai/usage.ts`, `lib/ai/cost.ts`, `lib/admin/ai-usage.ts` |
| View-as | `lib/admin/view-as-session.ts`, `lib/admin/restore-session.ts` |

---

## Environment variables (production checklist)

Required on Railway (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`, `AI_MODEL`, `AI_MODEL_FAST`
- `NEXT_PUBLIC_SITE_URL` = **https://resumetrakr.com**
- Optional: `ADMIN_EMAILS`, `AI_ENFORCE_PLAN_TIERS`, `AI_PRO_MONTHLY_CAP`, `AI_COST_ALERT_USD`

---

## If something is broken

| Symptom | Check |
|---------|--------|
| Auth redirect to localhost | `NEXT_PUBLIC_SITE_URL` on Railway |
| Stuck as another user | Visit `/api/admin/exit-view-as` |
| Feature missing in DB | [MIGRATIONS.md](./MIGRATIONS.md) + `verify_schema.sql` |
| Build fails on spread/Set | Use `Array.from()` pattern |
| AI costs empty in admin | Migration `0011_ai_usage.sql`; events only logged when `ANTHROPIC_API_KEY` set |
| Saved jobs table missing | Migration `0010_saved_jobs.sql` |

---

## Open threads (discussed, not built)

See [ROADMAP.md](./ROADMAP.md) for full list. Top candidates:

1. **Archive applications** (hide rejected/ghosted from main list; keep snapshots)
2. **Google Drive export** (Alia feedback)
3. **Stripe billing** + paid human review for Help me
4. **Admin email** on new support tickets
5. Unified “Apply to a job” flow (Tailor → Cover → Q&A → Log)

---

## Updating this doc

When you ship a meaningful feature or change production setup:

1. Add a row to the “latest shipped” table (or trim old rows).
2. Update [ROADMAP.md](./ROADMAP.md).
3. Add migrations to [MIGRATIONS.md](./MIGRATIONS.md) if any.
4. Log API cost anecdotes in [ai-cost-benchmarks.md](./ai-cost-benchmarks.md).

---

_Last updated: 2026-06-20 (post PR #85 — edit saved jobs)_
