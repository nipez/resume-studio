# Resume Studio — starter scaffolding

These files seed the **GitHub + Railway + Supabase** build described in `../CURSOR_PROMPT.md`.
Drop them into your new Next.js repo (move `railway.json` and `.env.example` to the repo root,
keep the `supabase/` folder at the root).

```
starter/
├── railway.json                      → repo root  (Railway build/deploy + healthcheck)
├── .env.example                      → repo root  (copy to .env.local, fill in)
└── supabase/
    └── migrations/
        └── 0001_init.sql             → run with `supabase db push`
```

## Order of operations

1. **Create the repo** and scaffold Next.js (App Router, TypeScript):
   `npx create-next-app@latest resume-studio --ts --app --tailwind`
2. **Add these files**: move `railway.json` + `.env.example` to the root, copy `supabase/` to the root.
   Add a tiny health endpoint at `app/api/health/route.ts` returning `{ ok: true }` (Railway healthcheck).
3. **Supabase**: create a project, then `supabase link` and `supabase db push` to apply `0001_init.sql`.
   In the dashboard, enable **Email (magic link)** + **Google** auth, and create two private Storage
   buckets: `resume-uploads` and `generated-pdfs` (add per-user prefix RLS policies).
4. **Railway**: create a project from the GitHub repo. Add every var from `.env.example` (except `PORT`,
   which Railway injects). Deploy — the healthcheck hits `/api/health`.
5. **Build the app** following the 9-PR plan in `CURSOR_PROMPT.md`, matching `Resume Studio.dc.html`.

## Notes

- The migration enables **Row Level Security on every table** — a user can only ever read/write their
  own rows. Don't disable it.
- `profiles.positioning` is the per-user replacement for the prototype's hardcoded `positioning()`
  string — pass it into every AI prompt as context.
- `applications.resume_snapshot` / `cover_letter` / `answers` are **immutable once created**; only
  status, events, notes, insight, and prep change afterward. This is what keeps the Insights analytics
  truthful.
