import { ChevronDown, MoreHorizontal, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Star, Volume, Volume1, Volume2, VolumeX, List, Radio, MessageSquareText, Check, Music2, Cast, Laptop, Download, Loader2, GripVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Track } from '../types';
import { usePlayerStore } from '../Store/playerStore';

interface NowPlayingProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  seek: (time: number) => void;
}

type ViewMode = 'artwork' | 'lyrics' | 'queue';
interface LyricLine { text: string; time: number; }

export default function NowPlayingScreen({ track, isPlaying, onTogglePlay, onClose, seek }: NowPlayingProps) {
  const [viewMode,      setViewMode]      = useState<ViewMode>('artwork');
  const [isStarred,     setIsStarred]     = useState(false);
  const [isShuffle,     setIsShuffle]     = useState(false);
  const [repeatMode,    setRepeatMode]    = useState<'off' | 'all' | 'one'>('off');
  const [prevVolume,    setPrevVolume]    = useState(70);   // stores 0-100 for mute/unmute
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);
  const [showAirPlay,   setShowAirPlay]   = useState(false);
  const [activeRouting, setActiveRouting] = useState('My Device');
  const [downloadStates, setDownloadStates] = useState<Record<string, 'idle' | 'downloading' | 'downloaded'>>({});
  const { volume, setVolume, currentTime, duration, next, prev, queue, currentIndex, removeFromQueue } = usePlayerStore();

  // Store is 0–1. UI works in 0–100 throughout this file.
  const volumePercent                    = Math.round(volume * 100);
  const handleVolumeChange = (val: number) => setVolume(val / 100);

  const hudTimeoutRef  = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender  = useRef(true);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef     = useRef<HTMLParagraphElement>(null);

  const lyricsLines: LyricLine[] = [
    { time: 0,   text: "Searching for the signal in the static" },
    { time: 10,  text: "Fragments of a world we used to know" },
    { time: 20,  text: "The baseline pulses like a heartbeat" },
    { time: 30,  text: "Moving where the silver shadows go" },
    { time: 40,  text: "Protocol initiated, eyes wide open" },
    { time: 50,  text: "System override, no turning back" },
    { time: 60,  text: "Digital remnants of an ancient song" },
    { time: 70,  text: "Echoing through the corridors of time" },
    { time: 80,  text: "Everything is numbers, silver light" },
    { time: 100, text: "Moving through the middle of the night" },
    { time: 120, text: "Eclipse Protocol, set it in motion" },
    { time: 130, text: "Deep dive into the digital ocean" },
    { time: 140, text: "Lines of code, rewriting history" },
    { time: 150, text: "Unraveling the ultimate mystery" },
    { time: 160, text: "Zeroes and ones in a perfect line" },
    { time: 170, text: "Infinite loops in a vast design" },
    { time: 180, text: "The signal fades into the blue" },
    { time: 190, text: "Starting over, starting brand new" },
  ];

  useEffect(() => {
    if (viewMode === 'lyrics' && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, viewMode]);

  // Show volume HUD whenever volume changes (skip first render)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setShowVolumeHUD(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => setShowVolumeHUD(false), 1500);
    return () => { if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current); };
  }, [volume]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const currentLyricIndex = [...lyricsLines].reverse().findIndex(l => currentTime >= l.time);
  const activeIndex       = currentLyricIndex !== -1 ? lyricsLines.length - 1 - currentLyricIndex : 0;

  const handleDownload = (trackId: string) => {
    if (downloadStates[trackId] === 'downloaded') { setDownloadStates(p => ({ ...p, [trackId]: 'idle' })); return; }
    if (downloadStates[trackId] === 'downloading') return;
    setDownloadStates(p => ({ ...p, [trackId]: 'downloading' }));
    setTimeout(() => setDownloadStates(p => ({ ...p, [trackId]: 'downloaded' })), 2000);
  };

  // ── Volume icon helper (uses 0-100 percent) ──────────────────────────────
  const VolumeIcon = ({ size = 16 }: { size?: number }) => {
    if (volumePercent === 0)   return <VolumeX size={size} />;
    if (volumePercent <= 33)   return <Volume  size={size} />;
    if (volumePercent <= 66)   return <Volume1 size={size} />;
    return <Volume2 size={size} />;
  };

  // ── Shared volume slider background style ────────────────────────────────
  const sliderBg = `linear-gradient(to right,
    rgba(255,255,255,0.9) 0%,
    rgba(255,255,255,0.9) ${volumePercent}%,
    rgba(255,255,255,0.2) ${volumePercent}%,
    rgba(255,255,255,0.2) 100%)`;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
      className="absolute inset-0 z-[100] flex flex-col overflow-hidden bg-black text-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={track.coverUrl} alt="" className="w-full h-full object-cover opacity-70 scale-110"
          style={{ filter: 'saturate(1.4) blur(40px)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/90" />
      </div>

      <div className="relative z-10 flex flex-col h-full">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[3px] bg-white/25 rounded-full" />
        </div>

        {/* Header */}
        <header className="px-6 pt-1 pb-3 flex justify-between items-center">
          <button onClick={onClose} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronDown size={26} />
          </button>
          <div className="text-center">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-0.5">Playing From</span>
            <span className="block text-[14px] font-semibold tracking-tight">{track.source}</span>
          </div>
          <button className="p-2 -mr-2 text-white/80 hover:text-white transition-colors">
            <MoreHorizontal size={22} />
          </button>
        </header>

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
                  <motion.div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${volumePercent}%` }}   // ← fixed: was ${volume}%
                    layoutId="hudVolumeFill"
                    transition={{ type: 'spring', damping: 20, stiffness: 160 }}
                  />
                </div>
                <span className="text-[11px] font-bold tracking-wide text-white/80 w-8 text-right font-mono">
                  {volumePercent}%                             {/* ← fixed: was {volume}% */}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-6 flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── ARTWORK VIEW ── */}
            {viewMode === 'artwork' && (
              <motion.div key="artwork" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.25 }} className="flex-1 flex flex-col">

                {/* Album art */}
                <div className="flex-1 flex items-center justify-center py-4">
                  <motion.div
                    animate={{ scale: isPlaying ? 1 : 0.92 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 160 }}
                    className="w-full aspect-square rounded-[22px] overflow-hidden"
                    style={{ boxShadow: '0 32px 72px -8px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.6)' }}
                  >
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  </motion.div>
                </div>

                {/* Track info */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex-1 min-w-0 pr-4">
                    <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight truncate">{track.title}</h1>
                    <p className="text-[15px] text-white/50 font-medium truncate mt-0.5">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setIsStarred(!isStarred)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isStarred ? 'text-white' : 'text-white/40'}`}>
                      <Star size={20} fill={isStarred ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => handleDownload(track.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        downloadStates[track.id] === 'downloaded' ? 'text-brand-green'
                        : downloadStates[track.id] === 'downloading' ? 'text-white/30'
                        : 'text-white/40 hover:text-white'}`}>
                      {downloadStates[track.id] === 'downloaded' ? <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Check size={20} strokeWidth={2.5} /></motion.div>
                        : downloadStates[track.id] === 'downloading' ? <Loader2 size={20} className="animate-spin text-brand-green" />
                        : <Download size={20} />}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer"
                    onClick={(e) => {
                      if (duration <= 0) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      seek((e.clientX - rect.left) / rect.width * duration);
                    }}>
                    <div className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-1000 ease-linear"
                      style={{ left: duration > 0 ? `calc(${(currentTime / duration) * 100}% - 6px)` : '0' }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] text-white/40 font-medium tracking-tight">
                    <span>{formatTime(currentTime)}</span>
                    <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
                  </div>
                </div>

                {/* Transport controls */}
                <div className="flex justify-between items-center mb-7 px-1">
                  <button onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-2 transition-all active:scale-90 ${isShuffle ? 'text-white' : 'text-white/35'}`}>
                    <Shuffle size={20} />
                    {isShuffle && <span className="block w-1 h-1 bg-white rounded-full mx-auto mt-1" />}
                  </button>
                  <button onClick={prev} className="p-2 text-white active:scale-90 active:opacity-60 transition-all">
                    <SkipBack size={30} fill="currentColor" strokeWidth={0} />
                  </button>
                  <button onClick={onTogglePlay}
                    className="w-[70px] h-[70px] rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform"
                    style={{ boxShadow: '0 8px 30px rgba(255,255,255,0.2)' }}>
                    {isPlaying
                      ? <Pause size={28} fill="currentColor" strokeWidth={0} />
                      : <Play  size={28} fill="currentColor" strokeWidth={0} className="ml-1" />}
                  </button>
                  <button onClick={next} className="p-2 text-white active:scale-90 active:opacity-60 transition-all">
                    <SkipForward size={30} fill="currentColor" strokeWidth={0} />
                  </button>
                  <button onClick={() => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
                    className={`p-2 relative transition-all active:scale-90 ${repeatMode !== 'off' ? 'text-white' : 'text-white/35'}`}>
                    <Repeat size={20} />
                    {repeatMode === 'one' && (
                      <span className="absolute top-1 right-1 bg-white text-black text-[8px] font-black w-3 h-3 rounded-full flex items-center justify-center leading-none">1</span>
                    )}
                    {repeatMode === 'all' && <span className="block w-1 h-1 bg-white rounded-full mx-auto mt-1" />}
                  </button>
                </div>

                {/* ── Volume slider ── */}
                <div className="flex items-center gap-3 mb-7 px-1">
                  {/* Mute toggle */}
                  <button
                    onClick={() => {
                      if (volumePercent > 0) {
                        setPrevVolume(volumePercent);
                        handleVolumeChange(0);
                      } else {
                        handleVolumeChange(prevVolume || 70);
                      }
                    }}
                    className="text-white/40 hover:text-white transition-colors shrink-0"
                  >
                    <VolumeIcon size={16} />
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumePercent}                                    // ← fixed
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}  // ← fixed
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-runnable-track]:h-1
                      [&::-webkit-slider-runnable-track]:rounded-full
                      [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-[5px]
                      [&::-webkit-slider-thumb]:shadow-md active:[&::-webkit-slider-thumb]:scale-125
                      transition-all"
                    style={{ background: sliderBg }}                        // ← fixed
                  />

                  {/* Max volume */}
                  <button
                    onClick={() => handleVolumeChange(100)}                 // ← fixed
                    className="text-white/40 hover:text-white transition-colors shrink-0"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Bottom actions */}
                <div className="flex justify-between items-center px-2 pb-2">
                  <button onClick={() => setViewMode('lyrics')} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90">
                    <MessageSquareText size={20} />
                  </button>
                  <button onClick={() => setShowAirPlay(true)} className="p-2 relative text-white/40 hover:text-white transition-colors active:scale-90">
                    <Radio size={20} className={showAirPlay ? 'text-brand-green' : ''} />
                    <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-brand-green rounded-full" />
                  </button>
                  <button onClick={() => setViewMode('queue')} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90">
                    <List size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── LYRICS VIEW ── */}
            {viewMode === 'lyrics' && (
              <motion.div key="lyrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col pt-6 pb-10 overflow-hidden">
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <h2 className="text-2xl font-bold">Lyrics</h2>
                  <button onClick={() => setViewMode('artwork')} className="text-white/40 hover:text-white transition-colors">
                    <ChevronDown size={24} />
                  </button>
                </div>
                <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-10 scroll-smooth pb-28">
                  {lyricsLines.map((line, i) => (
                    <p key={i} ref={i === activeIndex ? activeLyricRef : null}
                      className={`text-[34px] font-black leading-tight tracking-tight transition-all duration-700 ${
                        i === activeIndex ? 'text-white opacity-100'
                        : i < activeIndex ? 'text-white/15 opacity-30'
                        : 'text-white/25 opacity-60'}`}>
                      {line.text}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── QUEUE VIEW ── */}
            {viewMode === 'queue' && (
              <motion.div key="queue" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }} className="flex-1 flex flex-col pt-6 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase">Up Next</h2>
                  <button onClick={() => setViewMode('artwork')} className="text-white/40 hover:text-white transition-colors">
                    <ChevronDown size={22} />
                  </button>
                </div>
                {queue.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/25">
                      <List size={24} />
                    </div>
                    <p className="font-semibold text-white/70 text-sm">Queue is empty</p>
                    <p className="text-xs text-white/35 mt-1.5 max-w-[220px]">Add tracks from your sources to build a queue.</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
  {queue.map((item, idx) => (
    <div
      key={item.id}
      className={`flex items-center gap-3 border p-3 rounded-2xl select-none transition-colors ${
        idx === currentIndex
          ? 'bg-white/[0.10] border-white/[0.12]'
          : 'bg-white/[0.06] border-white/[0.05]'
      }`}
    >
      <img
        src={item.coverUrl}
        alt=""
        className="w-11 h-11 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${
          idx === currentIndex ? 'text-brand-green' : ''
        }`}>
          {item.title}
        </p>
        <p className="text-xs text-white/40 truncate mt-0.5">{item.artist}</p>
      </div>
      {idx === currentIndex && (
        <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider shrink-0">
          Now
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
        className="p-2 -mr-1 text-white/30 hover:text-red-400 active:scale-90 transition-all"
      >
        <Trash2 size={15} />
      </button>
    </div>
  ))}
</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center pb-2 pt-1 shrink-0">
          <div className="w-28 h-[3px] bg-white/20 rounded-full" />
        </div>
      </div>

      {/* ── AirPlay Drawer ── */}
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
                <button onClick={() => setShowAirPlay(false)}
                  className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">Done</button>
              </div>
              <div className="space-y-2.5 mb-6">
                {[
                  { id: 'device',   name: 'My Device',            desc: 'Internal Speaker', icon: <Laptop  size={17} /> },
                  { id: 'homepod',  name: 'Living Room HomePod',  desc: 'AirPlay',          icon: <Music2  size={17} /> },
                  { id: 'tv',       name: 'Kitchen Smart TV',     desc: 'Cast',             icon: <Cast    size={17} /> },
                  { id: 'airpods',  name: 'AirPods Max',          desc: 'Bluetooth',        icon: <Radio   size={17} /> },
                ].map((device) => {
                  const isActive = activeRouting === device.name;
                  return (
                    <div key={device.id} onClick={() => setActiveRouting(device.name)}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                        isActive ? 'bg-white/12 border border-white/15' : 'bg-white/5 border border-transparent hover:bg-white/8'}`}>
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

              {/* Volume in AirPlay drawer — same fixes applied */}
              <div className="flex items-center gap-3 px-1">
                <button
                  onClick={() => {
                    if (volumePercent > 0) { setPrevVolume(volumePercent); handleVolumeChange(0); }
                    else handleVolumeChange(prevVolume || 70);
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <VolumeIcon size={16} />
                </button>
                <input type="range" min="0" max="100"
                  value={volumePercent}                                      // ← fixed
                  onChange={(e) => handleVolumeChange(Number(e.target.value))} // ← fixed
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-[5px]"
                  style={{ background: sliderBg }}                          // ← fixed
                />
                <button onClick={() => handleVolumeChange(100)}             // ← fixed
                  className="text-white/40 hover:text-white transition-colors">
                  <Volume2 size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}