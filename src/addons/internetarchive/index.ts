/**
 * Aether — Internet Archive Addon
 *
 * API: https://archive.org/developers/index-apis.html
 *
 * Two-step flow:
 *   search()       → advancedsearch.php → returns item identifiers
 *   getStreamUrl() → metadata/{identifier} → finds best audio file URL
 *
 * No credentials required — one-tap install.
 */

import { Track } from '../../types';

const SEARCH_URL = 'https://archive.org/advancedsearch.php';
const META_URL   = 'https://archive.org/metadata';
const ADDON_ID   = 'aether.internetarchive';

export const InternetArchiveManifest = {
  id:             ADDON_ID,
  name:           'Internet Archive',
  version:        '1.0.0',
  description:    'Millions of free audio recordings, live concerts & more.',
  icon:           'archive',
  type:           'source' as const,
  requiredConfig: [],
};

export const InternetArchiveAddon = {
  manifest: InternetArchiveManifest,

  // ── Search ────────────────────────────────────────────────────────────────
  async search(query: string): Promise<Track[]> {
    const params = new URLSearchParams({
        q:      `creator:(${query}) AND collection:etree AND format:MP3`,
      output: 'json',
      rows:   '20',
      'fl[]': 'identifier,title,creator',
    });

    const res  = await fetch(`${SEARCH_URL}?${params}`);
    if (!res.ok) throw new Error(`Internet Archive search error (${res.status})`);
    const data = await res.json();

    return (data?.response?.docs ?? []).map((item: any) => ({
      id:       item.identifier,
      title:    item.title?.trim() || 'Unknown',
      artist:   Array.isArray(item.creator)
                  ? item.creator[0]
                  : item.creator || 'Internet Archive',
      source:   'Internet Archive',
      coverUrl: `https://archive.org/services/img/${item.identifier}`,
      duration: undefined,
    }));
  },

  // ── Stream URL resolution ─────────────────────────────────────────────────
  async getStreamUrl(identifier: string): Promise<string> {
    const res  = await fetch(`${META_URL}/${identifier}`);
    if (!res.ok) throw new Error(`Internet Archive metadata error (${res.status})`);
    const data = await res.json();

    const files: any[] = data?.files ?? [];

    // Find first VBR MP3 that isn't a metadata file
    const mp3 = files.find(
      (f: any) =>
        f.name?.toLowerCase().endsWith('.mp3') &&
        f.source !== 'metadata' &&
        f.format === 'VBR MP3'
    );

    if (mp3) {
        const url = `https://archive.org/download/${identifier}/${mp3.name}`;
        return url;
      }

    // Fallback to ogg or opus
    const audio = files.find(
      (f: any) =>
        (f.name?.toLowerCase().endsWith('.ogg') ||
         f.name?.toLowerCase().endsWith('.opus')) &&
        f.source !== 'metadata'
    );

    if (audio) return `https://archive.org/download/${identifier}/${audio.name}`;

    throw new Error(`No playable audio found for ${identifier}`);
  },

  // ── Featured ──────────────────────────────────────────────────────────────
  async getFeatured(): Promise<Track[]> {
    const params = new URLSearchParams({
        q:      'collection:etree AND format:MP3 AND downloads:[1000 TO 99999999]',
      output: 'json',
      rows:   '12',
      sort:   'downloads desc',
      'fl[]': 'identifier,title,creator',
    });

    const res  = await fetch(`${SEARCH_URL}?${params}`);
    if (!res.ok) throw new Error(`Internet Archive featured error (${res.status})`);
    const data = await res.json();

    return (data?.response?.docs ?? []).map((item: any) => ({
      id:       item.identifier,
      title:    item.title?.trim() || 'Unknown',
      artist:   Array.isArray(item.creator)
                  ? item.creator[0]
                  : item.creator || 'Internet Archive',
      source:   'Internet Archive',
      coverUrl: `https://archive.org/services/img/${item.identifier}`,
    }));
  },
};