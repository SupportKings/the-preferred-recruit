
-- 🔹 Seed admin role
insert into public.roles (id, role_name)
values (gen_random_uuid(), 'admin')
on conflict (role_name) do nothing;

-- 🔹 Seed The Preferred Recruit Support user
insert into public."user" (
  id, name, email, "emailVerified", banned, role, "createdAt", "updatedAt"
) values (
  gen_random_uuid()::text,
  'The Preferred Recruit Support',
  'support@thepreferredrecruit.com',
  true,
  false,
  'admin',
  current_timestamp,
  current_timestamp
)
on conflict (email) do nothing;

-- 🔹 Seed The Preferred Recruit Support as a team member
insert into public.team_members (id, first_name, last_name, email, user_id, created_at, updated_at)
select
  gen_random_uuid(),
  'The Preferred Recruit',
  'Support',
  'support@thepreferredrecruit.com',
  u.id,
  current_timestamp,
  current_timestamp
from public."user" u
where u.email = 'support@thepreferredrecruit.com'
on conflict (email) do nothing;

-- 🔹 Seed onboarding statuses
insert into public.onboarding_status (id, status_name)
values
  (gen_random_uuid(), '00 - New'),
  (gen_random_uuid(), '50 - Onboarding In Progress'),
  (gen_random_uuid(), '100 - Onboarded')
on conflict (status_name) do nothing;

-- 🔹 Seed billing statuses
insert into public.billing_status (id, status_name)
values
  (gen_random_uuid(), '00 - New'),
  (gen_random_uuid(), '100 - Paid')
on conflict (status_name) do nothing;
