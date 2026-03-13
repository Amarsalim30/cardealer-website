alter table public.admin_profiles
add column if not exists role text not null default 'admin'
check (role in ('owner', 'admin'));

update public.admin_profiles
set role = 'owner'
where user_id = (
  select user_id
  from public.admin_profiles
  order by created_at asc
  limit 1
)
and not exists (
  select 1
  from public.admin_profiles
  where role = 'owner'
);

create or replace function public.is_owner(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = uid
      and role = 'owner'
  );
$$;

drop policy if exists "admin manage profiles" on public.admin_profiles;
drop policy if exists "admins read own profile" on public.admin_profiles;

create policy "admins read own profile"
on public.admin_profiles
for select
using (auth.uid() = user_id);

create policy "owner manage profiles"
on public.admin_profiles
for all
using (public.is_owner(auth.uid()))
with check (public.is_owner(auth.uid()));
