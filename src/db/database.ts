import Dexie, { Table } from 'dexie';
import { Track } from '../types';

export interface Playlist {
  id?: number;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  coverUrl?: string;
}

export interface PlaylistTrack {
  id?: number;
  playlistId: number;
  track: Track;
  addedAt: number;
  order: number;
}

class AetherDatabase extends Dexie {
  playlists!: Table<Playlist>;
  playlistTracks!: Table<PlaylistTrack>;

  constructor() {
    super('aether-db');
    this.version(1).stores({
      playlists: '++id, title, createdAt',
      playlistTracks: '++id, playlistId, order',
    });
  }
}

export const db = new AetherDatabase();

// Helper functions
export async function createPlaylist(title: string, description?: string): Promise<number> {
  const now = Date.now();
  return await db.playlists.add({
    title,
    description,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deletePlaylist(id: number): Promise<void> {
  await db.playlists.delete(id);
  await db.playlistTracks.where('playlistId').equals(id).delete();
}

export async function addTrackToPlaylist(playlistId: number, track: Track): Promise<void> {
  const existing = await db.playlistTracks
    .where('playlistId').equals(playlistId)
    .toArray();
  
  // Prevent duplicates
  const isDuplicate = existing.some(pt => pt.track.id === track.id);
  if (isDuplicate) return;

  await db.playlistTracks.add({
    playlistId,
    track,
    addedAt: Date.now(),
    order: existing.length,
  });

  await db.playlists.update(playlistId, { updatedAt: Date.now() });
}

export async function removeTrackFromPlaylist(playlistId: number, trackId: string): Promise<void> {
  await db.playlistTracks
    .where('playlistId').equals(playlistId)
    .filter(pt => pt.track.id === trackId)
    .delete();
  
  await db.playlists.update(playlistId, { updatedAt: Date.now() });
}

export async function getPlaylistTracks(playlistId: number): Promise<Track[]> {
  const playlistTracks = await db.playlistTracks
    .where('playlistId').equals(playlistId)
    .sortBy('order');
  
  return playlistTracks.map(pt => pt.track);
}
