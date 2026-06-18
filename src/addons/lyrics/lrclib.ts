export interface LyricLine {
    time: number;
    text: string;
  }
  
  export async function getLyrics(
    title: string,
    artist: string,
    duration?: number
  ): Promise<LyricLine[]> {
    try {
      const query = new URLSearchParams({
        track_name: title,
        artist_name: artist,
        ...(duration ? { duration: String(Math.round(duration)) } : {}),
      });
  
      const res = await fetch(
        `https://lrclib.net/api/get?${query.toString()}`
      );
  
      if (!res.ok) return [];
  
      const data = await res.json();
  
      if (!data.syncedLyrics) return parsePlainLyrics(data.plainLyrics);
  
      return parseLRC(data.syncedLyrics);
    } catch {
      return [];
    }
  }
  
  function parseLRC(lrc: string): LyricLine[] {
    const lines: LyricLine[] = [];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
    let match;
  
    while ((match = regex.exec(lrc)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();
      if (text) lines.push({ time, text });
    }
  
    return lines;
  }
  
  function parsePlainLyrics(plain: string | null): LyricLine[] {
    if (!plain) return [];
    return plain
      .split('\n')
      .filter(line => line.trim())
      .map((text, i) => ({ time: i * 5, text: text.trim() }));
  }