export type Tab = 'home' | 'search' | 'library' | 'addons' | 'settings';

export interface Track {
  id: string;
  title: string;
  artist: string;
  source: string;
  coverUrl: string;
  duration?: string;
  isLiked?: boolean;
  streamUrl?: string;  // ← add this line
}

export interface LibraryItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'playlist' | 'album' | 'artist';
  imageUrl?: string;
  isLiked?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  icon: string;
  isInstalled: boolean;
  color?: string;
  type: 'source' | 'theme' | 'visualizer' | 'tool';
  manifestUrl?: string;
  manifestData?: any;
  isEnabled?: boolean;
}
