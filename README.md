# ResumeTrakr

AI-assisted resume and job-application platform. **Next.js 14 + Supabase + Railway + Anthropic Claude.**

Production: **https://resumetrakr.com**

---

## Picking up the project

**→ [docs/HANDOFF.md](./docs/HANDOFF.md)** — read first after a break or on a new machine (status, beta context, gotchas, key paths).

Also: [docs/ROADMAP.md](./docs/ROADMAP.md) · [docs/MIGRATIONS.md](./docs/MIGRATIONS.md) · [docs/ai-cost-benchmarks.md](./docs/ai-cost-benchmarks.md)

Agents: [AGENTS.md](./AGENTS.md)

---

## Local development

```bash
cp .env.example .env.local   # Supabase + Anthropic keys
npm install
npm run dev
```

Open **http://127.0.0.1:3000** (not `localhost` — auth PKCE). Magic-link emails: Mailpit at http://127.0.0.1:54324.

Health: http://127.0.0.1:3000/api/health

Full local Supabase flow: [AGENTS.md](./AGENTS.md).

---

## Supabase

1. Create project at [supabase.com](https://supabase.com).
2. Apply migrations in order — see [docs/MIGRATIONS.md](./docs/MIGRATIONS.md).
3. Run [supabase/migrations/verify_schema.sql](./supabase/migrations/verify_schema.sql) (all checks `ok`).
4. Enable Email (magic link) + Google auth in dashboard.

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## Railway deploy

1. Connect GitHub repo; deploy from **`main`**.
2. Set all variables from [`.env.example`](./.env.example).
3. **`NEXT_PUBLIC_SITE_URL=https://resumetrakr.com`** (must match public URL for auth redirects).
4. Healthcheck: `/api/health`.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin/service |
| `ANTHROPIC_API_KEY` | AI (optional locally — mock fallback) |
| `AI_MODEL` / `AI_MODEL_FAST` | Sonnet vs Haiku tiers |
| `NEXT_PUBLIC_SITE_URL` | Auth redirects, absolute links |
| `ADMIN_EMAILS` | Comma-separated super admin emails (default: nickperez@gmail.com) |
| `AI_ENFORCE_PLAN_TIERS` | `true` at GA; beta leaves everyone Pro AI access |

See `.env.example` for caps and alerts.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (same as Railway) |
| `npm run lint` | ESLint |

No automated test runner configured.

---

## Original build spec

Prototype reference: [`Resume Builder/CURSOR_PROMPT.md`](./Resume%20Builder/CURSOR_PROMPT.md)
