create table if not exists public.lead_inbox_state (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('lead', 'test_drive', 'trade_in')),
  source_id uuid not null,
  status text not null check (status in ('new', 'contacted', 'follow_up', 'closed')),
  last_contacted_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_type, source_id)
);

create index if not exists lead_inbox_state_status_idx
on public.lead_inbox_state (status);

create index if not exists lead_inbox_state_updated_at_idx
on public.lead_inbox_state (updated_at desc);

alter table public.lead_inbox_state enable row level security;

drop policy if exists "admin manage lead inbox state" on public.lead_inbox_state;
create policy "admin manage lead inbox state"
on public.lead_inbox_state
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
