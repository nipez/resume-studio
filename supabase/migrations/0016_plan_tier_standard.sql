-- Rename plan_tier value essentials → standard (display name Standard)
update public.profiles
set plan_tier = 'standard'
where plan_tier = 'essentials';

comment on column public.profiles.plan_tier is
  'Subscription tier: student | standard | pro. Legacy essentials maps to standard. Defaults to pro during pilot.';
