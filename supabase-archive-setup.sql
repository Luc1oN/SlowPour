-- ═══════════════════════════════════════════════════════════════
-- THE SLOW POUR — saving and clearing a night
-- Project: Command Centre (shared)
-- Already applied. Kept here as the record of what was run.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. WHERE SAVED NIGHTS LIVE
-- Guests' names and tasting notes are in here, so there is no public
-- policy at all — the anon key cannot read this table.
-- ─────────────────────────────────────────────
create table if not exists public.slowpour_night_archives (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  event_date     text,
  event_location text,
  archived_at    timestamptz not null default now(),
  whiskey_count  integer not null default 0,
  rating_count   integer not null default 0,
  taster_count   integer not null default 0,
  winner_name    text,
  winner_avg     numeric(4,2),
  standings      jsonb not null default '[]'::jsonb,
  payload        jsonb not null
);

create index if not exists slowpour_night_archives_at_idx
  on public.slowpour_night_archives (archived_at desc);

alter table public.slowpour_night_archives enable row level security;

drop policy if exists "host manages archives" on public.slowpour_night_archives;
create policy "host manages archives" on public.slowpour_night_archives
  for all to authenticated using (true) with check (true);

revoke all on public.slowpour_night_archives from anon;
grant all on public.slowpour_night_archives to authenticated;

-- ─────────────────────────────────────────────
-- 2. THE event_state FIX
--
-- The app reads the night's settings with "take the first row". Six rows
-- had accumulated, with conflicting values — one said stage 9 with votes
-- locked, the others said stage 1, not started. Postgres makes no promise
-- about which comes back first, so the live night could have flipped to
-- the wrong settings mid-event.
--
-- The six rows were copied into slowpour_event_state_backup first, then
-- five were deleted, then this index made a seventh impossible.
-- ─────────────────────────────────────────────
create table if not exists public.slowpour_event_state_backup (
  id           uuid primary key default gen_random_uuid(),
  backed_up_at timestamptz not null default now(),
  reason       text,
  rows         jsonb not null
);
alter table public.slowpour_event_state_backup enable row level security;
revoke all on public.slowpour_event_state_backup from anon;
grant all on public.slowpour_event_state_backup to authenticated;
drop policy if exists "host reads backup" on public.slowpour_event_state_backup;
create policy "host reads backup" on public.slowpour_event_state_backup
  for all to authenticated using (true) with check (true);

-- A unique index on a constant means the table can hold exactly one row.
create unique index if not exists event_state_singleton
  on public.event_state ((true));

