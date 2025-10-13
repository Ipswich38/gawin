-- Gawin Production Database Schema
-- This will be used for Supabase setup

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  credits_remaining integer default 1000,
  max_agents integer default 5,
  max_workflows integer default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen timestamp with time zone default timezone('utc'::text, now()),
  preferences jsonb default '{}',
  usage_stats jsonb default '{}',
  billing_info jsonb default '{}'
);

-- Organizations table for team features
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  owner_id uuid references public.users(id) on delete cascade not null,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  settings jsonb default '{}',
  billing_info jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Organization members
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  permissions jsonb default '{}',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- Agents table
create table public.agents (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  type text not null,
  version text default '1.0.0',
  config jsonb not null default '{}',
  capabilities jsonb default '[]',
  integrations jsonb default '[]',
  icon text,
  color text default 'blue',
  author_id uuid references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  is_public boolean default false,
  is_marketplace boolean default false,
  price_model text default 'free' check (price_model in ('free', 'paid', 'subscription')),
  price_amount integer default 0,
  downloads integer default 0,
  rating numeric(3,2) default 0.0,
  reviews_count integer default 0,
  tags text[] default array[]::text[],
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workflows table
create table public.workflows (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references public.users(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  nodes jsonb not null default '[]',
  connections jsonb not null default '[]',
  settings jsonb default '{}',
  is_active boolean default false,
  is_public boolean default false,
  is_template boolean default false,
  tags text[] default array[]::text[],
  execution_stats jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_run_at timestamp with time zone
);

-- Workflow executions
create table public.workflow_executions (
  id uuid default uuid_generate_v4() primary key,
  workflow_id uuid references public.workflows(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data jsonb default '{}',
  output_data jsonb default '{}',
  execution_log jsonb default '[]',
  error_message text,
  credits_used integer default 0,
  duration_ms integer,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Conversations table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  title text,
  messages jsonb not null default '[]',
  metadata jsonb default '{}',
  agent_config jsonb default '{}',
  credits_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  plan_name text not null,
  plan_amount integer not null,
  plan_currency text default 'usd',
  plan_interval text check (plan_interval in ('month', 'year')),
  status text check (status in ('active', 'cancelled', 'past_due', 'unpaid', 'incomplete')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint subscription_owner check (
    (user_id is not null and organization_id is null) or
    (user_id is null and organization_id is not null)
  )
);

-- Usage tracking
create table public.usage_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  resource_type text not null, -- 'api_call', 'agent_execution', 'workflow_run', 'storage'
  resource_id text, -- workflow_id, agent_id, etc.
  quantity integer default 1,
  credits_cost integer default 0,
  metadata jsonb default '{}',
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API keys for external access
create table public.api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null, -- First 8 chars for display
  permissions jsonb default '{}',
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit logs
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb default '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.agents enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_executions enable row level security;
alter table public.conversations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_records enable row level security;
alter table public.api_keys enable row level security;
alter table public.audit_logs enable row level security;

-- Users can only see their own data
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Organization policies
create policy "Organization members can view organization" on public.organizations for select using (
  exists (
    select 1 from public.organization_members
    where organization_id = id and user_id = auth.uid()
  )
);

-- Workflow policies
create policy "Users can view own workflows" on public.workflows for select using (
  owner_id = auth.uid() or
  is_public = true or
  (organization_id is not null and exists (
    select 1 from public.organization_members
    where organization_id = workflows.organization_id and user_id = auth.uid()
  ))
);

create policy "Users can create workflows" on public.workflows for insert with check (owner_id = auth.uid());
create policy "Users can update own workflows" on public.workflows for update using (owner_id = auth.uid());
create policy "Users can delete own workflows" on public.workflows for delete using (owner_id = auth.uid());

-- Agent policies
create policy "Users can view public agents" on public.agents for select using (
  is_public = true or
  author_id = auth.uid() or
  (organization_id is not null and exists (
    select 1 from public.organization_members
    where organization_id = agents.organization_id and user_id = auth.uid()
  ))
);

-- Functions for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_users_updated_at before update on public.users for each row execute procedure public.handle_updated_at();
create trigger handle_organizations_updated_at before update on public.organizations for each row execute procedure public.handle_updated_at();
create trigger handle_agents_updated_at before update on public.agents for each row execute procedure public.handle_updated_at();
create trigger handle_workflows_updated_at before update on public.workflows for each row execute procedure public.handle_updated_at();
create trigger handle_conversations_updated_at before update on public.conversations for each row execute procedure public.handle_updated_at();
create trigger handle_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.handle_updated_at();

-- Indexes for performance
create index users_email_idx on public.users(email);
create index users_subscription_tier_idx on public.users(subscription_tier);
create index organizations_slug_idx on public.organizations(slug);
create index organization_members_user_id_idx on public.organization_members(user_id);
create index organization_members_organization_id_idx on public.organization_members(organization_id);
create index agents_author_id_idx on public.agents(author_id);
create index agents_is_marketplace_idx on public.agents(is_marketplace);
create index agents_tags_idx on public.agents using gin(tags);
create index workflows_owner_id_idx on public.workflows(owner_id);
create index workflows_organization_id_idx on public.workflows(organization_id);
create index workflow_executions_workflow_id_idx on public.workflow_executions(workflow_id);
create index workflow_executions_user_id_idx on public.workflow_executions(user_id);
create index workflow_executions_status_idx on public.workflow_executions(status);
create index conversations_user_id_idx on public.conversations(user_id);
create index usage_records_user_id_timestamp_idx on public.usage_records(user_id, timestamp);
create index usage_records_resource_type_idx on public.usage_records(resource_type);
create index audit_logs_user_id_timestamp_idx on public.audit_logs(user_id, timestamp);
create index audit_logs_action_idx on public.audit_logs(action);