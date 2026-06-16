-- Optional notes for AI resume context on guided build
alter table public.guided_drafts
  add column if not exists context_notes text not null default '';
