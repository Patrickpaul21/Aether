<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e3e1b82e-8d6a-43de-8fb3-922d9161caeb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Aether 🎵

A local-first music streaming client powered by user-installed addons. No backend, no server costs. You connect your own sources.

**Core philosophy:** Your music client, your sources, your data.

> 🚧 Live demo coming soon

---

## What is Aether?

Aether is an open source music streaming app that runs entirely in the browser. Instead of being locked into one service, you install addons to connect your own music sources — free streaming platforms, self-hosted servers, live radio, and more.

No account required. No ads. No tracking.

---

## Features

- 🎵 **Multi-source streaming** — Audius, Radio Browser, more coming
- 📻 **Live radio** — 30,000+ stations via Radio Browser
- 🔌 **Extensible addon system** — connect any source via the addon API
- 🎨 **Apple Music-style UI** — NowPlaying screen, blurred album art, smooth animations
- 💾 **Local-first** — play history and preferences saved locally, no account needed
- ⚡ **Fast** — pre-resolves stream URLs in the background before you skip

---

## Built With

- Vite + React + TypeScript
- Tailwind CSS
- Zustand (state management)
- Howler.js (audio engine)
- Framer Motion (animations)

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Patrickpaul155/Aether-OS.git
cd Aether-OS

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Addons

Aether uses an addon system to connect music sources. Install addons from the Add-ons screen inside the app.

### Available Now

| Addon | Type | Credentials |
|---|---|---|
| Audius | Source | None (optional Bearer token for higher limits) |
| Radio Browser | Source | None |

### Coming Soon

| Addon | Type | Status |
|---|---|---|
| YouTube Music | Source | In research — [vote on this issue](#) |
| JioSaavn | Source | Planned |
| Navidrome | Source | UI ready, needs server |
| Jellyfin | Source | UI ready, needs server |
| Last.fm | Tool | Planned |

---

## Addon API

Want to build your own source addon? Every source addon implements this contract:

```typescript
interface SourceAddon {
  manifest: {
    id: string;          // e.g. 'aether.mysource'
    name: string;
    version: string;
    type: 'source';
    requiredConfig: string[]; // credential keys, empty = one-tap install
  };

  // Search and return tracks
  search(query: string): Promise<Track[]>;

  // Return a playable stream URL for a track ID
  getStreamUrl(trackId: string): Promise<string>;

  // Optional — featured/trending tracks for the Home screen
  getFeatured?(): Promise<Track[]>;
}
```

The `Track` type:

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  source: string;     // must match your addon name exactly
  coverUrl: string;
  duration?: string;  // e.g. '3:45' or 'LIVE' for radio
  streamUrl?: string; // pre-baked URL (radio) or resolved lazily (on-demand)
}
```

See `src/addons/audius/index.ts` and `src/addons/radio/index.ts` for full examples.

---

## Project Structure

```
src/
├── addons/
│   ├── audius/        Audius addon
│   └── radio/         Radio Browser addon
├── hooks/
│   ├── usePlayer.ts   Howler.js audio engine (two-effect architecture)
│   └── usePlayTrack.ts Resolves stream URL then hands off to player
├── store/
│   ├── playerStore.ts  Zustand — playback state, queue, history
│   └── addonStore.ts   Zustand (persisted) — installed addons + config
└── screens/
    ├── HomeScreen.tsx
    ├── SearchScreen.tsx
    ├── NowPlayingScreen.tsx
    ├── LibraryScreen.tsx
    ├── AddOnsScreen.tsx
    └── SettingsScreen.tsx
```

---

## Contributing

Contributions are welcome — especially new addon sources.

1. Fork the repo
2. Create your branch: `git checkout -b addon/mysource`
3. Build your addon following the API contract above
4. Open a pull request

If you want to suggest a new source, open an issue and describe the API.

---

## Roadmap

- [ ] YouTube Music addon
- [ ] JioSaavn addon
- [ ] Playlist creation (Dexie.js)
- [ ] Library screen with real data
- [ ] Lyrics support
- [ ] Onboarding screen
- [ ] PWA support

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Author

Built by [Patrick](https://github.com/Patrickpaul155) — designer and developer.

Portfolio: [patrickdondapati.framer.website](https://patrickdondapati.framer.website) · Behance: [patrickpaul21](https://behance.net/patrickpaul21)