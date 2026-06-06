# SlowPour – Setup Guide

## 1. Supabase — Run this SQL

Go to your Supabase project → SQL Editor → paste and run:

```sql
-- Whiskeys table
create table whiskeys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  distillery text,
  age text,
  abv text,
  type text,
  cask_type text,
  description text,
  nose text,
  palate text,
  finish text,
  image_url text,
  round_number integer default 1,
  is_mystery boolean default false,
  is_centrepiece boolean default false,
  mystery_reason text,
  created_at timestamptz default now()
);

-- Ratings table
create table ratings (
  id uuid primary key default gen_random_uuid(),
  whiskey_id uuid references whiskeys(id) on delete cascade,
  user_name text not null,
  smash_or_pass text check (smash_or_pass in ('smash', 'pass')),
  score integer check (score between 1 and 10),
  flavour_tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

-- Event state table (single row)
create table event_state (
  id uuid primary key default gen_random_uuid(),
  current_stage integer default 0,
  mystery_revealed boolean default false,
  votes_locked boolean default false,
  event_date text,
  event_location text,
  created_at timestamptz default now()
);

-- Enable Row Level Security but allow all for anon (public app)
alter table whiskeys enable row level security;
alter table ratings enable row level security;
alter table event_state enable row level security;

create policy "Public read whiskeys" on whiskeys for select using (true);
create policy "Public insert whiskeys" on whiskeys for insert with check (true);
create policy "Public update whiskeys" on whiskeys for update using (true);
create policy "Public delete whiskeys" on whiskeys for delete using (true);

create policy "Public read ratings" on ratings for select using (true);
create policy "Public insert ratings" on ratings for insert with check (true);
create policy "Public update ratings" on ratings for update using (true);
create policy "Public delete ratings" on ratings for delete using (true);

create policy "Public read event_state" on event_state for select using (true);
create policy "Public insert event_state" on event_state for insert with check (true);
create policy "Public update event_state" on event_state for update using (true);
```

## 2. Supabase Storage — Create a bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `whiskey-images`
3. Set it to **Public**
4. Under Policies, add a policy to allow public uploads (insert)

## 3. GitHub

```bash
git init
git add .
git commit -m "Initial SlowPour setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SlowPour.git
git push -u origin main
```

## 4. Netlify

1. Connect your GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL` = your supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Deploy

## 5. Access the admin

Go to `/admin` on your deployed URL. That's your host control panel.
