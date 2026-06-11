-- ═══════════════════════════════════════════════════════════════
-- THE SLOW POUR v2 — Supabase setup
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- (Paste the whole file and click Run. "already exists" notices
--  for any step are fine — they mean it was already done.)
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Device identity column ───────────────────────────────────
-- Fixes the "two Daves" problem: ratings are now tied to a device,
-- with names kept for display only.
alter table public.ratings add column if not exists device_id text;

-- ── 2. Enable realtime on event_state ──────────────────────────
-- Guests' phones now react instantly when the host changes stage.
-- (If you get "already member of publication", that's fine.)
do $$
begin
  alter publication supabase_realtime add table public.event_state;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.ratings;
exception when duplicate_object then null;
end $$;

-- ── 3. Row Level Security ───────────────────────────────────────
-- THE BIG ONE. Until now, anyone with the public anon key (i.e.
-- anyone who opens the app) could delete whiskeys or wipe ratings.
-- After this: guests can read everything and submit/edit ratings;
-- only the signed-in host can change whiskeys or event state.

alter table public.whiskeys     enable row level security;
alter table public.event_state  enable row level security;
alter table public.ratings      enable row level security;

-- Clean slate in case any policies exist
drop policy if exists "public read whiskeys"        on public.whiskeys;
drop policy if exists "host writes whiskeys"        on public.whiskeys;
drop policy if exists "public read event_state"     on public.event_state;
drop policy if exists "host writes event_state"     on public.event_state;
drop policy if exists "public read ratings"         on public.ratings;
drop policy if exists "guests insert ratings"       on public.ratings;
drop policy if exists "guests update ratings"       on public.ratings;
drop policy if exists "host deletes ratings"        on public.ratings;

-- Whiskeys: everyone reads, only the host writes
create policy "public read whiskeys" on public.whiskeys
  for select using (true);
create policy "host writes whiskeys" on public.whiskeys
  for all to authenticated using (true) with check (true);

-- Event state: everyone reads, only the host writes
create policy "public read event_state" on public.event_state
  for select using (true);
create policy "host writes event_state" on public.event_state
  for all to authenticated using (true) with check (true);

-- Ratings: everyone reads, guests can submit and edit,
-- only the host can delete
create policy "public read ratings" on public.ratings
  for select using (true);
create policy "guests insert ratings" on public.ratings
  for insert with check (true);
create policy "guests update ratings" on public.ratings
  for update using (true) with check (true);
create policy "host deletes ratings" on public.ratings
  for delete to authenticated using (true);

-- ── 4. Storage policies for bottle images ───────────────────────
drop policy if exists "public read whiskey images" on storage.objects;
drop policy if exists "host uploads whiskey images" on storage.objects;
drop policy if exists "host updates whiskey images" on storage.objects;

create policy "public read whiskey images" on storage.objects
  for select using (bucket_id = 'whiskey-images');
create policy "host uploads whiskey images" on storage.objects
  for insert to authenticated with check (bucket_id = 'whiskey-images');
create policy "host updates whiskey images" on storage.objects
  for update to authenticated using (bucket_id = 'whiskey-images');

-- ═══════════════════════════════════════════════════════════════
-- Done. Now create your host account:
-- Dashboard → Authentication → Users → Add user → Create new user
--   • your email + a strong NEW password (not the old one)
--   • tick "Auto Confirm User"
-- That email + password is what the /#/admin page now asks for.
-- ═══════════════════════════════════════════════════════════════
