/**
 * Aether — YouTube Music Addon (via Piped)
 *
 * Piped is an open source YouTube proxy with a clean REST API.
 * No API key required — uses public Piped instances.
 *
 * Docs: https://docs.piped.video/docs/api-documentation/
 *
 * Flow:
 *   search()       → /search?q=query&filter=music   → returns video list
 *   getStreamUrl() → /streams/:videoId               → picks best audio stream
 *   getFeatured()  → /trending?region=US             → filters music content
 */

import { Track } from '../../types';

// Multiple instances — tries each in order until one responds
const INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.yt',
  'https://pipedapi.drgns.space',
];

const ADDON_ID = 'aether.youtube';

export const YouTubeManifest = {
  id:             ADDON_ID,
  name:           'YouTube Music',
  version:        '1.0.0',
  description:    'Stream music from YouTube via Piped. No account required.',
  icon:           'youtube',
  type:           'source' as const,
  requiredConfig: [], // zero credentials — one-tap install
};

// ── Instance selector ─────────────────────────────────────────────────────────
// Tries instances in order, returns the first one that responds successfully.
// Result is cached for the session to avoid re-checking every request.
let cachedInstance: string | null = null;

async function getWorkingInstance(): Promise<string> {
  if (cachedInstance) return cachedInstance;

  for (const instance of INSTANCES) {
    try {
      const res = await fetch(`${instance}/trending?region=US`, {
        signal: AbortSignal.timeout(3000), // 3s timeout per instance
      });
      if (res.ok) {
        cachedInstance = instance;
        return instance;
      }
    } catch {
      // Instance failed — try next
      continue;
    }
  }

  // All instances failed — fall back to official
  cachedInstance = INSTANCES[0];
  return INSTANCES[0];
}

// ── Request helper ────────────────────────────────────────────────────────────
async function request(path: string, params: Record<string, string> = {}): Promise<any> {
  const instance = await getWorkingInstance();
  const qs  = new URLSearchParams(params).toString();
  const url = `${instance}${path}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    // Invalidate cache so next request tries a fresh instance
    cachedInstance = null;
    throw new Error(`Piped error (${res.status})`);
  }

  return res.json();
}

// ── Artist name cleaner ───────────────────────────────────────────────────────
// YouTube Music channels follow the pattern "Artist Name - Topic"
// Strip " - Topic" suffix for clean display
function cleanArtist(uploader: string): string {
  return uploader?.replace(/ - Topic$/, '').trim() || 'Unknown';
}

// ── Video ID extractor ────────────────────────────────────────────────────────
// Piped returns URLs as "/watch?v=videoId"
function extractVideoId(url: string): string {
  return url?.replace('/watch?v=', '') ?? '';
}

// ── Duration formatter ────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ── Search result → Track mapper ──────────────────────────────────────────────
function searchResultToTrack(item: any): Track {
  const videoId = extractVideoId(item.url);
  return {
    id:       videoId,
    title:    item.title?.trim() || 'Unknown',
    artist:   cleanArtist(item.uploaderName ?? item.uploader ?? ''),
    source:   'YouTube',
    coverUrl: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    duration: formatDuration(item.duration),
  };
}

// ── Addon API ─────────────────────────────────────────────────────────────────
export const YouTubeAddon = {
  manifest: YouTubeManifest,

  /**
   * Search YouTube Music.
   * filter=music scopes results to music content only.
   */
  async search(query: string): Promise<Track[]> {
    const data = await request('/search', {
      q:      query,
      filter: 'music_songs',
    });

    return (data?.items ?? [])
      .filter((item: any) => item.type === 'stream' && item.duration > 0)
      .slice(0, 20)
      .map(searchResultToTrack);
  },

  /**
   * Get the best audio stream URL for a video.
   * Picks the highest bitrate non-video-only stream.
   * Called lazily by usePlayer Effect 1 when the track has no streamUrl.
   */
  async getStreamUrl(videoId: string): Promise<string> {
    const data = await request(`/streams/${videoId}`);

    const audioStreams: any[] = (data?.audioStreams ?? [])
      .filter((s: any) => !s.videoOnly);

    if (!audioStreams.length) {
      throw new Error(`No audio streams found for ${videoId}`);
    }

    // Pick highest bitrate stream
    const best = audioStreams.reduce((a: any, b: any) =>
      (b.bitrate ?? 0) > (a.bitrate ?? 0) ? b : a
    );

    return best.url;
  },

  /**
   * Featured — YouTube Music trending.
   * Filters to music-length content (2–10 minutes).
   */
  async getFeatured(): Promise<Track[]> {
    const data = await request('/trending', { region: 'US' });

    return (data ?? [])
      .filter((item: any) => item.duration >= 120 && item.duration <= 600)
      .slice(0, 12)
      .map(searchResultToTrack);
  },
};