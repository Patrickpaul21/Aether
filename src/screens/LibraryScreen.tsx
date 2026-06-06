import { Plus, ListFilter, Search, Grid2X2, Heart, ArrowUpRight, ArrowLeft, Play, Clock, Music, Disc, Info, Calendar, Sparkles, Trash2, X, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, LibraryItem } from '../types';
import { usePlaylistStore } from '../Store/playliststore';
import { Playlist } from '../db/database';

// Keep mock artist data for artist view
interface ArtistDetail {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  monthlyListeners: string;
  followers: string;
  verified: boolean;
  popularTracks: Track[];
  discography: { title: string; year: string; type: string; imageUrl: string }[];
}

const MOCK_ARTIST_DETAILS: Record<string, ArtistDetail> = {
  '4': {
    id: '4',
    name: 'Nils Frahm',
    verified: true,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw',
    bio: 'German composer, producer, and celebrated pianist known for combining classical and electronic music with an unconventional, felt-damped keyboard approach.',
    monthlyListeners: '2,481,254 monthly listeners',
    followers: '984K followers',
    popularTracks: [
      { id: 'lib-t3', title: 'Says', artist: 'Nils Frahm', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '8:18' },
    ],
    discography: [
      { title: 'All Melody', year: '2018', type: 'Album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw' },
      { title: 'Spaces', year: '2013', type: 'Album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw' },
    ]
  }
};

interface LibraryScreenProps {
  onPlayTrack?: (track: Track) => void;
}

