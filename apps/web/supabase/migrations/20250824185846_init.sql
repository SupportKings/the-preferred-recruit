-- Roles
create table public.roles (
  id uuid primary key default gen_random_uuid (),
  role_name text not null unique,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- Billing Status
create table public.billing_status (
  id uuid primary key default gen_random_uuid (),
  status_name text not null,
  warning_time_hours int,
  error_time_hours int,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- Onboarding Status
create table public.onboarding_status (
  id uuid primary key default gen_random_uuid (),
  status_name text not null,
  warning_time_hours int,
  error_time_hours int,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- Users
create table public."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null,
  image text,
  "createdAt" timestamp not null default current_timestamp,
  "updatedAt" timestamp not null default current_timestamp,
  banned boolean default false,
  "banReason" text,
  "banExpires" timestamp,
  role text
);

-- Clients
create table public.clients (
  id uuid primary key default gen_random_uuid (),
  client_name text not null,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  billing_status_id uuid references public.billing_status (id),
  onboarding_status_id uuid references public.onboarding_status (id),
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- Team Members
create table public.team_members (
  id uuid primary key default gen_random_uuid (),
  first_name text not null,
  last_name text not null,
  email text unique not null,
  user_id text references public."user" (id) on delete set null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- Accounts
create table public.account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references public."user" (id),
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  scope text,
  password text,
  "createdAt" timestamp not null default current_timestamp,
  "updatedAt" timestamp not null default current_timestamp
);

-- Passkeys
create table public.passkey (
  id text primary key,
  name text,
  "publicKey" text not null,
  "userId" text not null references public."user" (id),
  "credentialID" text not null unique,
  counter int not null,
  "deviceType" text not null,
  "backedUp" boolean not null,
  transports text,
  "createdAt" timestamp default current_timestamp,
  aaguid text
);

-- Sessions
create table public.session (
  id text primary key,
  "expiresAt" timestamp not null,
  token text not null unique,
  "createdAt" timestamp not null default current_timestamp,
  "updatedAt" timestamp not null default current_timestamp,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references public."user" (id),
  "impersonatedBy" text
);

-- Verification
create table public.verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamp not null,
  "createdAt" timestamp not null default current_timestamp,
  "updatedAt" timestamp not null default current_timestamp
);
