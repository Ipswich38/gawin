-- Supabase Database Schema for Gawin AI App
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table (user profiles)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text not null,
    avatar_url text,
    subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
    credits_remaining integer not null default 100,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    email_verified boolean default false,
    preferences jsonb default '{
        "theme": "auto",
        "language": "en",
        "notifications_enabled": true,
        "ai_model_preference": "deepseek-r1",
        "tutor_mode_default": false
    }'::jsonb
);

-- Create conversations table (chat history)
create table if not exists public.conversations (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    messages jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_archived boolean default false,
    tags text[] default array[]::text[],
    module_type text check (module_type in ('calculator', 'coding_academy', 'ai_academy', 'translator', 'creative_studio', 'robotics'))
);

-- Create usage_records table (track API usage and credits)
create table if not exists public.usage_records (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    action text not null check (action in ('chat', 'image_generation', 'ocr', 'tutor_session', 'code_execution', 'translation')),
    credits_used integer not null default 1,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    module_type text check (module_type in ('calculator', 'coding_academy', 'ai_academy', 'translator', 'creative_studio', 'robotics'))
);

-- Create calculator_history table (specific to calculator module)
create table if not exists public.calculator_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    expression text not null,
    result text not null,
    calculation_type text default 'basic' check (calculation_type in ('basic', 'scientific', 'advanced', 'graphing')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create coding_projects table (for coding academy)
create table if not exists public.coding_projects (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    project_name text not null,
    description text,
    language text not null,
    code_content text not null,
    is_completed boolean default false,
    difficulty_level text default 'beginner' check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ai_learning_progress table (for AI academy)
create table if not exists public.ai_learning_progress (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    topic text not null,
    completion_percentage integer default 0 check (completion_percentage >= 0 and completion_percentage <= 100),
    quiz_scores jsonb default '[]'::jsonb,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.usage_records enable row level security;
alter table public.calculator_history enable row level security;
alter table public.coding_projects enable row level security;
alter table public.ai_learning_progress enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Conversations policies
create policy "Users can view own conversations" on public.conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on public.conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations" on public.conversations for update using (auth.uid() = user_id);
create policy "Users can delete own conversations" on public.conversations for delete using (auth.uid() = user_id);

-- Usage records policies
create policy "Users can view own usage records" on public.usage_records for select using (auth.uid() = user_id);
create policy "Users can insert own usage records" on public.usage_records for insert with check (auth.uid() = user_id);

-- Calculator history policies
create policy "Users can view own calculator history" on public.calculator_history for select using (auth.uid() = user_id);
create policy "Users can insert own calculator history" on public.calculator_history for insert with check (auth.uid() = user_id);
create policy "Users can delete own calculator history" on public.calculator_history for delete using (auth.uid() = user_id);

-- Coding projects policies
create policy "Users can view own coding projects" on public.coding_projects for select using (auth.uid() = user_id);
create policy "Users can insert own coding projects" on public.coding_projects for insert with check (auth.uid() = user_id);
create policy "Users can update own coding projects" on public.coding_projects for update using (auth.uid() = user_id);
create policy "Users can delete own coding projects" on public.coding_projects for delete using (auth.uid() = user_id);

-- AI learning progress policies
create policy "Users can view own ai learning progress" on public.ai_learning_progress for select using (auth.uid() = user_id);
create policy "Users can insert own ai learning progress" on public.ai_learning_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own ai learning progress" on public.ai_learning_progress for update using (auth.uid() = user_id);
create policy "Users can delete own ai learning progress" on public.ai_learning_progress for delete using (auth.uid() = user_id);

-- Function to create profile automatically when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, email_verified)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'Unknown'), new.email_confirmed_at is not null);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger update_conversations_updated_at before update on public.conversations
  for each row execute procedure public.handle_updated_at();

create trigger update_coding_projects_updated_at before update on public.coding_projects
  for each row execute procedure public.handle_updated_at();

create trigger update_ai_learning_progress_updated_at before update on public.ai_learning_progress
  for each row execute procedure public.handle_updated_at();

-- Create indexes for better performance
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_created_at on public.conversations(created_at desc);
create index if not exists idx_conversations_module_type on public.conversations(module_type);

create index if not exists idx_usage_records_user_id on public.usage_records(user_id);
create index if not exists idx_usage_records_created_at on public.usage_records(created_at desc);
create index if not exists idx_usage_records_action on public.usage_records(action);

create index if not exists idx_calculator_history_user_id on public.calculator_history(user_id);
create index if not exists idx_calculator_history_created_at on public.calculator_history(created_at desc);

create index if not exists idx_coding_projects_user_id on public.coding_projects(user_id);
create index if not exists idx_coding_projects_language on public.coding_projects(language);

create index if not exists idx_ai_learning_progress_user_id on public.ai_learning_progress(user_id);
create index if not exists idx_ai_learning_progress_topic on public.ai_learning_progress(topic);