# SlowPour v2 — Setup Guide
*Everything is done in the browser. No Terminal required.*

v2 is a drop-in replacement for the whole repo. It keeps your existing
database, images, GitHub Actions workflow, and secrets — nothing about
the deploy pipeline changes.

---

## What's new in v2 (the short version)

- **Dark "candlelight" theme** across the app and projection display
- **The Pour** — scores and progress shown as glasses filling with amber
- **Instant stage sync** — guests' phones update the moment you advance (realtime, not 10s polling)
- **Real security** — database locked down with RLS; admin uses a proper Supabase login
- **Bug fixes** — stage arrows can now reach Final Results; no more write-per-keystroke
- **Custom icon set** replacing all emoji; self-hosted fonts (no Google Fonts request)
- **Device identity** — two guests with the same name no longer overwrite each other
- **Image share card** — final results share as a picture, not text
- **Skeleton loading, error states, error boundary, CSV export, pre-night checklist, PWA icon**
- Navigation is now 4 tabs: **Home · Whiskeys · Tonight · Results**
  (Format + Info merged into Tonight; the Mystery Dram is a sealed card on the Whiskeys page)

---

## Step 1 — Run the database setup (5 minutes)

1. Open your Supabase project → **SQL Editor** → **New query**
2. Open `supabase-setup.sql` from this zip, copy ALL of it, paste, click **Run**
3. You should see "Success". Any "already exists / already member" notices are fine.

This adds the `device_id` column, switches on realtime for stage changes,
and — most importantly — locks the database down so only you can modify
whiskeys, event state, or delete ratings.

## Step 2 — Create your host login (2 minutes)

The old shared password is retired (it was visible in the public repo).

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**
2. Enter your email and a strong **new** password
3. Tick **Auto Confirm User**, then create

That email + password is what `/#/admin` now asks for. Your login stays
remembered on your phone/laptop, so you won't be typing it on the night.

## Step 3 — Upload v2 to GitHub (10 minutes)

The zip mirrors the repo layout. In the GitHub website:

1. Go to your **SlowPour** repo
2. Delete the old `src` folder (open it → "..." menu → Delete directory → commit)
3. **Add file → Upload files** and drag in everything from the zip EXCEPT
   the `.github` folder (your existing workflow is unchanged — leave it be)
   - That's: `src/`, `public/`, `index.html`, `package.json`,
     `package-lock.json`, `tailwind.config.js`, `vite.config.js`,
     `postcss.config.js`, `supabase-setup.sql`, `SETUP-V2.md`
4. Commit. GitHub Actions builds and deploys automatically as before.

> Tip: keep a zip of your current repo first, as usual — instant rollback
> if anything looks off.

## Step 4 — Check it works (2 minutes)

- Open the app → it should be dark with the gold wordmark
- Open `/#/admin` → sign in with your new email + password
- Change the stage → watch a second device update **instantly**
- Try the stage **arrows** all the way to Final Results (this was broken in v1)

---

## Things worth knowing

**Your logo** — v2 ships with a built-in SVG wordmark, so the dependency on
Base44's image CDN is gone. If you'd rather use your PNG logo: upload it to
`src/assets/logo.png` and edit `src/components/shared/Logo.jsx` — the swap
is described in a comment at the top of that file.

**QR code** — now generated inside the app (no api.qrserver.com dependency).

**Old ratings** — any ratings from previous nights still display fine. New
ratings carry a device ID; old ones fall back to name matching.

**CSV export** — in the admin panel next to "Live Ratings". Use it before
clearing ratings if you want a record of the night.

**Add to Home Screen** — guests who add the app to their home screen now
get a proper gold-glass icon and standalone app feel.

**If sign-in fails on the night** — the most common cause is the user not
being confirmed: Supabase → Authentication → Users → your user → confirm.

Sláinte 🥃
