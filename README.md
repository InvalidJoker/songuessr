# Songuessr

Guess the song from a short audio snippet before you run out of tries — with a daily challenge everyone shares, an unlimited practice mode, and custom playlists you can build, import, and compete on with friends.

Inspired by [Songless](https://lessgames.com/songless) / Heardle-style games, built from scratch on SvelteKit + Postgres.

## How it works

Each round plays a growing snippet of a song — 1s, 2s, 4s, 7s, 11s, then 16s — and you get one guess per snippet length (6 tries total). Guess right early for a better score, or skip to unlock more of the track.

## Modes

- **Daily** — one song a day, the same for everyone, once per browser. Streaks, win rate, and a Wordle-style share card.
- **Hits** — unlimited rounds pulled from a curated pool of ~1,300 tracks across 14 genres (built from Deezer's public charts).
- **Playlists** — build your own pool of songs and play it solo or with friends:
  - **Import** a Spotify playlist, an entire Spotify artist's catalog, or a YouTube playlist. Tracks are matched to playable audio automatically.
  - **Create manually** by searching and adding songs one by one.
  - Every playlist gets its own leaderboard.
  - **Challenge a friend** — generates a fixed 5-song set and a shareable link; you and a friend each play it independently and compare scores.
- **Leaderboard** — global rankings by Daily streak and Hits best streak, plus per-playlist boards.
- **Accounts** — sign in to keep stats across devices and appear on leaderboards. Everything also works fully anonymously via local storage (except playlists and challenges, which need an account).

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) 2 + [Svelte 5](https://svelte.dev/docs/svelte) (runes), [Tailwind CSS](https://tailwindcss.com/) 4
- [Postgres](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/) for email/password accounts and sessions
- [Deezer](https://developers.deezer.com/api) for all audio playback (30s previews) and track metadata — no audio is ever hosted by this app
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) and [YouTube Data API v3](https://developers.google.com/youtube/v3) (optional) for importing external playlists/artists

## Getting started

### 1. Install dependencies

```sh
bun install   # or npm install / pnpm install
```

### 2. Configure environment

```sh
cp .env.example .env
```

Fill in:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Defaults to the local Docker Postgres below |
| `ORIGIN` | Yes | e.g. `http://localhost:5173` in dev |
| `BETTER_AUTH_SECRET` | Yes | Any high-entropy string; generate one with `openssl rand -hex 32` |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Optional | Enables Spotify playlist/artist import. Create a [Spotify app](https://developer.spotify.com/dashboard) (client-credentials only, no user OAuth needed) |
| `YOUTUBE_API_KEY` | Optional | Enables YouTube playlist import. Create an API key in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with the YouTube Data API v3 enabled |

Without the Spotify/YouTube keys, everything else works normally — importing just shows a clear "not configured" message.

### 3. Start Postgres

```sh
npm run db:start   # docker compose up
```

### 4. Set up the database

```sh
npm run auth:schema   # generates Better Auth's tables (user, session, account, verification)
npm run db:push        # pushes the full schema to Postgres
```

### 5. Run the dev server

```sh
npm run dev -- --open
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run preview` | Production build / preview |
| `npm run check` | Type-check (svelte-check) |
| `npm run lint` / `npm run format` | Prettier + ESLint |
| `npm run db:studio` | Open Drizzle Studio to browse the database |
| `npm run db:push` | Push schema changes to Postgres |
| `node scripts/build-pool.mjs` | Regenerate the built-in Daily/Hits song pool from Deezer's charts |

## Project structure

```
src/lib/server/
  deezer.ts              Deezer search/track/preview lookups
  pool.ts, rounds.ts      Daily/Hits round selection + in-memory round state
  matching.ts             Guess correctness (handles Deezer's duplicate catalog entries)
  auth.ts                 Better Auth config
  db/                      Drizzle schema + query helpers (stats, playlists, challenges)
  import/                  Spotify & YouTube fetchers, Deezer matching, import orchestration

src/routes/
  daily/, hits/            Core game modes
  playlists/, challenge/   Custom playlists, imports, and friend challenges
  profile/, leaderboard/   Accounts and rankings
  api/                     JSON endpoints backing all of the above
```

## A note on audio & licensing

No song audio is stored or rehosted by this app. Every snippet streams live from Deezer's CDN via their public API, and playback is always capped to short preview clips — the same approach used by the games that inspired this project.
