# Aether OS

A local-first music streaming web app with an open addon architecture. No subscriptions, no algorithms, no data collection — just your music, your sources, your rules.

> **Android packaging in progress via Capacitor.**
> Live demo: [aether-os-main.vercel.app](https://aether-os-main.vercel.app)

---

## What it is

Aether is a music client, not a music service. Instead of locking you into one catalogue, it connects to independent audio sources through a simple addon system. You install the sources you want, search across all of them at once, and play without an account.

Everything is local. Your playlists, liked songs, and play history live in your browser via IndexedDB. Nothing leaves your device.

---

## Sources

| Addon | What it gives you |
|---|---|
| Audius | Independent and underground music, no account required |
| Radio Browser | 30,000+ live radio stations worldwide |
| Internet Archive | 250,000+ public domain live concert recordings |
| iTunes Preview | 30-second previews across 100M+ tracks, no credentials |
| LRCLIB | Time-synced lyrics for supported tracks |

More sources can be connected from the Add-ons screen. User-installable custom sources are in development.

---

## Features

- **Multi-source search** — searches all connected addons simultaneously, results interleaved
- **Now Playing** — full-bleed album art, time-synced lyrics, queue management, tap to hide controls
- **3-effect audio engine** — silently pre-resolves and pre-loads the next two tracks, cutting skip latency to near-instant
- **Addon architecture** — sources and themes are first-class addons with a documented contract
- **4 built-in themes** — OLED, Cosmic, Obsidian, ASCII — all built on the same CSS variable system as custom themes
- **Local playlists** — create, manage, and persist playlists entirely client-side via Dexie/IndexedDB
- **Liked songs** — auto-playlist, persisted locally
- **Play history** — recently played, continue listening
- **Live radio** — dedicated radio tab with scoped search

---

## Addon contract

Any source addon must implement:

```typescript
interface SourceAddon {
  manifest: {
    id: string          // e.g. 'aether.mysource'
    name: string
    version: string
    type: 'source'
    description: string
  }
  search(query: string): Promise<Track[]>
  getStreamUrl(trackId: string): Promise<string>
  getFeatured?(): Promise<Track[]>
}
```

Theme addons override CSS variables scoped to a class on `document.documentElement`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Audio | Howler.js |
| State | Zustand (persisted) |
| Local DB | Dexie.js (IndexedDB) |
| Deployment | Vercel |

---

## Running locally

```bash
git clone https://github.com/Patrickpaul21/Aether.git
cd Aether

npm install
npm run dev
```

Open `http://localhost:3000` in Chrome DevTools with a mobile device profile selected (Pixel 7 or similar) — Aether is designed for mobile dimensions.

---

## Project structure

```
src/
├── addons/          # Source and utility addons
│   ├── audius/
│   ├── internetarchive/
│   ├── itunes/
│   ├── Jiosaavn/
│   ├── radio/
│   ├── lyrics/      # LRCLIB integration
│   └── spotify/     # OAuth scaffold (in progress)
├── screens/         # App screens
├── Store/           # Zustand stores
├── hooks/           # usePlayer, usePlayTrack
├── db/              # Dexie database
├── themes/          # CSS theme definitions
└── types.ts         # Shared TypeScript types
api/
└── jiosaavn.ts      # Vercel serverless proxy
```

---

## Roadmap

- [ ] Android packaging via Capacitor
- [ ] User-installable custom addons (source + theme)
- [ ] YouTube Music integration (requires Android/native)
- [ ] Last.fm scrobbling
- [ ] Discogs metadata
- [ ] Equalizer (native audio pipeline)
- [ ] Background playback (Android)
- [ ] Lock screen controls (Android)

---

## Notes

- JioSaavn integration is present but geo-restricted at the CDN level on web — works correctly once packaged for Android
- YouTube Music requires native Android libraries (Innertube/NewPipe) not available in browser context — planned for Capacitor build
- Cart, checkout features referenced in some source files are unrelated scaffolding from an earlier internship project and are not part of Aether

---

## Built by

Patrick Dondapati — [patrickdondapati.framer.website](https://patrickdondapati.framer.website) · [Behance](https://behance.net/patrickpaul21)

*Built with Claude and Cursor as core AI-assisted development tools.*