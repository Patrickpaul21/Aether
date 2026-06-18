import { Track } from '../../types';

const BASE_URL = 'https://itunes.apple.com';

export const ItunesManifest = {
  id: 'aether.itunes',
  name: 'iTunes Preview',
  version: '1.0.0',
  type: 'source' as const,
  description: '30-second previews from Apple Music. 100M+ tracks, no account required.',
  requiredConfig: [],
};

export const ItunesAddon = {
  manifest: ItunesManifest,

  async search(query: string): Promise<Track[]> {
    try {
      const params = new URLSearchParams({
        term: query,
        media: 'music',
        entity: 'song',
        limit: '20',
      });

      const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
      if (!res.ok) return [];

      const data = await res.json();

      return data.results
        .filter((item: any) => item.previewUrl)
        .map((item: any) => ({
          id: `itunes-${item.trackId}`,
          title: item.trackName,
          artist: item.artistName,
          source: 'iTunes',
          coverUrl: item.artworkUrl100.replace('100x100', '400x400'),
          duration: formatDuration(item.trackTimeMillis),
          streamUrl: item.previewUrl,
        }));
    } catch {
      return [];
    }
  },

  async getStreamUrl(trackId: string): Promise<string> {
    const numericId = trackId.replace('itunes-', '');
    const res = await fetch(`${BASE_URL}/lookup?id=${numericId}&entity=song`);
    if (!res.ok) throw new Error('iTunes lookup failed');
    const data = await res.json();
    const item = data.results?.[0];
    if (!item?.previewUrl) throw new Error('No preview URL found');
    return item.previewUrl;
  },

  async getFeatured(): Promise<Track[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/search?term=top+hits&media=music&entity=song&limit=20`
      );
      if (!res.ok) return [];
      const data = await res.json();

      return data.results
        .filter((item: any) => item.previewUrl)
        .map((item: any) => ({
          id: `itunes-${item.trackId}`,
          title: item.trackName,
          artist: item.artistName,
          source: 'iTunes',
          coverUrl: item.artworkUrl100.replace('100x100', '400x400'),
          duration: formatDuration(item.trackTimeMillis),
          streamUrl: item.previewUrl,
        }));
    } catch {
      return [];
    }
  },
};

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}