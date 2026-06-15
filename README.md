# ResumeTrakr

AI-assisted resume and job-application platform. Production rebuild of the
`Resume Builder/Resume Studio.dc.html` prototype on **Next.js 14 + Supabase + Railway**.

Full build spec: [`Resume Builder/CURSOR_PROMPT.md`](./Resume%20Builder/CURSOR_PROMPT.md)

## PR #1 — Scaffold (current)

- Next.js 14 App Router, TypeScript, Tailwind
- `GET /api/health` → `{ ok: true, service, supabaseConfigured }`
- Supabase migration at `supabase/migrations/0001_init.sql`
- Railway deploy config at `railway.json`

## Local development

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Install the CLI: `npm i -g supabase` (or use `npx supabase`).
3. Link and push the schema:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

4. In the dashboard, enable **Email (magic link)** and **Google** auth.
5. Create private Storage buckets: `resume-uploads`, `generated-pdfs` (RLS per-user prefix — PR #9).

## Railway deploy

1. Push this repo to GitHub.
2. Create a Railway project from the repo.
3. Add every variable from `.env.example` (except `PORT` — Railway injects it).
4. Set `NEXT_PUBLIC_SITE_URL` to your Railway public URL after the first deploy.
5. Deploy — Railway healthcheck hits `/api/health`.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin operations |
| `ANTHROPIC_API_KEY` | Server only | AI endpoints (PR #5+) |
| `AI_MODEL` | Server only | Anthropic model id |
| `AI_MAX_TOKENS` | Server only | Token budget |
| `NEXT_PUBLIC_SITE_URL` | Client + server | Auth redirects, public links |

## Build order

See the 9-PR plan in `CURSOR_PROMPT.md`. PR #1 is scaffold only — no features yet.
