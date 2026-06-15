-- Student segmentation on profiles
alter table public.profiles
  add column if not exists is_student boolean not null default false,
  add column if not exists student_level text;
