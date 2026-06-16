-- Optional notes for AI resume tailoring and guided build context
alter table public.workspace_drafts
  add column if not exists context_notes text not null default '';

alter table public.guided_drafts
  add column if not exists context_notes text not null default '';
