-- Student persona: persisted first-run choice drives profile, plan tier, and UX

alter table public.profiles
  add column if not exists persona text,
  add column if not exists onboarding_persona_set boolean not null default false;

comment on column public.profiles.persona is
  'User path: student | professional. Set at first-run path picker.';

comment on column public.profiles.onboarding_persona_set is
  'True after user picks student, experienced, or import on first-run.';

update public.profiles
set
  persona = case when is_student then 'student' else 'professional' end,
  onboarding_persona_set = true
where is_student = true
  and persona is null;

alter table public.profiles
  drop constraint if exists profiles_persona_check;

alter table public.profiles
  add constraint profiles_persona_check
  check (persona is null or persona in ('student', 'professional'));