-- ─────────────────────────────────────────────
-- 3. SAVE THE NIGHT
-- Everything in one statement, so a night can never be half-saved.
-- ─────────────────────────────────────────────
create or replace function public.archive_current_night(
  p_title              text,
  p_event_date         date default current_date,
  p_create_event_draft boolean default true
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $fn$
declare
  v_state      public.event_state%rowtype;
  v_whiskeys   jsonb;
  v_ratings    jsonb;
  v_standings  jsonb;
  v_winner     text;
  v_winner_avg numeric;
  v_tasters    integer;
  v_archive_id uuid;
  v_event_id   uuid;
  v_lineup     text;
begin
  if coalesce(trim(p_title), '') = '' then
    raise exception 'Give the night a name before archiving it.';
  end if;

  select * into v_state from public.event_state limit 1;

  select coalesce(jsonb_agg(to_jsonb(w) order by w.round_number, w.name), '[]'::jsonb)
    into v_whiskeys from public.whiskeys w;

  select coalesce(jsonb_agg(to_jsonb(r) order by r.created_at), '[]'::jsonb)
    into v_ratings from public.ratings r;

  if jsonb_array_length(v_whiskeys) = 0 and jsonb_array_length(v_ratings) = 0 then
    raise exception 'There is nothing to archive — no whiskeys and no ratings.';
  end if;

  select count(distinct coalesce(device_id, user_name)) into v_tasters from public.ratings;

  select coalesce(jsonb_agg(s order by ord), '[]'::jsonb) into v_standings
  from (
    select
      row_number() over (order by avg(r.score) desc nulls last, w.name) as ord,
      jsonb_build_object(
        'whiskey_id',   w.id,
        'name',         w.name,
        'distillery',   w.distillery,
        'is_mystery',   w.is_mystery,
        'round_number', w.round_number,
        'avg_score',    round(avg(r.score)::numeric, 2),
        'votes',        count(r.score),
        'smash',        count(*) filter (where r.smash_or_pass = 'smash'),
        'pass',         count(*) filter (where r.smash_or_pass = 'pass')
      ) as s
    from public.whiskeys w
    left join public.ratings r on r.whiskey_id = w.id
    group by w.id, w.name, w.distillery, w.is_mystery, w.round_number
  ) t;

  v_winner     := v_standings->0->>'name';
  v_winner_avg := nullif(v_standings->0->>'avg_score', '')::numeric;

  insert into public.slowpour_night_archives (
    title, event_date, event_location, whiskey_count, rating_count,
    taster_count, winner_name, winner_avg, standings, payload
  ) values (
    trim(p_title), v_state.event_date, v_state.event_location,
    jsonb_array_length(v_whiskeys), jsonb_array_length(v_ratings),
    coalesce(v_tasters, 0), v_winner, v_winner_avg, v_standings,
    jsonb_build_object(
      'archived_at', now(),
      'event_state', to_jsonb(v_state),
      'whiskeys',    v_whiskeys,
      'ratings',     v_ratings
    )
  ) returning id into v_archive_id;

  -- Optional unpublished draft for the public events page. Carries the
  -- date, venue and lineup only — never a guest name or a score. The
  -- mystery dram is left out of the public lineup.
  if p_create_event_draft
     and not exists (select 1 from public.slowpour_events where event_date = p_event_date) then
    select string_agg(w->>'name', E'\n' order by (w->>'round_number')::int, w->>'name')
      into v_lineup
    from jsonb_array_elements(v_whiskeys) w
    where coalesce((w->>'is_mystery')::boolean, false) = false;

    insert into public.slowpour_events (title, category, event_date, venue, lineup, published)
    values (trim(p_title), 'Whiskey', p_event_date,
            nullif(trim(coalesce(v_state.event_location, '')), ''), v_lineup, false)
    returning id into v_event_id;
  end if;

  return jsonb_build_object(
    'archive_id',     v_archive_id,
    'event_draft_id', v_event_id,
    'whiskeys',       jsonb_array_length(v_whiskeys),
    'ratings',        jsonb_array_length(v_ratings),
    'tasters',        coalesce(v_tasters, 0),
    'winner',         v_winner
  );
end
$fn$;

revoke all on function public.archive_current_night(text, date, boolean) from public, anon;
grant execute on function public.archive_current_night(text, date, boolean) to authenticated;

-- ─────────────────────────────────────────────
-- 4. CLEAR THE NIGHT
-- Refuses unless the current data is already inside an archive.
-- ─────────────────────────────────────────────
create or replace function public.clear_current_night()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $fn$
declare
  v_last_archive timestamptz;
  v_last_rating  timestamptz;
  v_ratings      integer;
  v_whiskeys     integer;
begin
  select max(archived_at) into v_last_archive from public.slowpour_night_archives;
  select max(created_at)  into v_last_rating  from public.ratings;

  if v_last_archive is null then
    raise exception 'Archive the night before clearing it — nothing has been saved yet.';
  end if;

  if v_last_rating is not null and v_last_rating > v_last_archive then
    raise exception 'There are ratings newer than the last archive. Archive again before clearing.';
  end if;

  delete from public.ratings;  get diagnostics v_ratings  = row_count;
  delete from public.whiskeys; get diagnostics v_whiskeys = row_count;

  update public.event_state set
    current_stage    = 0,
    night_started    = false,
    votes_locked     = false,
    mystery_revealed = false;

  return jsonb_build_object('ratings_deleted', v_ratings, 'whiskeys_deleted', v_whiskeys);
end
$fn$;

revoke all on function public.clear_current_night() from public, anon;
grant execute on function public.clear_current_night() to authenticated;
