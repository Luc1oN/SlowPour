-- ═══════════════════════════════════════════════════════════════
-- THE SLOW POUR — marketing site tables
-- Project: Command Centre (shared with Cashflow + PracticePal)
-- Tables are prefixed slowpour_ to match practicepal_sessions.
-- Nothing here touches whiskeys / ratings / event_state.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. MAILING LIST
-- ─────────────────────────────────────────────
create table if not exists public.slowpour_signups (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  pour_request text,
  source       text not null default 'website',
  created_at   timestamptz not null default now()
);

-- One row per person, case-insensitive so Shane@ and shane@ are the same
create unique index if not exists slowpour_signups_email_key
  on public.slowpour_signups (lower(email));

alter table public.slowpour_signups
  drop constraint if exists slowpour_signups_email_check;
alter table public.slowpour_signups
  add constraint slowpour_signups_email_check
  check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and length(email) <= 254);

alter table public.slowpour_signups
  drop constraint if exists slowpour_signups_pour_check;
alter table public.slowpour_signups
  add constraint slowpour_signups_pour_check
  check (pour_request is null or length(pour_request) <= 500);

-- Column-level grants: the public key can ONLY write these two columns.
-- No select grant at all, so the list cannot be read with the anon key.
revoke all on public.slowpour_signups from anon;
grant insert (email, pour_request) on public.slowpour_signups to anon;
grant all on public.slowpour_signups to authenticated;

alter table public.slowpour_signups enable row level security;

drop policy if exists "anyone can join the list" on public.slowpour_signups;
create policy "anyone can join the list" on public.slowpour_signups
  for insert to anon, authenticated with check (true);

drop policy if exists "host reads the list" on public.slowpour_signups;
create policy "host reads the list" on public.slowpour_signups
  for select to authenticated using (true);

drop policy if exists "host manages the list" on public.slowpour_signups;
create policy "host manages the list" on public.slowpour_signups
  for delete to authenticated using (true);

comment on table  public.slowpour_signups is 'Website mailing list. Read it in Table Editor while signed in.';
comment on column public.slowpour_signups.pour_request is 'Optional: what the person would like poured. This is the market research.';

-- ─────────────────────────────────────────────
-- 2. EVENTS
-- ─────────────────────────────────────────────
create table if not exists public.slowpour_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text,
  event_date  date not null,
  start_time  text,
  venue       text,
  description text,
  lineup      text,
  price       numeric(8,2),
  capacity    integer,
  sold_out    boolean not null default false,
  booking_url text,
  image_url   text,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists slowpour_events_date_idx
  on public.slowpour_events (event_date desc);

alter table public.slowpour_events enable row level security;

-- Unpublished events are invisible to the public, so a half-written
-- event can sit in the table safely until it's ready.
drop policy if exists "public reads published events" on public.slowpour_events;
create policy "public reads published events" on public.slowpour_events
  for select to anon, authenticated using (published = true);

drop policy if exists "host writes events" on public.slowpour_events;
create policy "host writes events" on public.slowpour_events
  for all to authenticated using (true) with check (true);

-- These comments appear as tooltips in the Supabase Table Editor.
comment on column public.slowpour_events.category    is 'Whiskey, Wine, Beer, Mead, Gin... free text, shown as a small label.';
comment on column public.slowpour_events.event_date  is 'Upcoming vs past is worked out from this date. Nothing else to set.';
comment on column public.slowpour_events.start_time  is 'Free text, e.g. 7:30pm. Leave blank to hide.';
comment on column public.slowpour_events.lineup      is 'What was poured. One per line. Leave blank to hide.';
comment on column public.slowpour_events.price       is 'Just the number, e.g. 55. Euro sign is added by the site.';
comment on column public.slowpour_events.booking_url is 'Leave blank and the site shows the email signup instead of a broken button.';
comment on column public.slowpour_events.published   is 'Tick this to make the event visible on the website.';

-- ─────────────────────────────────────────────
-- 3. SEED — the first night (21 Aug 2026)
-- Guarded, so re-running this file never duplicates it.
-- ─────────────────────────────────────────────
insert into public.slowpour_events
  (title, category, event_date, venue, description, lineup, price, capacity, published)
select
  'The First One',
  'Whiskey',
  date '2026-08-21',
  'Cobh, Co. Cork',
  'Twelve people, four pours and a charcuterie board in the middle. Some had never tried a whiskey; some knew a fair bit. Everyone left having found one they liked.',
  E'Midleton Very Rare 2026\nRedbreast Cask Strength\nMacallan 12 Sherry Oak\nLagavulin 16',
  55,
  12,
  true
where not exists (
  select 1 from public.slowpour_events where event_date = date '2026-08-21'
);
