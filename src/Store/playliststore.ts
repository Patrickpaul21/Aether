import { create } from 'zustand';
import { Track } from '../types';
import { 
  db, 
  Playlist, 
  createPlaylist, 
  deletePlaylist, 
  addTrackToPlaylist, 
  removeTrackFromPlaylist,
  getPlaylistTracks,
  ensureLikedSongsPlaylist,
  toggleLikedSong,
  isTrackLiked,
} from '../db/database';

interface PlaylistState {
  playlists: Playlist[];
  loading: boolean;

  // Actions
  loadPlaylists: () => Promise<void>;
  createPlaylist: (title: string, description?: string) => Promise<number>;
  deletePlaylist: (id: number) => Promise<void>;
  addTrack: (playlistId: number, track: Track) => Promise<void>;
  removeTrack: (playlistId: number, trackId: string) => Promise<void>;
  getPlaylistTracks: (playlistId: number) => Promise<Track[]>;
  ensureLikedSongs: () => Promise<void>;
  toggleLiked: (track: Track) => Promise<boolean>;
  isLiked: (trackId: string) => Promise<boolean>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  loading: false,

  loadPlaylists: async () => {
    set({ loading: true });
    const playlists = await db.playlists.orderBy('createdAt').reverse().toArray();
    set({ playlists, loading: false });
  },

  createPlaylist: async (title, description) => {
    const id = await createPlaylist(title, description);
    await get().loadPlaylists();
    return id;
  },

  deletePlaylist: async (id) => {
    await deletePlaylist(id);
    await get().loadPlaylists();
  },

  addTrack: async (playlistId, track) => {
    await addTrackToPlaylist(playlistId, track);
  },

  removeTrack: async (playlistId, trackId) => {
    await removeTrackFromPlaylist(playlistId, trackId);
  },

  getPlaylistTracks: async (playlistId) => {
    return await getPlaylistTracks(playlistId);
  },
  ensureLikedSongs: async () => {
    await ensureLikedSongsPlaylist();
    await get().loadPlaylists();
  },

  toggleLiked: async (track) => {
    await ensureLikedSongsPlaylist();
    const result = await toggleLikedSong(track);
    await get().loadPlaylists();
    return result;
  },

  isLiked: async (trackId) => {
    return await isTrackLiked(trackId);
  },
}));