/**
 * Aether — Radio Browser Addon
 *
 * Base URL: https://api.radio-browser.info/json
 * Docs:     https://api.radio-browser.info/
 *
 * No API key required. Requests must include a unique User-Agent.
 */

import { Track } from '../../types';

const BASE_URL = 'https://all.api.radio-browser.info/json';
const ADDON_ID = 'aether.radio';
const USER_AGENT = 'AetherOS/1.0 (https://github.com/aether-os)';

export const RadioManifest = {
  id:          ADDON_ID,
  name:        'Radio Browser',
  version:     '1.0.0',
  description: 'Explore thousands of live radio stations worldwide.',
  icon:        'radio',
  type:        'source' as const,
  requiredConfig: [],
};

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });

  if (!res.ok) throw new Error(`Radio Browser error (${res.status})`);
  return res.json() as Promise<T>;
}

function toTrack(station: Record<string, unknown>): Track {
  const tags = typeof station.tags === 'string' ? station.tags.split(',')[0]?.trim() : '';
  return {
    id:       String(station.stationuuid ?? ''),
    title:    String(station.name ?? 'Unknown station'),
    artist:   tags || String(station.country ?? 'Radio'),
    source:   'Radio Browser',
    coverUrl: String(station.favicon ?? ''),
    duration: 'LIVE',
  };
}

export const RadioAddon = {
  manifest: RadioManifest,

  async search(query: string): Promise<Track[]> {
    const data = await request<Record<string, unknown>[]>(
      `/stations/search?name=${encodeURIComponent(query)}&limit=20&hidebroken=true&order=clickcount&reverse=true`,
    );
    return (data ?? []).map(toTrack);
  },

  /** Resolve the live stream URL for a station UUID */
  async getStreamUrl(trackId: string): Promise<string> {
    const data = await request<Record<string, unknown>[]>(
      `/stations/byuuid/${encodeURIComponent(trackId)}`,
    );
    const station = data?.[0];
    if (!station) throw new Error('Radio station not found');

    const url = station.url_resolved ?? station.url;
    if (!url || typeof url !== 'string') throw new Error('Station has no stream URL');
    return url;
  },

  async getFeatured(): Promise<Track[]> {
    const data = await request<Record<string, unknown>[]>('/stations/topvote/10');
    return (data ?? []).map(toTrack);
  },
};
