# AGENTS.md

Instructions for **Cursor Cloud Agents**, **Codex**, and other AI assistants working in this repo.

---

## Start here

1. **[docs/HANDOFF.md](docs/HANDOFF.md)** — current project status, what shipped, how to resume.
2. **[docs/ROADMAP.md](docs/ROADMAP.md)** — next tasks.
3. **[docs/MIGRATIONS.md](docs/MIGRATIONS.md)** — Supabase schema.

---

## Stack

Single **Next.js 14 (App Router) + TypeScript** app. Backend = **Supabase** (Postgres + Auth). Deploy = **Railway**. AI = Anthropic Claude via `app/api/ai/*` and `lib/ai/*` (mock fallback if no `ANTHROPIC_API_KEY`).

Scripts: `dev`, `build`, `start`, `lint` in `package.json`. **No test runner.**

---

## Git / PR workflow (Cloud Agent)

- Base branch: **`main`**
- Feature branches: **`cursor/<descriptive-name>-82c8`**
- Push: `git push -u origin cursor/<branch>`
- Open PR to `main`; merge when green.

---

## TypeScript / Railway build

`tsconfig.json` has **no explicit `target`** (defaults to ES3). **Do not use:**

- `[...new Set(...)]` → use `Array.from(new Set(...))`
- `[...map.entries()]` → use `Array.from(map.entries())`
- `[...arr1, ...arr2]` inside `new Set([...])` → use `.concat()`

Prior fixes: `lib/support/actions.ts`, `lib/admin/ai-usage.ts`.

Run `npm run lint` and `npm run build` before merge when possible (build needs env vars for some static pages).

---

## Local dev environment

Docker + Supabase CLI are available in Cloud VM but **not auto-started**:

1. `sudo dockerd` (background / tmux)
2. `supabase start` (or `supabase db reset` for migrations + seed)
3. `npm run dev` → port 3000

`.env.local` is gitignored. Local Supabase demo keys (safe to hardcode locally):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
PORT=3000
```

### Gotchas

- Use **http://127.0.0.1:3000**, not `localhost`, for auth (Supabase `site_url` / PKCE).
- Magic link: Mailpit http://127.0.0.1:54324 — click link **once**.
- `supabase/seed.sql` grants table privileges locally; not applied by `db push` to hosted.
- Supabase Studio: http://127.0.0.1:54323

---

## Product / admin context

- **Super admin:** `/admin` — `ADMIN_EMAILS` env (default `nickperez@gmail.com`).
- **View-as exit:** `/api/admin/exit-view-as` if stuck impersonating.
- **Production URL:** https://resumetrakr.com — set `NEXT_PUBLIC_SITE_URL` on Railway.
- **Beta tester Alia:** `aliadiorio@gmail.com` — see HANDOFF + ai-cost-benchmarks.

---

## Pricing / AI costs

- Benchmark log: [docs/ai-cost-benchmarks.md](docs/ai-cost-benchmarks.md)
- Live estimates: Super admin → **AI costs** tab (`ai_usage_events`)
- Recording: `lib/ai/usage.ts` → `recordAIUsage()` on each `completeWithFallback()`

---

## Code conventions

- Match existing patterns; minimal diffs.
- Server actions in `lib/*/actions.ts`; RLS for users, `createServiceClient()` for admin aggregates.
- Optional DB columns: graceful strip pattern in `lib/applications/db-write.ts`.

---

## When you finish a feature

1. Update [docs/HANDOFF.md](docs/HANDOFF.md) (shipped table) and [docs/ROADMAP.md](docs/ROADMAP.md).
2. New migration → [docs/MIGRATIONS.md](docs/MIGRATIONS.md) + `verify_schema.sql`.
3. Notable API spend → [docs/ai-cost-benchmarks.md](docs/ai-cost-benchmarks.md).
