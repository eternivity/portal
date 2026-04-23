-- PortalKit initial Supabase schema
-- Database, auth-linked profiles, storage metadata, realtime tables, and RLS.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique not null,
  avatar_url text,
  subdomain text unique,
  brand_color text default '#534AB7' not null,
  plan text default 'starter' not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarding_complete boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint profiles_plan_check check (plan in ('starter', 'pro', 'agency')),
  constraint profiles_brand_color_check check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint profiles_subdomain_check check (
    subdomain is null or subdomain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
  )
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint clients_email_check check (position('@' in email) > 1)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text,
  slug text unique not null,
  status text default 'active' not null,
  color text default '#534AB7' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint projects_status_check check (status in ('active', 'review', 'completed', 'archived')),
  constraint projects_color_check check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint projects_slug_check check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,80}[a-z0-9])?$')
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size integer,
  file_type text,
  approval_status text default 'pending' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint files_file_size_check check (file_size is null or file_size >= 0),
  constraint files_file_type_check check (
    file_type is null or file_type in ('pdf', 'png', 'jpg', 'jpeg', 'zip', 'docx', 'xlsx', 'mp4')
  ),
  constraint files_approval_status_check check (approval_status in ('pending', 'approved', 'changes_requested'))
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_number text unique not null,
  line_items jsonb not null,
  subtotal numeric(12, 2) not null,
  tax_rate numeric(5, 2) default 0 not null,
  total numeric(12, 2) not null,
  currency text default 'USD' not null,
  status text default 'draft' not null,
  due_date date,
  stripe_payment_link text,
  viewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint invoices_line_items_array_check check (jsonb_typeof(line_items) = 'array'),
  constraint invoices_subtotal_check check (subtotal >= 0),
  constraint invoices_tax_rate_check check (tax_rate >= 0),
  constraint invoices_total_check check (total >= 0),
  constraint invoices_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint invoices_status_check check (status in ('draft', 'sent', 'viewed', 'paid'))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_role text not null,
  sender_name text,
  content text not null,
  created_at timestamptz default now() not null,
  constraint messages_sender_role_check check (sender_role in ('freelancer', 'client')),
  constraint messages_sender_check check (
    (sender_role = 'freelancer' and sender_id is not null)
    or (sender_role = 'client' and sender_id is null)
  )
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid unique not null references public.projects(id) on delete cascade,
  content_html text not null,
  freelancer_signed_at timestamptz,
  client_signed_at timestamptz,
  client_signature_name text,
  client_signature_token text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists profiles_subdomain_idx on public.profiles(subdomain);
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
create index if not exists clients_freelancer_id_idx on public.clients(freelancer_id);
create index if not exists clients_email_idx on public.clients(email);
create index if not exists projects_freelancer_id_idx on public.projects(freelancer_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists projects_slug_idx on public.projects(slug);
create index if not exists files_project_id_idx on public.files(project_id);
create index if not exists files_uploaded_by_idx on public.files(uploaded_by);
create index if not exists invoices_project_id_idx on public.invoices(project_id);
create index if not exists invoices_freelancer_id_idx on public.invoices(freelancer_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_status_idx on public.invoices(status);
create index if not exists messages_project_id_created_at_idx on public.messages(project_id, created_at);
create index if not exists contracts_client_signature_token_idx on public.contracts(client_signature_token);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger files_set_updated_at
before update on public.files
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.files enable row level security;
alter table public.invoices enable row level security;
alter table public.messages enable row level security;
alter table public.contracts enable row level security;

create policy "Profiles are readable by owner"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Profiles are insertable by owner"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Freelancers manage own clients"
on public.clients for all
to authenticated
using (auth.uid() = freelancer_id)
with check (auth.uid() = freelancer_id);

create policy "Freelancers manage own projects"
on public.projects for all
to authenticated
using (auth.uid() = freelancer_id)
with check (
  auth.uid() = freelancer_id
  and exists (
    select 1
    from public.clients
    where clients.id = projects.client_id
      and clients.freelancer_id = auth.uid()
  )
);

create policy "Freelancers manage project files"
on public.files for all
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = files.project_id
      and projects.freelancer_id = auth.uid()
  )
)
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.projects
    where projects.id = files.project_id
      and projects.freelancer_id = auth.uid()
  )
);

create policy "Freelancers manage own invoices"
on public.invoices for all
to authenticated
using (auth.uid() = freelancer_id)
with check (
  auth.uid() = freelancer_id
  and exists (
    select 1
    from public.projects
    where projects.id = invoices.project_id
      and projects.freelancer_id = auth.uid()
      and projects.client_id = invoices.client_id
  )
);

create policy "Freelancers manage project messages"
on public.messages for all
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = messages.project_id
      and projects.freelancer_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = messages.project_id
      and projects.freelancer_id = auth.uid()
  )
);

create policy "Freelancers manage project contracts"
on public.contracts for all
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = contracts.project_id
      and projects.freelancer_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = contracts.project_id
      and projects.freelancer_id = auth.uid()
  )
);

-- Client-facing portal reads should be served through server-side code or RPCs
-- that validate project slugs or signature tokens. Keep anonymous table access
-- closed by default.

alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.files;
alter publication supabase_realtime add table public.invoices;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.contracts;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-files',
  'portal-files',
  false,
  104857600,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Freelancers read own storage objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'portal-files'
  and exists (
    select 1
    from public.files
    join public.projects on projects.id = files.project_id
    where files.file_url = storage.objects.name
      and projects.freelancer_id = auth.uid()
  )
);

create policy "Freelancers upload own storage objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Freelancers update own storage objects"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Freelancers delete own storage objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
