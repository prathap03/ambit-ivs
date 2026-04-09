-- ============================================================
-- Ambit IVS IAM Migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Profiles table — extends Supabase auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'user'
                check (role in ('super_admin', 'user')),
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Super admins can see all profiles; users can only see their own
create policy "profiles_select" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_manage_super" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- 2. Per-bank user access
create table if not exists public.user_bank_access (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  bank_id    uuid not null references public.banks(id) on delete cascade,
  role       text not null default 'viewer'
               check (role in ('admin', 'viewer')),
  created_at timestamptz default now(),
  unique (user_id, bank_id)
);

alter table public.user_bank_access enable row level security;

-- Users can see their own access rows; super admins can see all
create policy "uba_select" on public.user_bank_access
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "uba_manage_super" on public.user_bank_access
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- 3. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. RLS on banks — super_admins see all, users see only their assigned banks
alter table public.banks enable row level security;

create policy "banks_super_admin" on public.banks
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "banks_user_access" on public.banks
  for select using (
    exists (
      select 1 from public.user_bank_access uba
      where uba.user_id = auth.uid() and uba.bank_id = banks.id
    )
  );

-- 5. RLS on invoices
alter table public.invoices enable row level security;

create policy "invoices_super_admin" on public.invoices
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "invoices_user_read" on public.invoices
  for select using (
    exists (
      select 1
      from public.user_bank_access uba
      join public.banks b on b.id = uba.bank_id
      where uba.user_id = auth.uid()
        and b.bank_name = invoices.bank_company_name
    )
  );

create policy "invoices_bank_admin_write" on public.invoices
  for all using (
    exists (
      select 1
      from public.user_bank_access uba
      join public.banks b on b.id = uba.bank_id
      where uba.user_id = auth.uid()
        and uba.role = 'admin'
        and b.bank_name = invoices.bank_company_name
    )
  );
