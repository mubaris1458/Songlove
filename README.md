# Tamil Music (Melody Drive)

A Spotify/JioSaavn-style Tamil music streaming web app. Browse **Movie → Songs**, actors, search, favourites and playlists. Audio is streamed from Google Drive through a small server route (`/api/public/stream/:fileId`).

Built with TanStack Start, React 19, Tailwind CSS 4 and Nitro.

## Run locally

Requires Node.js 20+.

```sh
npm install
npm run dev        # http://localhost:3000
```

## Build and run in production

```sh
npm run build
npm start          # serves .output/ with Node
```

## Deploy

The app needs a **server** (the stream proxy), so GitHub Pages alone will not work. Any of these do:

- **Vercel / Netlify**: import the GitHub repo. Nitro detects the platform automatically. No settings needed.
- **Render / Railway / Fly.io / VPS**: build command `npm run build`, start command `npm start`.
- **Cloudflare**: build with `NITRO_PRESET=cloudflare-module npm run build`.

## Data

- `src/data/drive-catalog.json`: song catalogue (Drive file IDs, titles, movies).
- `src/data/catalog.ts`: turns the JSON into movies, actors and songs.
- Playlists and favourites are stored in the visitor's browser only. There is no database.
- `archive/tamilmusic-backup/`: older backup (full song list as CSV/JSON, one MP3). Not used by the app.
- `docs/original-spec.md`: the original feature specification.

## Scripts

`dev`, `build`, `start`, `preview`, `lint`, `format`
