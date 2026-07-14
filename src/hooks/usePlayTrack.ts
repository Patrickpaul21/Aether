/**
 * usePlayTrack
 *
 * Glue between the UI and the audio engine.
 * Resolves the stream URL via the correct addon before handing off to the store.
 *
 * Usage (in any screen):
 *   const { playTrack, isLoading, error } = usePlayTrack();
 *   <button onClick={() => playTrack(track)}>Play</button>
 */

import { useState, useCallback } from 'react';
import { Track } from '../types';
import { usePlayerStore } from '../Store/playerStore';
import { SoundCloudAddon } from '../addons/soundcloud';
import { AudiusAddon } from '../addons/audius';
import { RadioAddon } from '../addons/radio';
import { InternetArchiveAddon } from '../addons/internetarchive';
import { YouTubeAddon } from '../addons/youtube';
import { ItunesAddon } from '../addons/itunes/index';
import { JioSaavnAddon } from '../addons/Jiosaavn/index.ts';

export function usePlayTrack() {
  const { setTrack } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playTrack = useCallback(async (track: Track, queue?: Track[]) => {
    setError(null);

    // If the track already has a streamUrl (e.g. test track), play immediately
    if (track.streamUrl) {
      setTrack(track, queue);
      return;
    }

    setIsLoading(true);
    try {
      let streamUrl: string;

      // Route to the correct addon based on track.source
      
      switch (track.source) {
        case 'Audius':
          streamUrl = await AudiusAddon.getStreamUrl(track.id);
          break;
          case 'SoundCloud':
            streamUrl = await SoundCloudAddon.getStreamUrl(track.id);
            break;
          case 'Internet Archive':
            streamUrl = await InternetArchiveAddon.getStreamUrl(track.id);
            break;
        case 'Radio Browser':
          streamUrl = await RadioAddon.getStreamUrl(track.id);
          break;

          case 'iTunes':
          streamUrl = track.streamUrl || await ItunesAddon.getStreamUrl(track.id);
          break;
        case 'YouTube':
          streamUrl = await YouTubeAddon.getStreamUrl(track.id);
          break;
          case 'JioSaavn':
            streamUrl = await JioSaavnAddon.getStreamUrl(track.id);
            break;  
        default:
          throw new Error(`No addon found for source: ${track.source}`);
      }

      setTrack({ ...track, streamUrl }, queue);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load track';
      setError(message);
      console.error('[Aether] playTrack error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setTrack]);

  return { playTrack, isLoading, error };
}