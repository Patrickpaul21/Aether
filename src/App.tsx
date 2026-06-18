import { Home, Search, Library, Settings, Play, Pause, SkipForward, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Tab, Track } from './types';
import { CURRENTLY_PLAYING } from './constants';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import LibraryScreen from './screens/LibraryScreen';
import AddOnsScreen from './screens/AddOnsScreen';
import SettingsScreen from './screens/SettingsScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';
import { usePlayer } from './hooks/usePlayer';
import { usePlayerStore } from './Store/playerStore';
import { useEffect } from 'react';
import React from 'react';
import { saveToken } from './addons/spotify/index';
import { usePlaylistStore } from './Store/playliststore';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Handle Spotify OAuth callback
 // Ensure Liked Songs playlist exists on app load
 const { ensureLikedSongs } = usePlaylistStore();
 useEffect(() => {
   ensureLikedSongs();
 }, []);
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        saveToken(token);
        window.location.hash = '';
        setActiveTab('library');
      }
    }
  }, []);

  // Mount the Howler audio engine once at the app root
  const { seek } = usePlayer();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const setTrack = usePlayerStore((s) => s.setTrack);

  const displayTrack = currentTrack ?? CURRENTLY_PLAYING;

  const handlePlayTrack = (track: Track, queue?: Track[]) => {
    const clean = (t: Track): Track => ({ ...t, streamUrl: undefined });
    setTrack(clean(track), queue?.map(clean));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen onPlayTrack={handlePlayTrack} />;
      case 'search': return <SearchScreen onPlayTrack={handlePlayTrack} />;
      case 'library': return <LibraryScreen onPlayTrack={handlePlayTrack} />;
      case 'addons': return <AddOnsScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen onPlayTrack={handlePlayTrack} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-brand-dark overflow-hidden relative shadow-2xl border-x border-brand-border">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Mini Player */}
      {!isPlayerOpen && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-24 left-4 right-4 z-40"
        >
          <div 
            onClick={() => setIsPlayerOpen(true)}
            className="bg-brand-card/95 backdrop-blur-md border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 flex-shrink-0 bg-zinc-800 rounded overflow-hidden">
                <img src={displayTrack.coverUrl} alt={displayTrack.title} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold truncate">{displayTrack.title}</h4>
                <p className="text-[10px] text-gray-400 truncate">{displayTrack.artist} • {displayTrack.source}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 px-2" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => currentTrack && togglePlay()}
                className="text-white hover:text-brand-green transition-colors"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button 
                  onClick={() => currentTrack && next()}
                   className="text-white hover:text-brand-green transition-colors">
                   <SkipForward size={20} fill="currentColor" />
                </button>
            </div>
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green rounded-full transition-[width] duration-200"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 inset-x-0 bg-brand-dark/95 backdrop-blur-md border-t border-brand-border px-6 py-4 flex justify-between items-center z-50 pb-8">
        <NavButton active={activeTab === 'home'} label="Home" icon={<Home size={22} />} onClick={() => setActiveTab('home')} />
        <NavButton active={activeTab === 'search'} label="Search" icon={<Search size={22} />} onClick={() => setActiveTab('search')} />
        <NavButton active={activeTab === 'library'} label="Library" icon={<Library size={22} />} onClick={() => setActiveTab('library')} />
        <NavButton active={activeTab === 'addons'} label="Add-ons" icon={<LayoutGrid size={22} />} onClick={() => setActiveTab('addons')} />
        <NavButton active={activeTab === 'settings'} label="Settings" icon={<Settings size={22} />} onClick={() => setActiveTab('settings')} />
      </nav>

      {/* iOS Home Indicator */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center z-50 pointer-events-none">
        <div className="w-32 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Full Player Overlay */}
      <AnimatePresence>
        {isPlayerOpen && (
          <NowPlayingScreen 
            track={displayTrack} 
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onClose={() => setIsPlayerOpen(false)} 
            seek={seek}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-brand-green' : 'text-gray-500'}`}
    >
      <div className={active ? 'scale-110 transition-transform' : ''}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
