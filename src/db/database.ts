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
export async function ensureLikedSongsPlaylist(): Promise<number> {
  const existing = await db.playlists
    .where('title')
    .equals('Liked Songs')
    .first();
  
  if (existing?.id) return existing.id;

  return await db.playlists.add({
    title: 'Liked Songs',
    description: 'Your liked tracks',
    createdAt: 0, // 0 = always sorts first
    updatedAt: Date.now(),
  });
}

export async function toggleLikedSong(track: Track): Promise<boolean> {
  const playlist = await db.playlists
    .where('title')
    .equals('Liked Songs')
    .first();
  
  if (!playlist?.id) return false;

  const existing = await db.playlistTracks
    .where('playlistId')
    .equals(playlist.id)
    .filter(pt => pt.track.id === track.id)
    .first();

  if (existing) {
    await db.playlistTracks.delete(existing.id!);
    return false; // unliked
  } else {
    const count = await db.playlistTracks
      .where('playlistId')
      .equals(playlist.id)
      .count();
    
    await db.playlistTracks.add({
      playlistId: playlist.id,
      track,
      addedAt: Date.now(),
      order: count,
    });
    return true; // liked
  }
}

export async function isTrackLiked(trackId: string): Promise<boolean> {
  const playlist = await db.playlists
    .where('title')
    .equals('Liked Songs')
    .first();
  
  if (!playlist?.id) return false;

  const existing = await db.playlistTracks
    .where('playlistId')
    .equals(playlist.id)
    .filter(pt => pt.track.id === trackId)
    .first();

  return !!existing;
}