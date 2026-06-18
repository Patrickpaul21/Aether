import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../Store/playerStore';
import { AudiusAddon } from '../addons/audius';
import { RadioAddon } from '../addons/radio'; 
import { InternetArchiveAddon } from '../addons/internetarchive';
import { YouTubeAddon } from '../addons/youtube';
import { ItunesAddon } from '../addons/itunes';

/**
 * usePlayer — audio engine.
 * Mount ONCE at the app root (App.tsx).
 *
 * Two-effect architecture:
 *   Effect 1 — watches currentTrack.id
 *              If the track has no streamUrl, resolves it via the correct addon
 *              then writes it back to the store via updateStreamUrl.
 *
 *   Effect 2 — watches currentTrack.streamUrl
 *              Once the URL exists, tears down the old Howl and creates a new one.
 *
 * This means skip/next/prev all work correctly — the URL gets resolved
 * automatically for any track in the queue, not just the one initially tapped.
 */
export function usePlayer() {
  const howlRef = useRef<Howl | null>(null);
  const rafRef  = useRef<number | null>(null);
  const resolvingRef = useRef<string | null>(null); // track ID currently being resolved

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
    if (currentTrack.streamUrl) return;          // already resolved
    if (resolvingRef.current === currentTrack.id) return; // already resolving

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
          default:
            console.warn('[Aether] No addon found for source:', currentTrack!.source);
            return;
        }

        // Write the resolved URL back to the store.
        // This triggers Effect 2 which loads Howler.
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
  }, [currentTrack?.id]);

  const preResolvingRef = useRef<Set<string>>(new Set());
  const preloadHowlRef = useRef<Howl | null>(null);

  // ── Effect 3: Pre-resolve next 2 tracks silently in background ────────────
  useEffect(() => {
    if (!queue.length || currentIndex < 0) return;

    [1, 2].forEach((offset) => {
      const nextTrack = queue[(currentIndex + offset) % queue.length];

      if (!nextTrack) return;
      if (nextTrack.streamUrl) return;
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
              format: ['mp3', 'ogg', 'aac', 'opus'],
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
      format: ['mp3', 'ogg', 'aac', 'opus'],

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
        // Browser autoplay policy — unlock and retry
        howl.once('unlock', () => howl.play());
      },
    });

    howlRef.current = howl;
    if (isPlaying) howl.play();

    return () => {
      howl.unload();
      stopLoop();
    };
  // KEY: watch streamUrl, not track.id — fires once URL is resolved
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