export default function LibraryScreen({ onPlayTrack }: LibraryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Playlists' | 'Artists'>('All');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { playlists, loading, loadPlaylists, createPlaylist, deletePlaylist, getPlaylistTracks } = usePlaylistStore();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleOpenPlaylist = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    const tracks = await getPlaylistTracks(playlist.id!);
    setPlaylistTracks(tracks);
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

  // Convert playlists to LibraryItem format for display
  const playlistItems = playlists.map(p => ({
    id: String(p.id),
    title: p.title,
    subtitle: `Playlist`,
    type: 'playlist' as const,
    imageUrl: p.coverUrl,
    raw: p,
  }));

  // Mock artist items — kept from original
  const artistItems = [
    {
      id: '4',
      title: 'Nils Frahm',
      subtitle: 'Artist • 2.4M listeners',
      type: 'artist' as const,
      imageUrl: MOCK_ARTIST_DETAILS['4'].avatarUrl,
    }
  ];

  const allItems = [...playlistItems, ...artistItems];

  const filteredItems = allItems.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Playlists') return item.type === 'playlist';
    if (activeFilter === 'Artists') return item.type === 'artist';
    return true;
  });

  return (
    <div className="flex flex-col relative h-full">
      <AnimatePresence mode="popLayout">

        {/* VIEW 1: MAIN LIBRARY LIST */}
        {!selectedPlaylist && (
          <motion.div
            key="library-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <header className="sticky top-0 bg-brand-dark/95 backdrop-blur-md z-50 px-4 pt-5 pb-2">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-card flex items-center justify-center">
                    <Music size={16} className="text-white/50" />
                  </div>
                  <h1 className="text-2xl font-bold">Your Library</h1>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 text-white hover:text-brand-green transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>

              <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-2">
                {['All', 'Playlists', 'Artists'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeFilter === filter
                        ? 'bg-brand-green text-black'
                        : 'bg-brand-card text-white border border-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </nav>
            </header>

            <main className="px-4 pb-36 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between py-4 px-2">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white">
                  <ListFilter size={16} />
                  <span>Recents</span>
                </button>
                <div className="flex items-center gap-4 text-gray-400">
                  <button><Search size={20} /></button>
                  <button><Grid2X2 size={20} /></button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-white/30 text-sm">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <Music size={36} className="mx-auto text-white/20 mb-3" />
                  <p className="text-sm font-bold text-white/40">No playlists yet</p>
                  <p className="text-xs text-white/25 mt-1">Tap + to create your first playlist</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.type === 'playlist') {
                          const raw = (item as any).raw as Playlist;
                          handleOpenPlaylist(raw);
                        }
                      }}
                      className="flex items-center gap-4 group p-2.5 rounded-xl cursor-pointer transition-all duration-200 bg-transparent hover:bg-zinc-900/40 border border-transparent hover:border-white/5"
                    >
                      <div className="w-14 h-14 flex-shrink-0 bg-brand-card rounded-lg flex items-center justify-center shadow-md overflow-hidden relative group-hover:scale-105 transition-transform">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-800 to-cyan-500">
                            <Music size={20} className="text-white/80" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate text-sm text-white group-hover:text-brand-green transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-400">{item.subtitle}</p>
                      </div>
                      {item.type === 'playlist' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(Number(item.id));
                          }}
                          className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </main>
          </motion.div>
        )}

        {/* VIEW 2: PLAYLIST DETAIL */}
        {selectedPlaylist && (
          <motion.div
            key="library-playlist-detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col h-full absolute inset-0 bg-brand-dark z-50 overflow-hidden"
          >
            <div className="relative h-52 flex-shrink-0 flex flex-col justify-end p-6 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-black/60">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="absolute top-5 left-6 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-zinc-800 transition-colors z-10"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="relative z-10 flex gap-4 items-end">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center shadow-2xl border border-white/10 bg-gradient-to-tr from-purple-800 to-cyan-500">
                  <Music size={36} className="text-white/80" />
                </div>
                <div className="min-w-0 pb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green font-bold uppercase tracking-widest">
                    Playlist
                  </span>
                  <h1 className="text-xl font-black text-white mt-1.5 leading-tight truncate">
                    {selectedPlaylist.title}
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">{playlistTracks.length} tracks</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-y border-brand-border bg-brand-dark/50 backdrop-blur">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                {playlistTracks.length} tracks
              </span>
              <button
                onClick={() => {
                  if (playlistTracks.length > 0 && onPlayTrack) {
                    onPlayTrack(playlistTracks[0]);
                  }
                }}
                className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </button>
            </div>

            <main className="flex-1 overflow-y-auto px-6 pt-4 pb-36 no-scrollbar">
              {playlistTracks.length === 0 ? (
                <div className="text-center py-16">
                  <Music size={32} className="mx-auto mb-3 text-white/20" />
                  <p className="text-sm font-bold text-white/40">No tracks yet</p>
                  <p className="text-xs text-white/25 mt-1">Search for music and add it here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {playlistTracks.map((track, idx) => (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlayTrack && onPlayTrack(track)}
                      className="flex items-center gap-4 p-2.5 rounded-lg bg-zinc-900/10 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 cursor-pointer group transition-all"
                    >
                      <span className="w-4 text-xs font-mono text-zinc-500 text-center group-hover:text-brand-green">
                        {idx + 1}
                      </span>
                      <img src={track.coverUrl} className="w-10 h-10 rounded object-cover shadow" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-green transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                      </div>
                      {track.duration && (
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                          <Clock size={10} />
                          {track.duration}
                        </span>
                      )}
                    </div>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-50 pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
              <h3 className="text-lg font-black text-white mb-4">New Playlist</h3>
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                placeholder="Playlist name..."
                autoFocus
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-xs font-black py-3 rounded-xl transition-all text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistTitle.trim()}
                  className="flex-1 bg-brand-green hover:opacity-90 text-black text-xs font-black py-3 rounded-xl transition-all disabled:opacity-30"
                >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-50 pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
              <div className="text-center mb-6">
                <Trash2 size={32} className="mx-auto text-red-400 mb-3" />
                <h3 className="text-lg font-black text-white">Delete Playlist?</h3>
                <p className="text-xs text-white/40 mt-1">This can't be undone.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-xs font-black py-3 rounded-xl transition-all text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePlaylist(deleteConfirmId)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-3 rounded-xl transition-all"
                >
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