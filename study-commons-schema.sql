-- Study Commons Tables for Real-time Chat
-- Add this to your existing Supabase database

-- Create study_commons_messages table (shared chat messages)
create table if not exists public.study_commons_messages (
    id uuid default uuid_generate_v4() primary key,
    user_nickname text not null,
    message_text text not null,
    is_ai boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create study_commons_users table (track active users)
create table if not exists public.study_commons_users (
    id uuid default uuid_generate_v4() primary key,
    nickname text unique not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.study_commons_messages enable row level security;
alter table public.study_commons_users enable row level security;

-- Study Commons Messages Policies (public read/write for community chat)
create policy "Anyone can view study commons messages" on public.study_commons_messages for select using (true);
create policy "Anyone can insert study commons messages" on public.study_commons_messages for insert with check (true);
create policy "No one can update study commons messages" on public.study_commons_messages for update using (false);
create policy "No one can delete study commons messages" on public.study_commons_messages for delete using (false);

-- Study Commons Users Policies (public read/write for presence)
create policy "Anyone can view study commons users" on public.study_commons_users for select using (true);
create policy "Anyone can insert study commons users" on public.study_commons_users for insert with check (true);
create policy "Anyone can update study commons users" on public.study_commons_users for update using (true);
create policy "Anyone can delete study commons users" on public.study_commons_users for delete using (true);

-- Add updated_at triggers for Study Commons tables
create trigger update_study_commons_messages_updated_at before update on public.study_commons_messages
  for each row execute procedure public.handle_updated_at();

create trigger update_study_commons_users_updated_at before update on public.study_commons_users
  for each row execute procedure public.handle_updated_at();

-- Create indexes for better performance
create index if not exists idx_study_commons_messages_created_at on public.study_commons_messages(created_at desc);
create index if not exists idx_study_commons_messages_is_ai on public.study_commons_messages(is_ai);
create index if not exists idx_study_commons_messages_user_nickname on public.study_commons_messages(user_nickname);

create index if not exists idx_study_commons_users_nickname on public.study_commons_users(nickname);
create index if not exists idx_study_commons_users_last_seen on public.study_commons_users(last_seen desc);
create index if not exists idx_study_commons_users_is_active on public.study_commons_users(is_active);

-- Enable real-time subscriptions for Study Commons
alter publication supabase_realtime add table public.study_commons_messages;
alter publication supabase_realtime add table public.study_commons_users;