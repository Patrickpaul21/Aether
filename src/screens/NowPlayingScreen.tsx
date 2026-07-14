import { ChevronDown, MoreHorizontal, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Star, Volume, Volume1, Volume2, VolumeX, List, Radio, MessageSquareText, Check, Music2, Cast, Laptop, Download, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types';
import { usePlayerStore } from '../Store/playerStore';
import { usePlaylistStore } from '../Store/playliststore';
import { getLyrics, LyricLine } from '../addons/lyrics/lrclib';

interface NowPlayingProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  seek: (time: number) => void;
}

type ViewMode = 'artwork' | 'lyrics' | 'queue';

export default function NowPlayingScreen({ track, isPlaying, onTogglePlay, onClose, seek }: NowPlayingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('artwork');
  const [isStarred, setIsStarred] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const { toggleLiked, isLiked } = usePlaylistStore();
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [prevVolume, setPrevVolume] = useState(70);
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);
  const [showAirPlay, setShowAirPlay] = useState(false);
  const [activeRouting, setActiveRouting] = useState('My Device');
  const [downloadStates, setDownloadStates] = useState<Record<string, 'idle' | 'downloading' | 'downloaded'>>({});
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [addedToPlaylistId, setAddedToPlaylistId] = useState<number | null>(null);
  const [skipDirection, setSkipDirection] = useState<'left' | 'right' | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [artKey, setArtKey] = useState(track.id);

  const { volume, setVolume, currentTime, duration, next, prev, queue, currentIndex, removeFromQueue } = usePlayerStore();
  const { playlists, loadPlaylists, addTrack } = usePlaylistStore();

  const volumePercent = Math.round(volume * 100);
  const handleVolumeChange = (val: number) => setVolume(val / 100);

  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setArtKey(track.id); }, [track.id]);

  useEffect(() => {
    loadPlaylists();
    isLiked(track.id).then(setIsStarred);
  }, [track.id]);

  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState(false);

  useEffect(() => {
    setLyricsLines([]);
    setLyricsError(false);
    if (viewMode !== 'lyrics') return;
    setLyricsLoading(true);
    getLyrics(track.title, track.artist, duration || undefined)
      .then(lines => { setLyricsLines(lines); setLyricsError(lines.length === 0); })
      .finally(() => setLyricsLoading(false));
  }, [track.id, viewMode]);

  useEffect(() => {
    if (viewMode === 'lyrics' && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, viewMode, lyricsLines]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setShowVolumeHUD(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => setShowVolumeHUD(false), 1500);
    return () => { if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current); };
  }, [volume]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const adjustedTime = currentTime + 0.5;
  const currentLyricIndex = [...lyricsLines].reverse().findIndex(l => adjustedTime >= l.time);
  const activeIndex = currentLyricIndex !== -1 ? lyricsLines.length - 1 - currentLyricIndex : 0;

  const handleDownload = (trackId: string) => {
    if (downloadStates[trackId] === 'downloaded') { setDownloadStates(p => ({ ...p, [trackId]: 'idle' })); return; }
    if (downloadStates[trackId] === 'downloading') return;
    setDownloadStates(p => ({ ...p, [trackId]: 'downloading' }));
    setTimeout(() => setDownloadStates(p => ({ ...p, [trackId]: 'downloaded' })), 2000);
  };

  const handleNext = () => {
    setSkipDirection('left');
    next();
    setTimeout(() => setSkipDirection(null), 400);
  };

  const handlePrev = () => {
    setSkipDirection('right');
    prev();
    setTimeout(() => setSkipDirection(null), 400);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0 || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width * duration);
  };

  const VolumeIcon = ({ size = 16 }: { size?: number }) => {
    if (volumePercent === 0) return <VolumeX size={size} />;
    if (volumePercent <= 33) return <Volume size={size} />;
    if (volumePercent <= 66) return <Volume1 size={size} />;
    return <Volume2 size={size} />;
  };

  const sliderBg = `linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%, rgba(255,255,255,0.2) 100%)`;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
      className="absolute inset-0 z-[100] flex flex-col overflow-hidden text-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Panning blurred background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ scale: isPlaying ? 1.1 : 1.05, x: isPlaying ? [0, 8, -8, 0] : 0 }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
      >
        <img src={track.coverUrl} alt="" className="w-full h-full object-cover"
          style={{ filter: 'saturate(1.8) blur(55px)', opacity: 0.8 }} />
      </motion.div>

      {/* Deep overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.65) 72%, rgba(0,0,0,0.97) 100%)' }} />

      {/* Full screen album art */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <motion.img
            key={artKey}
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: skipDirection === 'left' ? 80 : skipDirection === 'right' ? -80 : 0 }}
            animate={{ opacity: 1, x: 0, scale: isPlaying ? 1 : 0.97 }}
            exit={{ opacity: 0, x: skipDirection === 'left' ? -80 : 80 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </AnimatePresence>
        {/* Tap zone */}
        <button
          className="absolute inset-0 w-full h-full"
          onClick={() => { if (viewMode === 'artwork') setControlsVisible(v => !v); }}
        />
      </div>

      {/* Gradient over art */}
      <div className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.97) 100%)' }} />

      {/* Volume HUD */}
      <div className="absolute top-16 left-0 right-0 z-50 flex justify-center pointer-events-none px-8">
        <AnimatePresence>
          {showVolumeHUD && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto"
            >
              <VolumeIcon size={14} />
              <div className="w-36 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${volumePercent}%` }} />
              </div>
              <span className="text-[11px] font-bold tracking-wide text-white/80 w-8 text-right font-mono">{volumePercent}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* UI layer */}
      <div className="relative z-30 flex flex-col h-full">

        {/* Header */}
        <AnimatePresence>
          {(controlsVisible || viewMode !== 'artwork') && (
            <motion.header
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="px-6 pt-5 pb-3 flex justify-between items-center"
            >
              <button onClick={onClose} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
                <ChevronDown size={26} />
              </button>
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-0.5">Playing From</span>
                <span className="block text-[14px] font-semibold tracking-tight">{track.source}</span>
              </div>
              <button onClick={() => setShowPlaylistPicker(true)} className="p-2 -mr-2 text-white/80 hover:text-white transition-colors">
                <MoreHorizontal size={22} />
              </button>
            </motion.header>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Artwork controls */}
        {viewMode === 'artwork' && (
          <AnimatePresence>
            {controlsVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="px-6 pb-4 pointer-events-auto"
              >
                {/* Track info */}
                <div className="flex justify-between items-end mb-5">
                  <div className="flex-1 min-w-0 pr-3">
                    <motion.h1
                      key={track.title}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[26px] font-black text-white tracking-tight leading-tight truncate"
                      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
                    >
                      {track.title}
                    </motion.h1>
                    <motion.p key={track.artist} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 }} className="text-[16px] text-white/50 font-medium truncate mt-1">
                      {track.artist}
                    </motion.p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={async () => { const r = await toggleLiked(track); setIsStarred(r); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isStarred ? 'text-white' : 'text-white/40'}`}
                    >
                      <Star size={22} fill={isStarred ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => handleDownload(track.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        downloadStates[track.id] === 'downloaded' ? 'text-brand-green'
                        : downloadStates[track.id] === 'downloading' ? 'text-white/30' : 'text-white/40 hover:text-white'}`}>
                      {downloadStates[track.id] === 'downloaded'
                        ? <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Check size={20} strokeWidth={2.5} /></motion.div>
                        : downloadStates[track.id] === 'downloading'
                        ? <Loader2 size={20} className="animate-spin text-brand-green" />
                        : <Download size={20} />}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div
                    ref={progressRef}
                    className="relative w-full cursor-pointer"
                    style={{ paddingTop: 8, paddingBottom: 8 }}
                    onClick={handleProgressClick}
                    onMouseDown={() => setScrubbing(true)}
                    onMouseUp={() => setScrubbing(false)}
                    onMouseLeave={() => setScrubbing(false)}
                  >
                    <div className="w-full rounded-full overflow-hidden bg-white/20 transition-all"
                      style={{ height: scrubbing ? 5 : 3, transition: 'height 0.15s' }}>
                      <div className="h-full bg-white rounded-full transition-all duration-700 ease-linear"
                        style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-white/40 font-medium tracking-tight -mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
                  </div>
                </div>

                {/* Transport */}
                <div className="flex justify-between items-center mb-6 px-1">
                  <button onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-2 relative transition-all active:scale-90 ${isShuffle ? 'text-white' : 'text-white/35'}`}>
                    <Shuffle size={21} />
                    {isShuffle && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                  </button>
                  <motion.button onClick={handlePrev} whileTap={{ scale: 0.86 }} className="p-2 text-white">
                    <SkipBack size={32} fill="currentColor" strokeWidth={0} />
                  </motion.button>
                  <motion.button
                    onClick={onTogglePlay}
                    whileTap={{ scale: 0.91 }}
                    className="w-[72px] h-[72px] rounded-full bg-white text-black flex items-center justify-center"
                    style={{ boxShadow: '0 8px 32px rgba(255,255,255,0.22), 0 2px 10px rgba(0,0,0,0.5)' }}
                  >
                    <AnimatePresence mode="wait">
                      {isPlaying
                        ? <motion.div key="pause" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.1 }}>
                            <Pause size={30} fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        : <motion.div key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.1 }}>
                            <Play size={30} fill="currentColor" strokeWidth={0} className="ml-1" />
                          </motion.div>
                      }
                    </AnimatePresence>
                  </motion.button>
                  <motion.button onClick={handleNext} whileTap={{ scale: 0.86 }} className="p-2 text-white">
                    <SkipForward size={32} fill="currentColor" strokeWidth={0} />
                  </motion.button>
                  <button onClick={() => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
                    className={`p-2 relative transition-all active:scale-90 ${repeatMode !== 'off' ? 'text-white' : 'text-white/35'}`}>
                    <Repeat size={21} />
                    {repeatMode === 'one' && <span className="absolute top-1 right-1 bg-white text-black text-[8px] font-black w-3 h-3 rounded-full flex items-center justify-center">1</span>}
                    {repeatMode === 'all' && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 mb-6 px-1">
                  <button onClick={() => { if (volumePercent > 0) { setPrevVolume(volumePercent); handleVolumeChange(0); } else handleVolumeChange(prevVolume || 70); }}
                    className="text-white/40 hover:text-white transition-colors shrink-0"><VolumeIcon size={16} /></button>
                  <input type="range" min="0" max="100" value={volumePercent}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full
                      [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-[5px]
                      [&::-webkit-slider-thumb]:shadow-md active:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    style={{ background: sliderBg }} />
                  <button onClick={() => handleVolumeChange(100)} className="text-white/40 hover:text-white transition-colors shrink-0">
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Bottom actions */}
                <div className="flex justify-between items-center px-2">
                  <button onClick={() => { setViewMode('lyrics'); setControlsVisible(true); }}
                    className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"><MessageSquareText size={20} /></button>
                  <button onClick={() => setShowAirPlay(true)}
                    className="p-2 relative text-white/40 hover:text-white transition-colors active:scale-90">
                    <Radio size={20} />
                    <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-brand-green rounded-full" />
                  </button>
                  <button onClick={() => { setViewMode('queue'); setControlsVisible(true); }}
                    className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"><List size={20} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Lyrics */}
        {viewMode === 'lyrics' && (
          <motion.div key="lyrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col px-6 pt-6 pb-10 overflow-hidden">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h2 className="text-2xl font-bold">Lyrics</h2>
              <button onClick={() => setViewMode('artwork')} className="text-white/40 hover:text-white transition-colors"><ChevronDown size={24} /></button>
            </div>
            <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-10 scroll-smooth pb-28">
              {lyricsLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-white/40 text-sm">
                  <Loader2 size={18} className="animate-spin" /> Finding lyrics…
                </div>
              ) : lyricsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <MessageSquareText size={32} className="text-white/20 mb-3" />
                  <p className="text-sm font-bold text-white/40">No lyrics found</p>
                  <p className="text-xs text-white/25 mt-1">Try a different track</p>
                </div>
              ) : (
                lyricsLines.map((line, i) => (
                  <p key={i} ref={i === activeIndex ? activeLyricRef : null}
                    className={`text-[34px] font-black leading-tight tracking-tight transition-all duration-700 ${
                      i === activeIndex ? 'text-white opacity-100' : i < activeIndex ? 'text-white/15 opacity-30' : 'text-white/25 opacity-60'}`}>
                    {line.text}
                  </p>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Queue */}
        {viewMode === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
            className="flex-1 flex flex-col px-6 pt-6 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase">Up Next</h2>
              <button onClick={() => setViewMode('artwork')} className="text-white/40 hover:text-white transition-colors"><ChevronDown size={22} /></button>
            </div>
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/25"><List size={24} /></div>
                <p className="font-semibold text-white/70 text-sm">Queue is empty</p>
                <p className="text-xs text-white/35 mt-1.5 max-w-[220px]">Add tracks from your sources to build a queue.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                {queue.map((item, idx) => (
                  <div key={item.id}
                    className={`flex items-center gap-3 border p-3 rounded-2xl select-none transition-colors ${
                      idx === currentIndex ? 'bg-white/[0.10] border-white/[0.12]' : 'bg-white/[0.06] border-white/[0.05]'}`}>
                    <img src={item.coverUrl} alt="" className="w-11 h-11 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${idx === currentIndex ? 'text-brand-green' : ''}`}>{item.title}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{item.artist}</p>
                    </div>
                    {idx === currentIndex && <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider shrink-0">Now</span>}
                    <button onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                      className="p-2 -mr-1 text-white/30 hover:text-red-400 active:scale-90 transition-all"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <div className="flex justify-center pb-2 pt-1 shrink-0">
          <div className="w-28 h-[3px] bg-white/20 rounded-full" />
        </div>
      </div>

      {/* AirPlay Drawer */}
      <AnimatePresence>
        {showAirPlay && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={() => setShowAirPlay(false)} className="absolute inset-0 bg-black z-[110]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2.5rem] p-6 z-[120] max-h-[88vh] text-white shadow-2xl"
              style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}>
              <div className="flex justify-center mb-5"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[17px] font-bold">Audio Routing</h3>
                <button onClick={() => setShowAirPlay(false)} className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">Done</button>
              </div>
              <div className="space-y-2.5 mb-6">
                {[
                  { id: 'device', name: 'My Device', desc: 'Internal Speaker', icon: <Laptop size={17} /> },
                  { id: 'homepod', name: 'Living Room HomePod', desc: 'AirPlay', icon: <Music2 size={17} /> },
                  { id: 'tv', name: 'Kitchen Smart TV', desc: 'Cast', icon: <Cast size={17} /> },
                  { id: 'airpods', name: 'AirPods Max', desc: 'Bluetooth', icon: <Radio size={17} /> },
                ].map((device) => {
                  const isActive = activeRouting === device.name;
                  return (
                    <div key={device.id} onClick={() => setActiveRouting(device.name)}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-white/12 border border-white/15' : 'bg-white/5 border border-transparent hover:bg-white/8'}`}>
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-white/15 text-white' : 'bg-white/8 text-white/50'}`}>{device.icon}</div>
                        <div>
                          <p className={`text-[14px] font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>{device.name}</p>
                          <p className="text-xs text-white/40">{device.desc}</p>
                        </div>
                      </div>
                      {isActive && (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check size={11} strokeWidth={3} className="text-black" />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 px-1">
                <button onClick={() => { if (volumePercent > 0) { setPrevVolume(volumePercent); handleVolumeChange(0); } else handleVolumeChange(prevVolume || 70); }}
                  className="text-white/40 hover:text-white transition-colors"><VolumeIcon size={16} /></button>
                <input type="range" min="0" max="100" value={volumePercent} onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-[5px]"
                  style={{ background: sliderBg }} />
                <button onClick={() => handleVolumeChange(100)} className="text-white/40 hover:text-white transition-colors"><Volume2 size={16} /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Playlist Drawer */}
      <AnimatePresence>
        {showPlaylistPicker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={() => { setShowPlaylistPicker(false); setAddedToPlaylistId(null); }} className="absolute inset-0 bg-black z-[110]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2.5rem] p-6 z-[120] text-white shadow-2xl"
              style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}>
              <div className="flex justify-center mb-5"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[17px] font-bold">Add to Playlist</h3>
                <button onClick={() => { setShowPlaylistPicker(false); setAddedToPlaylistId(null); }}
                  className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">Done</button>
              </div>
              {playlists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-bold text-white/40">No playlists yet</p>
                  <p className="text-xs text-white/25 mt-1">Create a playlist in your Library first</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {playlists.map((playlist) => {
                    const isAdded = addedToPlaylistId === playlist.id;
                    return (
                      <div key={playlist.id}
                        onClick={async () => { if (isAdded) return; await addTrack(playlist.id!, track); setAddedToPlaylistId(playlist.id!); }}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${isAdded ? 'bg-brand-green/10 border border-brand-green/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-800 to-cyan-500 flex items-center justify-center">
                            <Music2 size={16} className="text-white/80" />
                          </div>
                          <p className={`text-[14px] font-semibold ${isAdded ? 'text-brand-green' : 'text-white/80'}`}>{playlist.title}</p>
                        </div>
                        {isAdded && (
                          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center">
                            <Check size={11} strokeWidth={3} className="text-black" />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}