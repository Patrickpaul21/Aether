const CLIENT_ID = (import.meta as any).env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = (import.meta as any).env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
].join(' ');

// ── PKCE Helpers ──────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(x => chars[x % chars.length]).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
    if (crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    // Fallback for non-secure contexts
    return verifier;
  }

// ── Auth ──────────────────────────────────────────────────────────────────

export async function getSpotifyAuthUrl(): Promise<string> {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem('spotify_code_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<void> {
  const verifier = localStorage.getItem('spotify_code_verifier');
  if (!verifier) throw new Error('No code verifier found');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) throw new Error('Token exchange failed');

  const data = await res.json();
  saveToken(data.access_token, data.expires_in);
  localStorage.removeItem('spotify_code_verifier');
}

export function saveToken(token: string, expiresIn: number = 3600): void {
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem('spotify_token', token);
  localStorage.setItem('spotify_expires_at', String(expiresAt));
}

export function getToken(): string | null {
  const token = localStorage.getItem('spotify_token');
  const expiresAt = Number(localStorage.getItem('spotify_expires_at'));
  if (!token || Date.now() > expiresAt) {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_expires_at');
    return null;
  }
  return token;
}

export function clearToken(): void {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_expires_at');
  localStorage.removeItem('spotify_code_verifier');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── API ───────────────────────────────────────────────────────────────────

async function spotifyFetch(endpoint: string): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

// ── Playlists ─────────────────────────────────────────────────────────────

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  spotifyId: string;
}

export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const data = await spotifyFetch('/me/playlists?limit=50');
  return data.items.filter((p: any) => p !== null);
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch(
    `/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,artists,album,duration_ms))`
  );

  return data.items
    .filter((item: any) => item.track && item.track.id)
    .map((item: any) => {
      const track = item.track;
      const minutes = Math.floor(track.duration_ms / 60000);
      const seconds = Math.floor((track.duration_ms % 60000) / 1000);
      return {
        id: `spotify-${track.id}`,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        coverUrl: track.album.images?.[0]?.url || '',
        duration: `${minutes}:${String(seconds).padStart(2, '0')}`,
        spotifyId: track.id,
        source: 'Spotify',
      };
    });
}