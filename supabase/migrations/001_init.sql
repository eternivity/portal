-- PortalKit initial schema
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

-- Helpers --------------------------------------------------------------------

create or replace function public.slugify(value text)
returns text
language plpgsql
immutable
as $$
declare
  result text;
begin
  result := lower(trim(value));
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := regexp_replace(result, '(^-|-$)', '', 'g');
  return coalesce(nullif(result, ''), 'project');
end;
$$;

create or replace function public.generate_unique_project_slug(project_title text)
returns text
language plpgsql
as $$
declare
  base_slug text := public.slugify(project_title);
  candidate text := base_slug;
  suffix integer := 1;
begin
  while exists(select 1 from public.projects where slug = candidate) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  end loop;

  return candidate;
end;
$$;

-- Tables ---------------------------------------------------------------------

create table public.profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text unique not null,
  avatar_url text,
  subdomain text unique,
  brand_color text default '#534AB7',
  plan text default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  constraint profiles_plan_check check (plan in ('starter', 'pro', 'agency'))
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid references public.profiles not null,
  name text not null,
  email text not null,
  company text,
  created_at timestamptz default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid references public.profiles not null,
  client_id uuid references public.clients not null,
  title text not null,
  description text,
  slug text unique not null,
  status text default 'active',
  color text default '#534AB7',
  created_at timestamptz default now(),
  constraint projects_status_check check (status in ('active', 'review', 'completed', 'archived'))
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  uploaded_by uuid references public.profiles not null,
  file_name text not null,
  file_url text not null,
  file_size integer,
  file_type text,
  approval_status text default 'pending',
  created_at timestamptz default now(),
  constraint files_file_type_check check (
    file_type is null or file_type in ('pdf', 'png', 'jpg', 'zip', 'docx', 'xlsx', 'mp4')
  ),
  constraint files_approval_status_check check (approval_status in ('pending', 'approved', 'changes_requested'))
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  freelancer_id uuid references public.profiles not null,
  client_id uuid references public.clients not null,
  invoice_number text unique not null,
  line_items jsonb not null,
  subtotal numeric not null,
  tax_rate numeric default 0,
  total numeric not null,
  currency text default 'USD',
  status text default 'draft',
  due_date date,
  stripe_payment_link text,
  viewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now(),
  constraint invoices_status_check check (status in ('draft', 'sent', 'viewed', 'paid')),
  constraint invoices_line_items_check check (jsonb_typeof(line_items) = 'array')
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  sender_id uuid,
  sender_role text not null,
  sender_name text,
  content text not null,
  created_at timestamptz default now(),
  constraint messages_sender_role_check check (sender_role in ('freelancer', 'client'))
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects unique not null,
  content_html text not null,
  freelancer_signed_at timestamptz,
  client_signed_at timestamptz,
  client_signature_name text,
  client_signature_token text unique
);

create table public.portal_tokens (
  token text primary key,
  project_id uuid references public.projects not null,
  freelancer_id uuid references public.profiles not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Indexes --------------------------------------------------------------------

create index clients_freelancer_id_idx on public.clients(freelancer_id);
create index projects_freelancer_id_idx on public.projects(freelancer_id);
create index projects_client_id_idx on public.projects(client_id);
create index projects_slug_idx on public.projects(slug);
create index files_project_id_idx on public.files(project_id);
create index files_uploaded_by_idx on public.files(uploaded_by);
create index invoices_project_id_idx on public.invoices(project_id);
create index invoices_freelancer_id_idx on public.invoices(freelancer_id);
create index invoices_client_id_idx on public.invoices(client_id);
create index messages_project_id_idx on public.messages(project_id);
create index contracts_project_id_idx on public.contracts(project_id);
create index portal_tokens_project_id_idx on public.portal_tokens(project_id);
create index portal_tokens_freelancer_id_idx on public.portal_tokens(freelancer_id);
create index portal_tokens_expires_at_idx on public.portal_tokens(expires_at);

-- Portal token verification ---------------------------------------------------
-- Use from a server-side API route. Do not expose portal reads through anon RLS.

create or replace function public.verify_portal_token(token text, project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portal_tokens
    where portal_tokens.token = verify_portal_token.token
      and portal_tokens.project_id = verify_portal_token.project_id
      and portal_tokens.expires_at > now()
  );
$$;

-- Triggers -------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_project_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := public.generate_unique_project_slug(new.title);
  else
    new.slug := public.generate_unique_project_slug(new.slug);
  end if;

  return new;
end;
$$;

create trigger before_project_insert_set_slug
before insert on public.projects
for each row execute function public.set_project_slug();

create or replace function public.set_invoice_number()
returns trigger
language plpgsql
as $$
declare
  invoice_year text := to_char(now(), 'YYYY');
  next_number integer;
begin
  if new.invoice_number is not null and trim(new.invoice_number) <> '' then
    return new;
  end if;

  select count(*) + 1
  into next_number
  from public.invoices
  where freelancer_id = new.freelancer_id
    and invoice_number like 'INV-' || invoice_year || '-%';

  new.invoice_number := 'INV-' || invoice_year || '-' || lpad(next_number::text, 3, '0');

  while exists(select 1 from public.invoices where invoice_number = new.invoice_number) loop
    next_number := next_number + 1;
    new.invoice_number := 'INV-' || invoice_year || '-' || lpad(next_number::text, 3, '0');
  end loop;

  return new;
end;
$$;

create trigger before_invoice_insert_set_number
before insert on public.invoices
for each row execute function public.set_invoice_number();

-- Row level security ----------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.files enable row level security;
alter table public.invoices enable row level security;
alter table public.messages enable row level security;
alter table public.contracts enable row level security;
alter table public.portal_tokens enable row level security;

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Freelancers can manage own clients"
on public.clients for all
to authenticated
using (freelancer_id = auth.uid())
with check (freelancer_id = auth.uid());

create policy "Freelancers can manage own projects"
on public.projects for all
to authenticated
using (freelancer_id = auth.uid())
with check (freelancer_id = auth.uid());

create policy "Freelancers can manage own files"
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
  exists (
    select 1
    from public.projects
    where projects.id = files.project_id
      and projects.freelancer_id = auth.uid()
  )
);

create policy "Freelancers can manage own invoices"
on public.invoices for all
to authenticated
using (freelancer_id = auth.uid())
with check (freelancer_id = auth.uid());

create policy "Freelancers can manage own messages"
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

create policy "Freelancers can manage own contracts"
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

create policy "Freelancers can manage own portal tokens"
on public.portal_tokens for all
to authenticated
using (freelancer_id = auth.uid())
with check (freelancer_id = auth.uid());
