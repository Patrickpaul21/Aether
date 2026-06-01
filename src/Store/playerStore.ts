import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '../types';

interface PlayerState {
  currentTrack:  Track | null;
  isPlaying:     boolean;
  currentTime:   number;
  duration:      number;
  volume:        number;
  isMuted:       boolean;
  queue:         Track[];
  currentIndex:  number;
  history:       Track[];

  setTrack:          (track: Track, queue?: Track[]) => void;
  updateStreamUrl:   (trackId: string, url: string) => void;   // ← new
  setPlaying:        (playing: boolean) => void;
  togglePlay:        () => void;
  setCurrentTime:    (time: number) => void;
  setDuration:       (duration: number) => void;
  setVolume:         (volume: number) => void;
  toggleMute:        () => void;
  next:              () => void;
  prev:              () => void;
  addToQueue:        (track: Track) => void;
  removeFromQueue:   (trackId: string) => void;
  clearQueue:        () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack:  null,
      isPlaying:     false,
      currentTime:   0,
      duration:      0,
      volume:        0.7,
      isMuted:       false,
      queue:         [],
      currentIndex:  -1,
      history:       [],

      setTrack: (track, queue) =>
        set((state) => {
          const newQueue   = queue ?? (state.queue.length ? state.queue : [track]);
          const newIndex   = newQueue.findIndex((t) => t.id === track.id);
          const prevTrack = state.currentTrack;
          const cleanPrev = prevTrack ? { ...prevTrack, streamUrl: undefined } : null;
          const newHistory = cleanPrev
            ? [cleanPrev, ...state.history.filter((t) => t.id !== cleanPrev.id)].slice(0, 30)
            : state.history;

          return {
            currentTrack: track,
            queue: newQueue,
            currentIndex: newIndex >= 0 ? newIndex : 0,
            currentTime: 0,
            isPlaying: true,
            history: newHistory,
          };
        }),

      // Writes the resolved stream URL into both currentTrack and the queue entry.
      // Triggered by usePlayer after it resolves the URL for a skipped track.
      updateStreamUrl: (trackId, url) =>
        set((state) => ({
          currentTrack: state.currentTrack?.id === trackId
            ? { ...state.currentTrack, streamUrl: url }
            : state.currentTrack,
          queue: state.queue.map((t) =>
            t.id === trackId ? { ...t, streamUrl: url } : t
          ),
        })),

      setPlaying:     (playing) => set({ isPlaying: playing }),
      togglePlay:     ()        => set((s) => ({ isPlaying: !s.isPlaying })),
      setCurrentTime: (time)    => set({ currentTime: time }),
      setDuration:    (dur)     => set({ duration: dur }),
      setVolume:      (vol)     => set({ volume: vol, isMuted: vol === 0 }),

      toggleMute: () =>
        set((s) => ({
          isMuted: !s.isMuted,
          volume:  s.isMuted ? (s.volume === 0 ? 0.5 : s.volume) : 0,
        })),

      next: () => {
        const { queue, currentIndex } = get();
        if (!queue.length) return;
        const nextIndex = (currentIndex + 1) % queue.length;
        set({
          currentTrack: queue[nextIndex],
          currentIndex: nextIndex,
          currentTime:  0,
          isPlaying:    true,
        });
      },

      prev: () => {
        const { queue, currentIndex, currentTime } = get();
        if (!queue.length) return;
        if (currentTime > 3) { set({ currentTime: 0 }); return; }
        const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
        set({
          currentTrack: queue[prevIndex],
          currentIndex: prevIndex,
          currentTime:  0,
          isPlaying:    true,
        });
      },

      addToQueue: (track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      removeFromQueue: (trackId) =>
        set((s) => {
          const newQueue = s.queue.filter((t) => t.id !== trackId);
          const newIndex = s.currentTrack
            ? newQueue.findIndex((t) => t.id === s.currentTrack!.id)
            : -1;
          return { queue: newQueue, currentIndex: newIndex };
        }),

      clearQueue: () => set({ queue: [], currentIndex: -1 }),
    }),
    {
      name: 'aether-player',
      partialize: (s) => ({ volume: s.volume, history: s.history }),
    }
  )
);