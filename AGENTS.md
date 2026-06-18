# AGENTS.md

## Cursor Cloud specific instructions

Resume Studio is a single **Next.js 14 (App Router) + TypeScript** app whose only
backend is **Supabase** (Postgres + Auth + Storage). AI endpoints (`app/api/ai/*`)
use Anthropic Claude but fall back to deterministic mock output when
`ANTHROPIC_API_KEY` is unset, so AI is optional for local dev.

Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`). There is
**no test runner** configured. Local dev/Supabase setup is documented in `README.md`.

### Starting the local dev environment

The update script only runs `npm install`. Docker and the Supabase CLI are already
installed in the image, but **services are not auto-started** — start them each session:

1. Start the Docker daemon (no systemd here, run it in the background):
   `sudo dockerd` (e.g. in a tmux session). The socket may need `sudo chmod 666 /var/run/docker.sock` once so the Supabase CLI can reach it without sudo.
2. Start Supabase: `supabase start` (first run pulls images; `supabase db reset` re-applies migrations + `supabase/seed.sql`).
3. Seed the demo persona: `npm run seed:demo` (creates **Alex Rivera** with 5 resumes, 4 cover letters, 12 applications with insights, and workspace draft).
4. Start the app: `npm run dev` (port 3000).

`.env.local` is gitignored. If missing, recreate it with the **standard local Supabase
demo keys** (identical on every machine — safe to hardcode for local dev):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PORT=3000
```

### Non-obvious gotchas

- **Open the app at `http://127.0.0.1:3000`, not `http://localhost:3000`.** Supabase's
  default `auth.site_url` (in `supabase/config.toml`) is `http://127.0.0.1:3000`, so a
  magic-link redirect to a `localhost` origin is rejected ("Email link is invalid").
  Keeping the same `127.0.0.1` origin throughout also preserves the PKCE verifier.
- **Auth is passwordless magic link.** After clicking "Send magic link", open the email
  in **Mailpit** at `http://127.0.0.1:54324`, then click the link **once** (links are
  single-use). It signs you in and redirects to `/library`.
- **`supabase/seed.sql` grants table privileges** to `anon`/`authenticated`/`service_role`.
  A bare local Postgres lacks the default privileges hosted Supabase ships with, so
  without this seed every authenticated query fails with "permission denied". RLS still
  enforces per-user row access. This file is local-only (not applied by `supabase db push`).
- Supabase Studio (DB browser) is at `http://127.0.0.1:54323`.
- Reinstalling deps does not require restarting Supabase; only restart `npm run dev`.
- **Demo persona:** `alex.rivera@demo.resumetrakr.local` / `demo-alex-rivera` (after `npm run seed:demo`). Admins can also create pre-loaded personas from **Admin → Demo users**; each new persona gets the same rich sample data automatically.
