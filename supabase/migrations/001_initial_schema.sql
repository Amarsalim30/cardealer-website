create extension if not exists "pgcrypto";

create type public.vehicle_status as enum ('draft', 'published', 'sold', 'unpublished');
create type public.stock_category as enum (
  'new',
  'used',
  'imported',
  'available_for_importation',
  'traded_in'
);
create type public.lead_type as enum ('quote', 'contact', 'financing');

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line text not null,
  city text not null,
  phone text not null,
  email text,
  hours text not null,
  map_url text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  make text not null,
  model text not null,
  year integer not null,
  condition text not null,
  price numeric(12, 2) not null default 0,
  negotiable boolean not null default false,
  mileage integer not null default 0,
  transmission text not null,
  fuel_type text not null,
  drive_type text,
  body_type text,
  engine_capacity text,
  color text,
  location_id uuid references public.locations(id) on delete set null,
  featured boolean not null default false,
  status public.vehicle_status not null default 'draft',
  stock_category public.stock_category not null,
  description text not null,
  hero_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  cloudinary_public_id text,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_hero boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  lead_type public.lead_type not null,
  name text not null,
  phone text not null,
  email text,
  message text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create table public.test_drive_requests (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  preferred_date date,
  preferred_time text,
  message text,
  created_at timestamptz not null default now()
);

create table public.trade_in_requests (
  id uuid primary key default gen_random_uuid(),
  desired_vehicle_id uuid references public.vehicles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  current_vehicle_make text not null,
  current_vehicle_model text not null,
  current_vehicle_year integer not null,
  current_vehicle_mileage integer,
  condition_notes text,
  message text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating integer not null default 5,
  quote text not null,
  vehicle_label text,
  featured boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_vehicles_updated_at
before update on public.vehicles
for each row
execute function public.set_updated_at();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = uid
  );
$$;

alter table public.locations enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.leads enable row level security;
alter table public.test_drive_requests enable row level security;
alter table public.trade_in_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_profiles enable row level security;

create policy "public read locations"
on public.locations
for select
using (true);

create policy "public read reviews"
on public.reviews
for select
using (featured = true);

create policy "public read published vehicles"
on public.vehicles
for select
using (status = 'published');

create policy "public read published vehicle images"
on public.vehicle_images
for select
using (
  exists (
    select 1 from public.vehicles
    where public.vehicles.id = vehicle_id
      and public.vehicles.status = 'published'
  )
);

create policy "public insert leads"
on public.leads
for insert
with check (true);

create policy "public insert test drive requests"
on public.test_drive_requests
for insert
with check (true);

create policy "public insert trade in requests"
on public.trade_in_requests
for insert
with check (true);

create policy "admin manage locations"
on public.locations
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "admin manage vehicles"
on public.vehicles
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "admin manage vehicle images"
on public.vehicle_images
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "admin view leads"
on public.leads
for select
using (public.is_admin(auth.uid()));

create policy "admin view test drive requests"
on public.test_drive_requests
for select
using (public.is_admin(auth.uid()));

create policy "admin view trade in requests"
on public.trade_in_requests
for select
using (public.is_admin(auth.uid()));

create policy "admin manage reviews"
on public.reviews
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "admin manage profiles"
on public.admin_profiles
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
