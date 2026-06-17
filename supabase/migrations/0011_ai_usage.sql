-- AI usage tracking and plan tier for fair-use / margin protection

alter table public.profiles
  add column if not exists plan_tier text not null default 'pro';

comment on column public.profiles.plan_tier is
  'Subscription tier: student | essentials | pro. Defaults to pro during beta.';

create table if not exists public.ai_usage_monthly (
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  action_count int not null default 0,
  estimated_cost_usd numeric(10, 4) not null default 0,
  cost_alert_sent boolean not null default false,
  primary key (user_id, period_start)
);

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  estimated_cost_usd numeric(10, 6) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_created_idx
  on public.ai_usage_events (user_id, created_at desc);

alter table public.ai_usage_monthly enable row level security;
alter table public.ai_usage_events enable row level security;

create policy ai_usage_monthly_select_own
  on public.ai_usage_monthly for select
  using (auth.uid() = user_id);

create policy ai_usage_monthly_insert_own
  on public.ai_usage_monthly for insert
  with check (auth.uid() = user_id);

create policy ai_usage_monthly_update_own
  on public.ai_usage_monthly for update
  using (auth.uid() = user_id);

create policy ai_usage_events_select_own
  on public.ai_usage_events for select
  using (auth.uid() = user_id);

create policy ai_usage_events_insert_own
  on public.ai_usage_events for insert
  with check (auth.uid() = user_id);
