import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../Store/playerStore';
import { AudiusAddon } from '../addons/audius';
import { RadioAddon } from '../addons/radio';
import { InternetArchiveAddon } from '../addons/internetarchive';
import { YouTubeAddon } from '../addons/youtube';
import { ItunesAddon } from '../addons/itunes';
import { JioSaavnAddon } from '../addons/Jiosaavn';

export function usePlayer() {
  const howlRef = useRef<Howl | null>(null);
  const rafRef  = useRef<number | null>(null);
  const resolvingRef = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    queue,
    currentIndex,
    setCurrentTime,
    setDuration,
    setPlaying,
    next,
    updateStreamUrl,
  } = usePlayerStore();

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startLoop = useCallback((howl: Howl) => {
    stopLoop();
    const tick = () => {
      setCurrentTime(howl.seek() as number);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop, setCurrentTime]);

  // ── Effect 1: Resolve stream URL when a track without one becomes current ──
  useEffect(() => {
    if (!currentTrack) return;

    // JioSaavn tokens expire quickly — always re-resolve, never use cached URL
    const needsResolve = !currentTrack.streamUrl ||
      currentTrack.source === 'JioSaavn';

    if (!needsResolve) return;
    if (resolvingRef.current === currentTrack.id) return;

    // Clear any stale JioSaavn URL so Effect 2 doesn't fire with expired URL
    if (currentTrack.source === 'JioSaavn' && currentTrack.streamUrl) {
      updateStreamUrl(currentTrack.id, '');
      return; // updateStreamUrl will trigger re-render, Effect 1 will fire again
    }

    resolvingRef.current = currentTrack.id;

    async function resolve() {
      try {
        let url: string;

        switch (currentTrack!.source) {
          case 'Audius':
            url = await AudiusAddon.getStreamUrl(currentTrack!.id);
            break;
          case 'Radio Browser':
            url = await RadioAddon.getStreamUrl(currentTrack!.id);
            break;
          case 'Internet Archive':
            url = await InternetArchiveAddon.getStreamUrl(currentTrack!.id);
            break;
          case 'YouTube':
            url = await YouTubeAddon.getStreamUrl(currentTrack!.id);
            break;
          case 'iTunes':
            url = await ItunesAddon.getStreamUrl(currentTrack!.id);
            break;
          case 'JioSaavn':
            url = await JioSaavnAddon.getStreamUrl(currentTrack!.id);
            break;
          default:
            console.warn('[Aether] No addon found for source:', currentTrack!.source);
            return;
        }

        updateStreamUrl(currentTrack!.id, url);
      } catch (err) {
        console.error('[Aether] Failed to resolve stream URL:', err);
        setPlaying(false);
      } finally {
        resolvingRef.current = null;
      }
    }

    resolve();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, currentTrack?.streamUrl]);

  const preResolvingRef = useRef<Set<string>>(new Set());
  const preloadHowlRef = useRef<Howl | null>(null);

  // ── Effect 3: Pre-resolve next 2 tracks silently in background ────────────
  useEffect(() => {
    if (!queue.length || currentIndex < 0) return;

    [1, 2].forEach((offset) => {
      const nextTrack = queue[(currentIndex + offset) % queue.length];

      if (!nextTrack) return;
      if (nextTrack.streamUrl) return;
      if (nextTrack.source === 'JioSaavn') return; // Never pre-resolve JioSaavn
      if (preResolvingRef.current.has(nextTrack.id)) return;

      preResolvingRef.current.add(nextTrack.id);

      async function preResolve() {
        try {
          let url: string;
          switch (nextTrack.source) {
            case 'Audius':
              url = await AudiusAddon.getStreamUrl(nextTrack.id);
              break;
            case 'Radio Browser':
              url = await RadioAddon.getStreamUrl(nextTrack.id);
              break;
            case 'Internet Archive':
              url = await InternetArchiveAddon.getStreamUrl(nextTrack.id);
              break;
            case 'YouTube':
              url = await YouTubeAddon.getStreamUrl(nextTrack.id);
              break;
            case 'iTunes':
              url = await ItunesAddon.getStreamUrl(nextTrack.id);
              break;
            default:
              return;
          }
          updateStreamUrl(nextTrack.id, url);

          if (offset === 1) {
            const resolvedTrack = usePlayerStore.getState().queue[
              (currentIndex + 1) % queue.length
            ];
            if (!resolvedTrack?.streamUrl) return;
            if (preloadHowlRef.current) preloadHowlRef.current.unload();
            preloadHowlRef.current = new Howl({
              src: [resolvedTrack.streamUrl],
              html5: true,
              volume: 0,
              format: ['mp4', 'aac', 'mp3', 'ogg', 'opus'],
              preload: true,
            });
          }
        } catch (err) {
          console.warn('[Aether] Pre-resolve failed for', nextTrack.id, err);
        } finally {
          preResolvingRef.current.delete(nextTrack.id);
        }
      }

      preResolve();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // ── Effect 2: Load Howler once streamUrl is available ─────────────────────
  useEffect(() => {
    if (!currentTrack?.streamUrl) return;

    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
    stopLoop();

    const howl = new Howl({
      src:    [currentTrack.streamUrl],
      html5:  true,
      volume: isMuted ? 0 : volume,
      format: ['mp4', 'aac', 'mp3', 'ogg', 'opus'],

      onload: () => {
        setDuration(howl.duration());
      },

      onplay: () => {
        startLoop(howl);
        setPlaying(true);
      },

      onpause: () => {
        stopLoop();
        setPlaying(false);
      },

      onstop: () => {
        stopLoop();
        setCurrentTime(0);
      },

      onend: () => {
        stopLoop();
        next();
      },

      onloaderror: (_id, err) => {
        console.error('[Aether] Load error:', err);
        setPlaying(false);
      },

      onplayerror: (_id, _err) => {
        howl.once('unlock', () => howl.play());
      },
    });

    howlRef.current = howl;
    if (isPlaying) howl.play();

    return () => {
      howl.unload();
      stopLoop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.streamUrl]);

  // ── Sync play/pause ────────────────────────────────────────────────────────
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (isPlaying && !howl.playing()) howl.play();
    else if (!isPlaying && howl.playing()) howl.pause();
  }, [isPlaying]);

  // ── Sync volume ────────────────────────────────────────────────────────────
  useEffect(() => {
    howlRef.current?.volume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  return { seek };
}