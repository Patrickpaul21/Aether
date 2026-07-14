/**
 * Aether — JioSaavn Addon
 *
 * Two-step flow:
 *   search()       → api.php?__call=search.getResults
 *   getStreamUrl() → api.php?__call=song.generateAuthToken
 *
 * No credentials required — one-tap install.
 */

import { Track } from '../../types';

const JIOSAAVN_API = window.location.hostname === 'localhost'
  ? '/jiosaavn/api.php'
  : '/api/jiosaavn';
const ADDON_ID     = 'aether.jiosaavn';

// Stores encrypted URLs by track ID for stream resolution
const encryptedUrlMap = new Map<string, string>();

function getImage(raw: string): string {
  if (!raw) return '';
  return raw.replace('150x150', '500x500');
}

function mapTrack(item: any): Track {
  const artists = item.more_info?.artistMap?.primary_artists ?? [];
  const artist  = artists.length
    ? artists.map((a: any) => a.name).join(', ')
    : item.more_info?.music || 'Unknown Artist';

  if (item.more_info?.encrypted_media_url) {
    encryptedUrlMap.set(item.id, item.more_info.encrypted_media_url);
  }

  return {
    id:       item.id,
    title:    item.title?.trim() || 'Unknown',
    artist,
    source:   'JioSaavn',
    coverUrl: getImage(item.image ?? ''),
    duration: item.more_info?.duration ?? undefined,
  };
}

export const JioSaavnManifest = {
  id:             ADDON_ID,
  name:           'JioSaavn',
  version:        '1.0.0',
  description:    'Stream millions of songs — Bollywood, international & more.',
  icon:           'music',
  type:           'source' as const,
  requiredConfig: [],
};

export const JioSaavnAddon = {
  manifest: JioSaavnManifest,

  async search(query: string): Promise<Track[]> {
    const params = new URLSearchParams({
      __call:      'search.getResults',
      q:           query,
      _format:     'json',
      _marker:     '0',
      api_version: '4',
      ctx:         'web6dot0',
      n:           '20',
      p:           '1',
    });

    const res = await fetch(`${JIOSAAVN_API}?${params}`);
    if (!res.ok) throw new Error(`JioSaavn search error (${res.status})`);
    const data = await res.json();

    const results: any[] = data?.results ?? [];
    return results.map(mapTrack);
  },

  async getStreamUrl(trackId: string): Promise<string> {
    const encryptedUrl = encryptedUrlMap.get(trackId);
    if (!encryptedUrl) throw new Error('No encrypted URL for track: ' + trackId);
  
    const params = new URLSearchParams({
      __call:      'song.generateAuthToken',
      url:         encryptedUrl,
      bitrate:     '320',
      api_version: '4',
      _format:     'json',
      ctx:         'web6dot0',
    });
  
    const base = JIOSAAVN_API;
    const res = await fetch(`${base}?${params}`);
    if (!res.ok) throw new Error(`JioSaavn stream error (${res.status})`);
    const data = await res.json();
  
    if (data?.status !== 'success' || !data?.auth_url) {
      throw new Error('JioSaavn: failed to get stream URL');
    }
  
    return data.auth_url;
  },

  async getFeatured(): Promise<Track[]> {
    const params = new URLSearchParams({
      __call:      'content.getCharts',
      _format:     'json',
      _marker:     '0',
      api_version: '4',
      ctx:         'web6dot0',
      n:           '12',
      p:           '1',
    });

    const res = await fetch(`${JIOSAAVN_API}?${params}`);
    if (!res.ok) throw new Error(`JioSaavn featured error (${res.status})`);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data
      .filter((item: any) => item?.type === 'song')
      .slice(0, 12)
      .map(mapTrack);
  },
};