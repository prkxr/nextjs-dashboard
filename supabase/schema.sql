-- Supabase schema for multi-tenant invoicing app
-- Run this in your Supabase project's SQL editor.

-- Enable UUID extension (if not already enabled in your project)
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- AUTH-LINKED PROFILE
--------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- CUSTOMERS (OWNED BY A USER)
--------------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  image_url text,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- INVOICES (OWNED BY A USER, LINKED TO A CUSTOMER)
--------------------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount_cents integer not null,
  status text not null check (status in ('pending', 'paid')),
  date date not null default (now()::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- INVOICE COMMENTS
--------------------------------------------------------------------------------
create table if not exists public.invoice_comments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- REVENUE (GLOBAL SAMPLE DATA)
--------------------------------------------------------------------------------
create table if not exists public.revenue (
  month text primary key,
  revenue integer not null
);

--------------------------------------------------------------------------------
-- INDEXES
--------------------------------------------------------------------------------
create index if not exists customers_owner_id_idx on public.customers (owner_id);
create index if not exists invoices_owner_id_idx on public.invoices (owner_id);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_date_idx on public.invoices (date);
create index if not exists invoice_comments_invoice_id_idx on public.invoice_comments (invoice_id);
create index if not exists invoice_comments_author_id_idx on public.invoice_comments (author_id);

--------------------------------------------------------------------------------
-- ROW-LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_comments enable row level security;

-- PROFILES: each user can see and insert only their own profile row
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Profiles are insertable by owner" ON public.profiles;
CREATE POLICY "Profiles are insertable by owner"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

--------------------------------------------------------------------------------
-- CUSTOMERS POLICIES
--------------------------------------------------------------------------------
-- A user can manage only their own customers.
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
CREATE POLICY "Users can view their own customers"
  ON public.customers
  FOR SELECT
  USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
CREATE POLICY "Users can insert their own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
CREATE POLICY "Users can update their own customers"
  ON public.customers
  FOR UPDATE
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
CREATE POLICY "Users can delete their own customers"
  ON public.customers
  FOR DELETE
  USING (owner_id = (SELECT auth.uid()));

--------------------------------------------------------------------------------
-- INVOICES POLICIES
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices"
  ON public.invoices
  FOR SELECT
  USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
CREATE POLICY "Users can insert their own invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
CREATE POLICY "Users can update their own invoices"
  ON public.invoices
  FOR UPDATE
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
CREATE POLICY "Users can delete their own invoices"
  ON public.invoices
  FOR DELETE
  USING (owner_id = (SELECT auth.uid()));

--------------------------------------------------------------------------------
-- INVOICE COMMENTS POLICIES
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view comments on their invoices" ON public.invoice_comments;
CREATE POLICY "Users can view comments on their invoices"
  ON public.invoice_comments
  FOR SELECT
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_comments.invoice_id
        AND i.owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert comments on their invoices" ON public.invoice_comments;
CREATE POLICY "Users can insert comments on their invoices"
  ON public.invoice_comments
  FOR INSERT
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_comments.invoice_id
        AND i.owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments or comments on their invoices" ON public.invoice_comments;
CREATE POLICY "Users can update their own comments or comments on their invoices"
  ON public.invoice_comments
  FOR UPDATE
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_comments.invoice_id
        AND i.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_comments.invoice_id
        AND i.owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own comments or comments on their invoices" ON public.invoice_comments;
CREATE POLICY "Users can delete their own comments or comments on their invoices"
  ON public.invoice_comments
  FOR DELETE
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_comments.invoice_id
        AND i.owner_id = (SELECT auth.uid())
    )
  );