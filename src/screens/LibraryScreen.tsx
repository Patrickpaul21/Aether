import { Plus, ListFilter, Heart, ArrowLeft, Play, Clock, Music, Trash2, MoreHorizontal, Shuffle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';
import { usePlaylistStore } from '../Store/playliststore';
import { usePlayerStore } from '../Store/playerStore';
import { Playlist } from '../db/database';

interface LibraryScreenProps {
  onPlayTrack?: (track: Track, queue?: Track[]) => void;
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=480&q=80';

function PlaylistCover({ tracks, imageUrl }: { tracks: Track[]; imageUrl?: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="w-full h-full object-cover" />;
  }
  if (tracks.length >= 4) {
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2">
        {tracks.slice(0, 4).map((t, i) => (
          <img key={i} src={t.coverUrl || FALLBACK_COVER}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
            className="w-full h-full object-cover" alt="" />
        ))}
      </div>
    );
  }
  if (tracks.length > 0) {
    return <img src={tracks[0].coverUrl || FALLBACK_COVER}
      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
      className="w-full h-full object-cover" alt="" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-900 to-cyan-800">
      <Music size={28} className="text-white/50" />
    </div>
  );
}

export default function LibraryScreen({ onPlayTrack }: LibraryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Playlists'>('All');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [playlistCovers, setPlaylistCovers] = useState<Record<number, Track[]>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);

  const { playlists, loading, loadPlaylists, createPlaylist, deletePlaylist, getPlaylistTracks, ensureLikedSongs } = usePlaylistStore();
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    loadPlaylists();
    ensureLikedSongs();
  }, []);

  // Load cover tracks for all playlists
  useEffect(() => {
    playlists.forEach(async (p) => {
      if (p.id && !playlistCovers[p.id]) {
        const tracks = await getPlaylistTracks(p.id);
        setPlaylistCovers(prev => ({ ...prev, [p.id!]: tracks }));
        // Load liked songs tracks
        if (p.title === 'Liked Songs') setLikedTracks(tracks);
      }
    });
  }, [playlists]);

  const handleOpenPlaylist = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    const tracks = await getPlaylistTracks(playlist.id!);
    setPlaylistTracks(tracks);
    if (playlist.title === 'Liked Songs') setLikedTracks(tracks);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    await createPlaylist(newPlaylistTitle.trim());
    setNewPlaylistTitle('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = async (id: number) => {
    await deletePlaylist(id);
    setDeleteConfirmId(null);
    if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
  };

  const handlePlay = (track: Track, queue: Track[]) => {
    const clean = (t: Track): Track => ({ ...t, streamUrl: undefined });
    if (onPlayTrack) { onPlayTrack(clean(track), queue.map(clean)); return; }
    setTrack(clean(track), queue.map(clean));
  };

  const handleShufflePlay = (tracks: Track[]) => {
    if (!tracks.length) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    handlePlay(shuffled[0], shuffled);
  };

  // Separate liked songs from regular playlists
  const likedPlaylist = playlists.find(p => p.title === 'Liked Songs');
  const userPlaylists = playlists.filter(p => p.title !== 'Liked Songs');

  return (
    <div className="flex flex-col relative h-full">
      <AnimatePresence mode="popLayout">

        {/* ── MAIN LIBRARY VIEW ── */}
        {!selectedPlaylist && (
          <motion.div key="library-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full">

            {/* Header */}
            <header className="sticky top-0 bg-brand-dark/95 backdrop-blur-md z-50 px-6 pt-5 pb-3">
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-black">Your Library</h1>
                <button onClick={() => setShowCreateModal(true)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex gap-2">
                {['All', 'Playlists'].map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      activeFilter === f ? 'bg-white text-black' : 'bg-white/[0.07] text-white/60 hover:text-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </header>

            <main className="px-6 pb-36 overflow-y-auto no-scrollbar pt-3">

              {/* Liked Songs — pinned at top */}
              {likedPlaylist && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOpenPlaylist(likedPlaylist)}
                  className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-colors active:scale-[0.99] mb-2"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                    {likedTracks.length > 0
                      ? <img src={likedTracks[0].coverUrl || FALLBACK_COVER} className="w-full h-full object-cover opacity-60" alt="" />
                      : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Heart size={22} className="text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white">Liked Songs</h3>
                    <p className="text-xs text-white/40 mt-0.5">{likedTracks.length} tracks</p>
                  </div>
                  <Play size={16} className="text-white/30" fill="currentColor" />
                </motion.div>
              )}

              {/* Divider */}
              {likedPlaylist && userPlaylists.length > 0 && (
                <div className="h-px bg-white/[0.06] mx-1 my-3" />
              )}

              {/* User playlists */}
              {loading ? (
                <div className="text-center py-12 text-white/30 text-sm">Loading…</div>
              ) : userPlaylists.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                    <Music size={28} className="text-white/20" />
                  </div>
                  <p className="text-sm font-bold text-white/40">No playlists yet</p>
                  <p className="text-xs text-white/25 mt-1">Tap + to create your first playlist</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {userPlaylists.map((playlist, i) => {
                    const covers = playlistCovers[playlist.id!] ?? [];
                    return (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleOpenPlaylist(playlist)}
                        className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-colors active:scale-[0.99] group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/[0.06]">
                          <PlaylistCover tracks={covers} imageUrl={playlist.coverUrl} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-white truncate">{playlist.title}</h3>
                          <p className="text-xs text-white/40 mt-0.5">
                            Playlist · {covers.length} tracks
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(playlist.id!); }}
                          className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </main>
          </motion.div>
        )}

        {/* ── PLAYLIST DETAIL VIEW ── */}
        {selectedPlaylist && (
          <motion.div key="playlist-detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="absolute inset-0 bg-brand-dark z-50 flex flex-col overflow-hidden">

            {/* Hero */}
            <div className="relative h-64 flex-shrink-0 flex flex-col justify-end">
              {/* Background blur */}
              <div className="absolute inset-0">
                {playlistTracks[0] && (
                  <img src={playlistTracks[0].coverUrl || FALLBACK_COVER} alt=""
                    className="w-full h-full object-cover opacity-40"
                    style={{ filter: 'blur(30px)', transform: 'scale(1.2)' }} />
                )}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%)' }} />
              </div>

              {/* Back button */}
              <button onClick={() => setSelectedPlaylist(null)}
                className="absolute top-5 left-5 p-2 rounded-full bg-black/50 backdrop-blur-md text-white z-10">
                <ArrowLeft size={20} />
              </button>

              {/* Playlist info */}
              <div className="relative z-10 px-6 pb-5 flex gap-4 items-end">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 shadow-2xl bg-white/[0.06]">
                  {selectedPlaylist.title === 'Liked Songs' ? (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                      {playlistTracks[0] && (
                        <img src={playlistTracks[0].coverUrl} alt=""
                          className="w-full h-full object-cover opacity-50 absolute inset-0" />
                      )}
                      <Heart size={36} className="text-white relative z-10" fill="white" />
                    </div>
                  ) : (
                    <PlaylistCover tracks={playlistTracks} imageUrl={selectedPlaylist.coverUrl} />
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Playlist</span>
                  <h1 className="text-xl font-black text-white mt-1 leading-tight truncate">
                    {selectedPlaylist.title}
                  </h1>
                  <p className="text-xs text-white/40 mt-1">{playlistTracks.length} tracks</p>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
              <button
                onClick={() => handleShufflePlay(playlistTracks)}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold">
                <Shuffle size={16} />
                Shuffle
              </button>
              <div className="flex items-center gap-3">
                <button className="text-white/30 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
                <button
                  onClick={() => playlistTracks.length > 0 && handlePlay(playlistTracks[0], playlistTracks)}
                  className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg">
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                </button>
              </div>
            </div>

            {/* Track list */}
            <main className="flex-1 overflow-y-auto px-6 pt-3 pb-36 no-scrollbar">
              {playlistTracks.length === 0 ? (
                <div className="text-center py-16">
                  <Music size={32} className="mx-auto mb-3 text-white/20" />
                  <p className="text-sm font-bold text-white/40">No tracks yet</p>
                  <p className="text-xs text-white/25 mt-1">Search for music and tap ♡ to add here</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {playlistTracks.map((track, idx) => (
                    <motion.div
                      key={`${track.id}-${idx}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handlePlay(track, playlistTracks)}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer group transition-colors"
                    >
                      <img
                        src={track.coverUrl || FALLBACK_COVER}
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                        className="w-11 h-11 rounded-xl object-cover shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-white transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-xs text-white/40 truncate mt-0.5">{track.artist} · {track.source}</p>
                      </div>
                      {track.duration && isFinite(Number(track.duration)) && (
                        <span className="text-[11px] font-mono text-white/25 shrink-0 flex items-center gap-1">
                          <Clock size={9} />
                          {track.duration}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE PLAYLIST MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black z-[110] pointer-events-auto" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-[120] pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex justify-center mb-5">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>
              <h3 className="text-lg font-black text-white mb-5">New Playlist</h3>
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                placeholder="Playlist name…"
                autoFocus
                className="w-full bg-white/[0.06] border border-white/10 focus:border-white/30 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none mb-4 placeholder:text-white/25"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/10 text-white text-sm font-bold py-3.5 rounded-2xl transition-all hover:bg-white/15">
                  Cancel
                </button>
                <button onClick={handleCreatePlaylist} disabled={!newPlaylistTitle.trim()}
                  className="flex-1 bg-white text-black text-sm font-bold py-3.5 rounded-2xl transition-all disabled:opacity-30 hover:opacity-90">
                  Create
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black z-[110] pointer-events-auto" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-[120] pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex justify-center mb-5">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-black text-white">Delete Playlist?</h3>
                <p className="text-xs text-white/40 mt-1">This can't be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-white/10 text-white text-sm font-bold py-3.5 rounded-2xl transition-all hover:bg-white/15">
                  Cancel
                </button>
                <button onClick={() => handleDeletePlaylist(deleteConfirmId!)}
                  className="flex-1 bg-red-600 text-white text-sm font-bold py-3.5 rounded-2xl transition-all hover:bg-red-500">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}