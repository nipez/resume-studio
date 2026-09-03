-- Platform-wide AI writing guidelines (Super admin editable)

create table if not exists public.ai_system_guidelines (
  id              text primary key default 'default',
  guidelines      text not null default '',
  banned_phrases  text[] not null default '{}',
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users(id)
);

insert into public.ai_system_guidelines (id, guidelines, banned_phrases)
values (
  'default',
  E'Do not use em dashes or hyphens as punctuation in generated prose. Use commas, periods, or rephrase instead.',
  array[
    'it lands',
    'here''s the part most people miss',
    'In today''s rapidly evolving'
  ]
)
on conflict (id) do nothing;

create trigger trg_ai_system_guidelines_touch
  before update on public.ai_system_guidelines
  for each row execute function public.touch_updated_at();

alter table public.ai_system_guidelines enable row level security;

-- No client policies: read/write only via service role in server actions.
