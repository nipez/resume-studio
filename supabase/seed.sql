-- Local development seed (Supabase CLI only — NOT applied to hosted projects via `db push`).
-- Runs after migrations on `supabase db reset` / first `supabase start`.
--
-- Hosted Supabase projects ship with default privileges that grant the API roles
-- (anon / authenticated / service_role) access to objects in the `public` schema.
-- A bare local Postgres started by the CLI does not have those default privileges,
-- so tables created by our migration would be unreachable through PostgREST
-- (every authenticated query fails with "permission denied"). Row Level Security
-- still enforces per-user access, so these grants are safe.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Rich demo persona (Alex Rivera): run `npm run seed:demo` after db reset.
-- Creates auth user alex.rivera@demo.resumetrakr.local with resumes, cover
-- letters, 12 applications (insights + events), and workspace draft.
