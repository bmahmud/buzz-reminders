-- Buzz Reminders Supabase schema
-- Run in Supabase SQL editor

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_emoji text default '🦊',
  created_at timestamptz default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null check (char_length(title) <= 80),
  description text check (char_length(description) <= 500),
  type text not null,
  priority text not null,
  due_at timestamptz not null,
  recurrence jsonb,
  alert_mode text not null,
  status text not null default 'pending',
  tags text[] default '{}',
  completed_at timestamptz,
  streak_count int,
  weekly_history boolean[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_settings (
  user_id uuid primary key references auth.users on delete cascade,
  notifications_enabled boolean default true,
  default_alert text default 'both',
  snooze_minutes int default 10,
  theme text default 'warm'
);

alter table profiles enable row level security;
alter table reminders enable row level security;
alter table user_settings enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "reminders_select_own" on reminders for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on reminders for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on reminders for update using (auth.uid() = user_id);
create policy "reminders_delete_own" on reminders for delete using (auth.uid() = user_id);

create policy "settings_select_own" on user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on user_settings for update using (auth.uid() = user_id);

create index if not exists reminders_user_updated_idx on reminders (user_id, updated_at desc);
