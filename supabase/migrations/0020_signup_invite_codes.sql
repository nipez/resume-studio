-- Unique invite codes required to create a free beta account.

create table if not exists public.signup_invite_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  note       text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at    timestamptz,
  used_by    uuid references auth.users(id) on delete set null,
  revoked_at timestamptz
);

create index if not exists signup_invite_codes_open_idx
  on public.signup_invite_codes (created_at desc)
  where used_at is null and revoked_at is null;

create index if not exists signup_invite_codes_used_by_idx
  on public.signup_invite_codes (used_by)
  where used_by is not null;

alter table public.signup_invite_codes enable row level security;

comment on table public.signup_invite_codes is
  'Single-use invite codes for beta signup. Service role only (no client policies).';
