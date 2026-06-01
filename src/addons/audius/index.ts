/**
 * Aether — Audius Addon
 *
 * Base URL: https://api.audius.co/v1
 * Docs:     https://docs.audius.co/api
 *
 * Works in two modes:
 *   1. No key — uses app_name=Aether, works immediately, lower rate limits
 *   2. Free API key — uses Bearer token, higher rate limits, still free
 *
 * Get a free key at: https://api.audius.co/plans
 * The addon installs with one tap either way.
 */

import { Track } from '../../types';
import { useAddonStore } from '../../Store/addonStore';

const BASE_URL = 'https://api.audius.co/v1';
const ADDON_ID = 'aether.audius';

export const AudiusManifest = {
  id:          ADDON_ID,
  name:        'Audius',
  version:     '1.0.0',
  description: 'Free, open music streaming. No account required.',
  icon:        'audius',
  type:        'source' as const,
  // No required config — installs with one tap.
  // Bearer token is optional (free at api.audius.co/plans).
  requiredConfig: [],
  optionalConfig: [
    {
      key:         'bearerToken',
      label:       'Bearer Token (optional)',
      placeholder: 'Paste your free Audius Bearer Token for higher limits',
      secret:      true,
      helpText:    'api.audius.co/plans → Free plan → Create API Key',
    },
  ],
};

// ── Request helper ────────────────────────────────────────────────────────────
async function request(path: string, params: Record<string, string> = {}): Promise<any> {
  const config = useAddonStore.getState().getConfig(ADDON_ID);

  // Build headers — use Bearer token if available, otherwise app_name
  const headers: Record<string, string> = { Accept: 'application/json' };
  let url: string;

  if (config.bearerToken) {
    headers['Authorization'] = `Bearer ${config.bearerToken}`;
    const qs = new URLSearchParams(params).toString();
    url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
  } else {
    const qs = new URLSearchParams({ app_name: 'Aether', ...params }).toString();
    url = `${BASE_URL}${path}?${qs}`;
  }

  const res = await fetch(url, { headers });

  if (res.status === 429) throw new Error('Audius rate limit reached. Get a free API key at api.audius.co/plans');
  if (!res.ok)            throw new Error(`Audius error (${res.status})`);

  return res.json();
}

// ── Track mapper ──────────────────────────────────────────────────────────────
function toTrack(t: any): Track {
  const secs = t.duration ?? 0;
  return {
    id:       t.id,
    title:    t.title,
    artist:   t.user?.name ?? t.user?.handle ?? 'Unknown',
    source:   'Audius',
    coverUrl: t.artwork?.['480x480'] ?? t.artwork?.['150x150'] ?? '',
    duration: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`,
  };
}

// ── Addon API ─────────────────────────────────────────────────────────────────
export const AudiusAddon = {
  manifest: AudiusManifest,

  /** Search tracks */
  async search(query: string): Promise<Track[]> {
    const data = await request('/tracks/search', { query, limit: '20' });
    return (data?.data ?? [])
      .filter((t: any) => t.is_streamable ?? true)
      .map(toTrack);
  },

  /**
   * Get direct stream URL.
   * The /stream endpoint returns the MP3 directly — works with Howler html5:true.
   * We build the URL here rather than fetching, since Howler handles the actual request.
   */
  async getStreamUrl(trackId: string): Promise<string> {
    // Return the stream URL directly.
    // Howler's html5 audio element follows the Audius CDN redirect natively.
    // No fetch needed — avoids CORS preflight issues from localhost.
    return `${BASE_URL}/tracks/${trackId}/stream?app_name=Aether`;
  },

  /** Trending tracks for the Home screen */
  async getFeatured(): Promise<Track[]> {
    const data = await request('/tracks/trending', { limit: '10' });
    return (data?.data ?? []).map(toTrack);
  },
};