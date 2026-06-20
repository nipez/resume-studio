-- Application type: part-time, internship, volunteer, full-time (student-friendly tracking)

alter table public.applications
  add column if not exists application_type text default 'full_time';

comment on column public.applications.application_type is
  'Opportunity type: part_time | internship | volunteer | full_time';

alter table public.applications
  drop constraint if exists applications_application_type_check;

alter table public.applications
  add constraint applications_application_type_check
  check (
    application_type is null
    or application_type in ('part_time', 'internship', 'volunteer', 'full_time')
  );
