/**
 * Aether — SoundCloud Addon (Official API)
 *
 * Uses Client Credentials flow — no user login required.
 * Users register a free SoundCloud app and paste their
 * client_id + client_secret into Aether's Add-ons screen.
 *
 * How to get credentials:
 *   1. Go to https://soundcloud.com/you/apps
 *   2. Create a new app
 *   3. Copy Client ID and Client Secret
 *   4. Paste both into Aether → Add-ons → SoundCloud → Connect
 *
 * Docs: https://developers.soundcloud.com/docs/api/guide
 */

import { Track } from '../../types';
import { useAddonStore } from '../../Store/addonStore';

const SC_API       = 'https://api.soundcloud.com';
const SC_TOKEN_URL = 'https://secure.soundcloud.com/oauth/token';
const ADDON_ID     = 'aether.soundcloud';

// ── Token cache (in-memory, survives the session) ────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // Unix ms

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const config = useAddonStore.getState().getConfig(ADDON_ID);
  if (!config.clientId || !config.clientSecret) {
    throw new Error('SoundCloud not connected. Go to Add-ons → SoundCloud → Connect.');
  }

  // Client Credentials exchange
  // Docs: https://developers.soundcloud.com/docs/api/guide#authentication
  const res = await fetch(SC_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      // HTTP Basic auth: base64(client_id:client_secret)
      'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (res.status === 429) throw new Error('SoundCloud rate limit hit. Try again in a moment.');
  if (!res.ok)            throw new Error(`SoundCloud auth failed (${res.status})`);

  const data = await res.json();
  cachedToken    = data.access_token;
  // expires_in is in seconds — default ~3600 (1 hour)
  tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;

  return cachedToken!;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function bestArtwork(url: string | null): string {
  return url ? url.replace('-large', '-t300x300') : '';
}

function toTrack(t: any): Track {
  return {
    id:       String(t.id),
    title:    t.title,
    artist:   t.user.username,
    source:   'SoundCloud',
    coverUrl: bestArtwork(t.artwork_url),
    duration: msToTime(t.duration),
  };
}

// ── Addon manifest ────────────────────────────────────────────────────────────
export const SoundCloudManifest = {
  id:          ADDON_ID,
  name:        'SoundCloud',
  version:     '1.0.0',
  description: 'Search and stream public tracks from SoundCloud.',
  icon:        '☁️',
  type:        'source' as const,
  // Shown as input fields in the Connect sheet
  requiredConfig: [
    {
      key:         'clientId',
      label:       'Client ID',
      placeholder: 'Your SoundCloud app Client ID',
    },
    {
      key:         'clientSecret',
      label:       'Client Secret',
      placeholder: 'Your SoundCloud app Client Secret',
      secret:      true, // UI should mask this field
    },
  ],
};

// ── Addon API ─────────────────────────────────────────────────────────────────
export const SoundCloudAddon = {
  manifest: SoundCloudManifest,

  /** Search tracks — no streamUrl yet (resolved lazily at play time) */
  async search(query: string): Promise<Track[]> {
    const token = await getAccessToken();

    const res = await fetch(
      `${SC_API}/tracks?q=${encodeURIComponent(query)}&limit=20&access=playable`,
      { headers: { Authorization: `OAuth ${token}` } }
    );

    if (res.status === 401) {
      cachedToken = null; // Force re-auth on next call
      throw new Error('SoundCloud session expired. Reconnecting...');
    }
    if (!res.ok) throw new Error(`SoundCloud search failed (${res.status})`);

    const data = await res.json();
    // Official API returns array directly (not wrapped in collection)
    const tracks = Array.isArray(data) ? data : data.collection ?? [];
    return tracks.filter((t: any) => t.streamable).map(toTrack);
  },

  /** Resolve the direct stream URL — called right before Howler loads the track */
  async getStreamUrl(trackId: string): Promise<string> {
    const token = await getAccessToken();

    // The official API provides stream_url on the track object
    const res = await fetch(
      `${SC_API}/tracks/${trackId}`,
      { headers: { Authorization: `OAuth ${token}` } }
    );
    if (!res.ok) throw new Error('Could not fetch SoundCloud track');

    const track = await res.json();

    // stream_url requires appending the access token to actually stream
    // Format: stream_url?oauth_token=<token>
    if (track.stream_url) {
      return `${track.stream_url}?oauth_token=${token}`;
    }

    throw new Error('Track is not streamable');
  },

  /** Trending tracks for the Home screen */
  async getFeatured(): Promise<Track[]> {
    const token = await getAccessToken();

    const res = await fetch(
      `${SC_API}/tracks?order=hotness&limit=10&access=playable`,
      { headers: { Authorization: `OAuth ${token}` } }
    );
    if (!res.ok) return [];

    const data  = await res.json();
    const tracks = Array.isArray(data) ? data : data.collection ?? [];
    return tracks.filter((t: any) => t.streamable).map(toTrack);
  },
};