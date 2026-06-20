-- Support tickets: user help requests, feature ideas, human review interest

create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  category   text not null check (category in ('question', 'feature', 'human_review')),
  message    text not null,
  status     text not null default 'open' check (status in ('open', 'replied', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_idx
  on public.support_tickets(user_id, created_at desc);

create index if not exists support_tickets_status_idx
  on public.support_tickets(status, created_at desc);

create table if not exists public.support_messages (
  id              uuid primary key default gen_random_uuid(),
  ticket_id       uuid not null references public.support_tickets(id) on delete cascade,
  sender_role     text not null check (sender_role in ('user', 'admin')),
  body            text not null,
  read_by_user_at timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists support_messages_ticket_idx
  on public.support_messages(ticket_id, created_at asc);

create trigger trg_support_tickets_touch
  before update on public.support_tickets
  for each row execute function public.touch_updated_at();

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

create policy "support_tickets self select"
  on public.support_tickets for select
  using (auth.uid() = user_id);

create policy "support_tickets self insert"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

create policy "support_messages self select"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

create policy "support_messages self insert user"
  on public.support_messages for insert
  with check (
    sender_role = 'user'
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

create policy "support_messages self mark read"
  on public.support_messages for update
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

comment on table public.support_tickets is
  'User help and feedback requests (question, feature, human review).';

comment on table public.support_messages is
  'Thread messages on support tickets; admin replies notify the user inbox.';
