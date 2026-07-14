import {
  Search as SearchIcon, History, X, ChevronRight, ArrowLeft,
  Play, Music, Radio, Clock, Headphones, Sparkles, Disc,
  MessageSquareText, Layers, Mic2, Loader2,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';
import { RECENT_SEARCHES } from '../constants';
import { AudiusAddon } from '../addons/audius/index';
import { RadioAddon }  from '../addons/radio';
import { YouTubeAddon } from '../addons/youtube';
import { useAddonStore } from '../Store/addonStore';
import { usePlayTrack } from '../hooks/usePlayTrack';
import { InternetArchiveAddon } from '../addons/internetarchive';
import { ItunesAddon } from '../addons/itunes/index';
import { JioSaavnAddon } from '../addons/Jiosaavn/index.ts';


// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TRACK_DATABASE: Track[] = [
  { id: 'mt1', title: 'Eclipse Protocol',         artist: 'Sable Meridian',        source: 'Navidrome',     coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA0UY5fbImRPCBZLKmL0lRakdTdx4v6S1iZCLh4v1DBWpYrJhGaI_VRonZ4BK9-dMZS04vplVle7HFHq8pZ9UYRvGGeFmbOxkSBDtB4kgXQMKIq2WuJc__GY5MCh5vWyXbfR3ydtwi3bbV_RRVoCzQSWnyIDwgO-R6eCOpJ7vVB7N2zIjUDbtU8Y_phO5TZNPSXMRP0g7Ndosg0JweiLPeBpTBySmB93iJAL85bKreMur_-aayyGJN-omgUG5Gd8LHVMqvJtBdDJg', duration: '5:47', isLiked: true },
  { id: 'mt2', title: 'Midnight Loops',            artist: 'Hotel Pools',           source: 'Navidrome',     coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPkUw1oiRwmVDSu0pacXlYSX7oWsDs5qZR3D56i0vUajj7UquKLd1ygsD_5awKGWAHCh90R07m00n4O3h_ZhSodPZJj89ZSTY7bV69qAPXM65RFBR9jWE8_96Cg2dvgNkyev7LarJ-644ypulT8Q53dZZaKdBOZKhmlzCiaf66ivSEOB-W-KREP6LGhCnR-qMA9aL0lDNCJ_Y3uwTE7EIe16s2Tzs7Uylz3oK1Bc3xMsP0BT4nF1jAy4L1c76IRSJTV5yNFxtNnrE', duration: '3:12' },
  { id: 'mt3', title: 'Fragments',                 artist: 'Kiasmos',               source: 'Navidrome',     coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0DXWyUVRsl5AKr-RllJwjTyMU6bPhXvQMD8MnB49VOgldYItLpBpryeMnqwYOi6G29X4OGwwY0SvzvAdN9VgFpbHpOKJXANumBZM8axGAEGn9DbGc6Q1PPAE1dNKk4tnkUsxoWfGWT-Vd0zjQAZhAfaxQuy4NOQ8-HFj-zDyIHTcFAUlBLNLE7OnrhJ1GEZ3mAqaPhIRNKct9kAemuSibuJJCsILCE11Do2ErU0qKz0Puba5cUxA4tnSsnC2bmnVaYdnMFrsXw4', duration: '4:25', isLiked: true },
  { id: 'mt4', title: 'Overfire',                  artist: 'Tycho',                 source: 'Navidrome',     coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB56_-R-i7Xog3FUWpXGbKNYiEXANnuw7E0ibiKRea3cACfa49opRk8FuzK-8blV-UgH-zdaGjq6clxyORH3159U6QmIc8ShWd---BD1kG3A_FjTjgP-_KsjJzW4SPwhJqhI8vhjCieeZh4y67_tIf6QhWRgCbcdPwTG2g-yDE5NRVFA7aqW67AwJWGeyJlNpBMNYTEPotBeBkg3yyU-m3m7HViNhDxyHcXLkINkSPaWVxZkUaEEn-vScmO7bB95ujKv5hiXBpLBWg', duration: '4:01' },
  { id: 'mt5', title: 'Says',                      artist: 'Nils Frahm',            source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '8:18', isLiked: true },
  { id: 'mt6', title: 'First Breath After Coma',   artist: 'Explosions in the Sky', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAplY2ydXOxqSkMOsVGexn_XtYeb5uGxVPkmV6cjDDDKTNnm4zgYYHZPx5D_cvUz9jwni3qwboJoXPJ6IzcNWlaQyhv8730p3pc45BWPP6qY1z5g__yMa_G9yrkC5TQLTluUHXDZq88ceEXNUBV-O6QHTUaKqlr4DotnlQPspPDCdAyHJbMeP2edJQVka4b2ndxx8n9Hnp2pVZi7QE-UGD4Di5zKnJ1itl0vDLScVvK4uhOg91wyXJHpqhxI3vO8Qgo3MBPt-GmrTs', duration: '9:33' },
  { id: 'mt7', title: 'The Summoning',             artist: 'Sleep Token',           source: 'Jellyfin',      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZLX1nkI3yP4tI3mCKilFSRMJhLgDHB3Z550VDWvQ6RG-a8L0btW07QmwM4coNKGS8XaP6Tqs1YraB5sU117reRPpMXpAS9KfznK-07NblMsWTfTeije22FugrR1_JMr6SofEr_BtG-KCF1XZY_9xHqe9I5WiV9iZyPfz513hJ-ZIMJoFb7bsQ1EsezNqLxP54jyLj_YCMUCbo3cI_DyAcfRSRpEPrSPmwWhYvLo9LzYbq54k-kXYJrBCKuq761aloAM8N4tkFsMc', duration: '6:35', isLiked: true },
  { id: 'mt8', title: 'Awake',                     artist: 'Tycho',                 source: 'Radio Browser', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPkUw1oiRwmVDSu0pacXlYSX7oWsDs5qZR3D56i0vUajj7UquKLd1ygsD_5awKGWAHCh90R07m00n4O3h_ZhSodPZJj89ZSTY7bV69qAPXM65RFBR9jWE8_96Cg2dvgNkyev7LarJ-644ypulT8Q53dZZaKdBOZKhmlzCiaf66ivSEOB-W-KREP6LGhCnR-qMA9aL0lDNCJ_Y3uwTE7EIe16s2Tzs7Uylz3oK1Bc3xMsP0BT4nF1jAy4L1c76IRSJTV5yNFxtNnrE', duration: '4:43' },
  { id: 'mt9', title: 'Oskar',                     artist: 'Kiasmos',               source: 'SoundCloud',    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0DXWyUVRsl5AKr-RllJwjTyMU6bPhXvQMD8MnB49VOgldYItLpBpryeMnqwYOi6G29X4OGwwY0SvzvAdN9VgFpbHpOKJXANumBZM8axGAEGn9DbGc6Q1PPAE1dNKk4tnkUsxoWfGWT-Vd0zjQAZhAfaxQuy4NOQ8-HFj-zDyIHTcFAUlBLNLE7OnrhJ1GEZ3mAqaPhIRNKct9kAemuSibuJJCsILCE11Do2ErU0qKz0Puba5cUxA4tnSsnC2bmnVaYdnMFrsXw4', duration: '5:12' },
];

interface CustomPlaylist {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  tracks: Track[];
}

const MOCK_PLAYLIST_DATABASE: CustomPlaylist[] = [
  { id: 'p1', title: 'Ambient Horizon',        subtitle: 'Curated deep background loops & atmospheres',              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4rOIauSFM3fAXooSlcH4YhFAQPuNwTjIjpEdOG_C4ZGbG3NHg0kDoYCcDUi15B2q5xTkUrpBl75m6sackiuopLhphIInEScBjmiKSgtddvps7zLT8Et2PAho4gzNYE4w5cOi1eVxGp5bsTQHaVyjfItROQOhZsjKA2tFov5Spe7B7EeBSBJ4J9UiXiVcg8HQR20bdqnDk7hUuZu17IsxVKJET-aFJDX0NYbVmcV_yBlYemHSPKnIvulqd9FN16J9d0T8VApjS5_A', category: 'playlists', tracks: [MOCK_TRACK_DATABASE[0], MOCK_TRACK_DATABASE[2], MOCK_TRACK_DATABASE[4]] },
  { id: 'p2', title: 'Focus Flow Essentials',  subtitle: 'Stay locked in with binaural synths and minimal percussion', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADdaHni_zTb52vNPatxaw5Y-R9thih4lbhSvxAC6Ya5zgHaOmz0vlNuiN9eyeW9Gi3yXpG23fOhtZvsVBEI3dRXUWmObia-UDc8tnJPoRjRSMu-E9tAWjQM04Ot4ZsBO2SkSBacRSLXAUznfrHfweAmcC98qlHfE45gm76z4fBkpoRm-Wld_DCJtEWh01LXQocIIQ053lyD1yIx5shd7_UrAitX_zFBlVO6YS6d-bpN9Kezri8mtfPQ2uxghcjk5iD2_ZErlVP3o8', category: 'playlists', tracks: [MOCK_TRACK_DATABASE[1], MOCK_TRACK_DATABASE[3], MOCK_TRACK_DATABASE[7]] },
  { id: 'p3', title: 'Post-Rock Nocturnes',    subtitle: 'Cinematic guitar peaks and slow build releases',            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAplY2ydXOxqSkMOsVGexn_XtYeb5uGxVPkmV6cjDDDKTNnm4zgYYHZPx5D_cvUz9jwni3qwboJoXPJ6IzcNWlaQyhv8730p3pc45BWPP6qY1z5g__yMa_G9yrkC5TQLTluUHXDZq88ceEXNUBV-O6QHTUaKqlr4DotnlQPspPDCdAyHJbMeP2edJQVka4b2ndxx8n9Hnp2pVZi7QE-UGD4Di5zKnJ1itl0vDLScVvK4uhOg91wyXJHpqhxI3vO4Qgo3MBPt-GmrTs', category: 'albums',   tracks: [MOCK_TRACK_DATABASE[5], MOCK_TRACK_DATABASE[6], MOCK_TRACK_DATABASE[2]] },
  { id: 'p4', title: 'This Is Tycho & Friends', subtitle: 'Sun-drenched ambient loops and warm soundscapes',          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB56_-R-i7Xog3FUWpXGbKNYiEXANnuw7E0ibiKRea3cACfa49opRk8FuzK-8blV-UgH-zdaGjq6clxyORH3159U6QmIc8ShWd---BD1kG3A_FjTjgP-_KsjJzW4SPwhJqhI8vhjCieeZh4y67_tIf6QhWRgCbcdPwTG2g-yDE5NRVFA7aqW67AwJWGeyJlNpBMNYTEPotBeBkg3yyU-m3m7HViNhDxyHcXLkINkSPaWVxZkUaEEn-vScmO7bB95ujKv5hiXBpLBWg', category: 'artists',   tracks: [MOCK_TRACK_DATABASE[3], MOCK_TRACK_DATABASE[7], MOCK_TRACK_DATABASE[1]] },
  { id: 'p5', title: 'Synthwave Syndicate',    subtitle: 'Retro neon basslines for code marathons',                  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnTj0MjY4b0kMQZPz95vvGM3FDNWx5TUnoDiapwXAOK8FbG9T7TviegYIj96mFOt8lQTPqx_as9B5EVHoJIquYIvd6FYH0OqK-WoRrslt52klfCbAAwKLDfoGmbi_JYDOPWVj0HMcv3_mzMpmjEAOmnqBQPduAdbHmeDH22GWt6HKmDLHL_SJrurqzoGKppSg722x0415uQnfTgYnX6k5o1mjaWhnIxWlLdL26AHKPb356kaaRajFQNGXL-LklQizFIqHuKDwnPZ0', category: 'radio',     tracks: [MOCK_TRACK_DATABASE[0], MOCK_TRACK_DATABASE[1], MOCK_TRACK_DATABASE[3], MOCK_TRACK_DATABASE[7]] },
  { id: 'p6', title: 'Daily Tech Roundup',     subtitle: 'The best engineering podcast curations of the week',       imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA0UY5fbImRPCBZLKmL0lRakdTdx4v6S1iZCLh4v1DBWpYrJhGaI_VRonZ4BK9-dMZS04vplVle7HFHq8pZ9UYRvGGeFmbOxkSBDtB4kgXQMKIq2WuJc__GY5MCh5vWyXbfR3ydtwi3bbV_RRVoCzQSWnyIDwgO-R6eCOpJ7vVB7N2zIjUDbtU8Y_phO5TZNPSXMRP0g7Ndosg0JweiLPeBpTBySmB93iJAL85bKreMur_-aayyGJN-omgUG5Gd8LHVMqvJtBdDJg', category: 'podcasts',  tracks: [{ id: 'pod1', title: 'Episode 546: LLM Scaling Frontiers', artist: 'Tech Radio Network', source: 'Podcast', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA0UY5fbImRPCBZLKmL0lRakdTdx4v6S1iZCLh4v1DBWpYrJhGaI_VRonZ4BK9-dMZS04vplVle7HFHq8pZ9UYRvGGeFmbOxkSBDtB4kgXQMKIq2WuJc__GY5MCh5vWyXbfR3ydtwi3bbV_RRVoCzQSWnyIDwgO-R6eCOpJ7vVB7N2zIjUDbtU8Y_phO5TZNPSXMRP0g7Ndosg0JweiLPeBpTBySmB93iJAL85bKreMur_-aayyGJN-omgUG5Gd8LHVMqvJtBdDJg', duration: '41:20' }, { id: 'pod2', title: 'Episode 102: Deep Work Cycles', artist: 'Mindfulness Podcast', source: 'Podcast', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADdaHni_zTb52vNPatxaw5Y-R9thih4lbhSvxAC6Ya5zgHaOmz0vlNuiN9eyeW9Gi3yXpG23fOhtZvsVBEI3dRXUWmObia-UDc8tnJPoRjRSMu-E9tAWjQM04Ot4ZsBO2SkSBacRSLXAUznfrHfweAmcC98qlHfE45gm76z4fBkpoRm-Wld_DCJtEWh01LXQocIIQ053lyD1yIx5shd7_UrAitX_zFBlVO6YS6d-bpN9Kezri8mtfPQ2uxghcjk5iD2_ZErlVP3o8', duration: '28:45' }] },
];

const BROWSE_CATEGORIES = [
  { id: 'tracks',    label: 'Tracks',    icon: Music,      hint: 'All sources'  },
  { id: 'artists',   label: 'Artists',   icon: Mic2,       hint: null           },
  { id: 'albums',    label: 'Albums',    icon: Disc,       hint: null           },
  { id: 'playlists', label: 'Playlists', icon: Layers,     hint: null           },
  { id: 'podcasts',  label: 'Podcasts',  icon: Headphones, hint: null           },
  { id: 'radio',     label: 'Radio',     icon: Radio,      hint: 'Live streams' },
];

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=480&q=80';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchScreenProps {
  onPlayTrack?: (track: Track) => void;
}

type SourceFilter = 'all' | 'audius' | 'radio' | 'internetarchive' | 'itunes' | 'jiosaavn';
type TypeFilter   = 'all' | 'tracks' | 'live';

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchScreen({ onPlayTrack }: SearchScreenProps) {
  // ── Search state
  const [searchQuery,   setSearchQuery]   = useState('');
  const [results,       setResults]       = useState<Track[]>([]);
  const [isSearching,   setIsSearching]   = useState(false);
  const [searchError,   setSearchError]   = useState<string | null>(null);

  // ── Filter state
  const [sourceFilter,  setSourceFilter]  = useState<SourceFilter>('all');
  const [typeFilter,    setTypeFilter]    = useState<TypeFilter>('all');

  // ── Navigation state
  const [activeCategory,   setActiveCategory]   = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<CustomPlaylist | null>(null);

  // ── Radio tab state
  const [radioStations, setRadioStations] = useState<Track[]>([]);
  const [radioLoading,  setRadioLoading]  = useState(false);
  const [radioQuery,    setRadioQuery]    = useState('');
  const radioDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isEnabled } = useAddonStore();
  const { playTrack, isLoading: isPlayLoading, error } = usePlayTrack();

  // ── Filtered results (applies source + type chips)
  const filteredTracks = (searchQuery.trim() ? results : MOCK_TRACK_DATABASE).filter((t) => {
    if (sourceFilter === 'audius' && t.source !== 'Audius') return false;
    if (sourceFilter === 'radio'  && t.source !== 'Radio Browser') return false;
    if (sourceFilter === 'internetarchive' && t.source !== 'Internet Archive') return false;
    if (typeFilter   === 'live'   && t.duration !== 'LIVE') return false;
    if (typeFilter   === 'tracks' && t.duration === 'LIVE') return false;
    if (sourceFilter === 'itunes' && t.source !== 'iTunes') return false;
    if (sourceFilter === 'jiosaavn' && t.source !== 'JioSaavn') return false;
    return true;
  });

  // ── Main search effect (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setResults([]); setSearchError(null); return; }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const all: Track[] = [];
        if (isEnabled('aether.audius')) all.push(...await AudiusAddon.search(searchQuery));
        if (isEnabled('aether.radio'))  all.push(...await RadioAddon.search(searchQuery));
        if (isEnabled('aether.archive')) all.push(...await InternetArchiveAddon.search(searchQuery));
        if (isEnabled('aether.youtube')) all.push(...await YouTubeAddon.search(searchQuery));
        if (isEnabled('aether.itunes')) all.push(...await ItunesAddon.search(searchQuery));
        if (isEnabled('aether.jiosaavn')) all.push(...await JioSaavnAddon.search(searchQuery));
        if (!all.length) setSearchError('No sources connected. Go to Add-ons and install a source.');
        console.log(all);
        setResults(all);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, isEnabled]);

  // ── Radio tab effect — load featured on open, debounce scoped search
  useEffect(() => {
    if (activeCategory !== 'radio' || !isEnabled('aether.radio')) return;

    if (radioDebounceRef.current) clearTimeout(radioDebounceRef.current);

    radioDebounceRef.current = setTimeout(async () => {
      setRadioLoading(true);
      try {
        const data = radioQuery.trim()
          ? await RadioAddon.search(radioQuery)
          : await RadioAddon.getFeatured();
        setRadioStations(data);
      } catch (err) {
        console.error('[Aether] Radio fetch error:', err);
      } finally {
        setRadioLoading(false);
      }
    }, radioQuery.trim() ? 400 : 0);

    return () => { if (radioDebounceRef.current) clearTimeout(radioDebounceRef.current); };
  }, [activeCategory, radioQuery, isEnabled]);

  // ── Handlers
  const handlePlayResult = (track: Track) => {
    playTrack(track, results.length ? results : undefined);
  };

  const handlePlayPlaylistTrack = (playlist: CustomPlaylist, track: Track) => {
    playTrack(track, playlist.tracks);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">

        {/* ══════════════ VIEW 1 — SEARCH HOME ══════════════════════ */}
        {!activeCategory && (
          <motion.div
            key="search-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header + search bar */}
            <header className="pt-5 px-6 pb-3 sticky top-0 bg-brand-dark/95 backdrop-blur-md z-20">
              <h1 className="text-3xl font-bold mb-4">Search</h1>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30 group-focus-within:text-white/60 transition-colors pointer-events-none">
                  <SearchIcon size={17} />
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSourceFilter('all'); setTypeFilter('all'); }}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder:text-white/25 text-white outline-none transition-all"
                  placeholder="Tracks, artists, albums, stations..."
                  type="text"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* ── Filter chips — only shown when there's a query */}
              {searchQuery.trim() && (
                <div className="mt-3 flex flex-col gap-2">
                  {/* Source row */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {(['all', 'audius', 'radio', 'internetarchive', 'itunes'] as SourceFilter[]).map((s) => (
                   <button
                   key={s}
                   onClick={() => setSourceFilter(s)}
                   className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                     sourceFilter === s
                     ? 'bg-brand-green text-black'
                         : 'bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white'
                     }`}
                      >
                    {s === 'all' ? 'All Sources' : s === 'audius' ? 'Audius' : s === 'radio' ? 'Radio' : s === 'internetarchive' ? 'Archive' : 'iTunes'}
                    </button>
                      ))}
                  </div>
                  {/* Type row */}
                  <div className="flex gap-2">
                    {(['all', 'tracks', 'live'] as TypeFilter[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                          typeFilter === t
                            ? 'bg-white/20 text-white'
                            : 'bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white'
                        }`}
                      >
                        {t === 'all' ? 'All Types' : t === 'tracks' ? 'Tracks' : 'Live'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </header>

            <main className="px-6 pb-36 overflow-y-auto no-scrollbar">
              {searchQuery ? (
                /* ── Search results ── */
                <section className="mt-4">
                  <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Results</h2>
                  {isSearching ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-white/40 text-sm">
                      <Loader2 size={18} className="animate-spin" /> Searching…
                    </div>
                  ) : searchError ? (
                    <div className="text-center py-16 px-4">
                      <p className="text-sm text-red-400/90">{searchError}</p>
                    </div>
                  ) : filteredTracks.length === 0 ? (
                    <div className="text-center py-16">
                      <Music size={36} className="mx-auto mb-3 text-white/15" />
                      <p className="text-sm text-white/30">Nothing found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredTracks.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => handlePlayResult(track)}
                          className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors group"
                        >
                          <img
                            src={track.coverUrl || FALLBACK_COVER}
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                            className="w-11 h-11 rounded-lg object-cover bg-white/10"
                            alt={track.title}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate text-white">{track.title}</h4>
                            <p className="text-xs text-white/40 truncate">{track.artist} • {track.source}</p>
                          </div>
                          <span className={`text-[11px] font-mono ${track.duration === 'LIVE' ? 'text-brand-green font-bold' : 'text-white/25'}`}>
                            {track.duration}
                          </span>
                          {isPlayLoading
                            ? <Loader2 size={14} className="animate-spin text-brand-green" />
                            : <Play size={14} className="text-white/30 group-hover:text-white transition-colors" fill="currentColor" />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                  {error && <p className="text-xs text-red-400/80 mt-3 px-1">{error}</p>}
                </section>
              ) : (
                <>
                  {/* ── Browse grid ── */}
                  <section className="mt-4">
                    <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Browse</h2>
                    <div className="grid grid-cols-2 gap-2.5">
                      {BROWSE_CATEGORIES.map((cat, i) => (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.22 }}
                        >
                          <BrowseCard
                            label={cat.label}
                            hint={cat.hint}
                            Icon={cat.icon}
                            onClick={() => setActiveCategory(cat.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* ── Recent searches ── */}
                  <section className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">Recent</h2>
                      <button className="text-white/40 text-xs font-medium hover:text-white transition-colors">Clear all</button>
                    </div>
                    <ul className="space-y-1">
                      {RECENT_SEARCHES.map(item => (
                        <li key={item} className="flex items-center justify-between group rounded-xl hover:bg-white/[0.04] transition-colors">
                          <button onClick={() => setSearchQuery(item)} className="flex items-center gap-3 text-left flex-1 py-2.5 px-2">
                            <History size={15} className="text-white/25 shrink-0" />
                            <span className="text-sm text-white/70">{item}</span>
                          </button>
                          <button className="pr-2 text-white/20 hover:text-white/60 transition-colors py-2.5 px-1">
                            <X size={15} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
            </main>
          </motion.div>
        )}

        {/* ══════════════ VIEW 2 — CATEGORY ══════════════════════════ */}
        {activeCategory && !selectedPlaylist && (
          <motion.div
            key="category-screen"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="flex flex-col h-full absolute inset-0 bg-brand-dark z-30"
          >
            <header className="pt-5 px-6 pb-4 flex items-center gap-3 border-b border-brand-border sticky top-0 bg-brand-dark/95 backdrop-blur-md z-40">
              <button
                onClick={() => { setActiveCategory(null); setRadioQuery(''); setRadioStations([]); }}
                className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold capitalize text-white">{activeCategory}</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pt-4 pb-36 no-scrollbar">

              {/* ── Radio category — fully live ── */}
              {activeCategory === 'radio' && (
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Radio size={13} /> Live streams
                  </h3>

                  {/* Scoped search */}
                  <div className="relative mb-4">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30 pointer-events-none">
                      <SearchIcon size={15} />
                    </span>
                    <input
                      value={radioQuery}
                      onChange={(e) => setRadioQuery(e.target.value)}
                      placeholder="Search stations..."
                      className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-4 text-sm placeholder:text-white/25 text-white outline-none focus:border-white/20 transition-colors"
                    />
                    {radioQuery && (
                      <button onClick={() => setRadioQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Station list */}
                  {radioLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-white/40 text-sm">
                      <Loader2 size={16} className="animate-spin" /> Loading stations…
                    </div>
                  ) : radioStations.length === 0 ? (
                    <div className="text-center py-12">
                      <Radio size={32} className="mx-auto mb-3 text-white/15" />
                      <p className="text-sm text-white/30">
                        {radioQuery ? 'No stations found' : 'Install Radio Browser in Add-ons to see stations'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {radioStations.map((station) => (
                        <div
                          key={station.id}
                          onClick={() => playTrack(station, radioStations)}
                          className="flex items-center gap-3.5 p-3 bg-white/[0.04] rounded-2xl border border-white/[0.06] cursor-pointer hover:bg-white/[0.08] transition-colors active:scale-[0.99]"
                        >
                          <img
                            src={station.coverUrl || FALLBACK_COVER}
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                            className="w-11 h-11 rounded-xl object-cover bg-white/10 shrink-0"
                            alt={station.title}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{station.title}</h4>
                            <p className="text-xs text-white/35 truncate">{station.artist}</p>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-green/10 text-brand-green font-semibold uppercase tracking-wider shrink-0">
                            Live
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── All other categories — playlists section + per-category content ── */}
              {activeCategory !== 'radio' && (
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} className="text-brand-green" />
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                        Playlists in {activeCategory}
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {MOCK_PLAYLIST_DATABASE.filter(p => p.category === activeCategory).length > 0
                        ? MOCK_PLAYLIST_DATABASE.filter(p => p.category === activeCategory).map(playlist => (
                            <div key={playlist.id}>
                              <PlaylistRow playlist={playlist} onSelect={setSelectedPlaylist} />
                            </div>
                          ))
                        : (
                          <div className="space-y-2.5">
                            <p className="text-xs text-white/25 mb-3">Featured picks for you</p>
                            {MOCK_PLAYLIST_DATABASE.slice(0, 2).map(playlist => (
                              <div key={playlist.id}>
                                <PlaylistRow playlist={playlist} onSelect={setSelectedPlaylist} />
                              </div>
                            ))}
                          </div>
                        )
                      }
                    </div>
                  </div>

                  {/* Tracks */}
                  {activeCategory === 'tracks' && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Music size={13} /> All tracks
                      </h3>
                      <div className="space-y-1">
                        {MOCK_TRACK_DATABASE.map(track => (
                          <div
                            key={track.id}
                            onClick={() => onPlayTrack && onPlayTrack(track)}
                            className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors group"
                          >
                            <img src={track.coverUrl} className="w-11 h-11 rounded-lg object-cover" alt={track.title} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                              <p className="text-xs text-white/40 truncate">{track.artist}</p>
                            </div>
                            <span className="text-[11px] font-mono text-white/25">{track.duration}</span>
                            <Play size={13} className="text-white/25 group-hover:text-white transition-colors" fill="currentColor" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artists */}
                  {activeCategory === 'artists' && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Mic2 size={13} /> Artists
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['Tycho', 'Nils Frahm', 'Hotel Pools', 'Kiasmos', 'Explosions in the Sky', 'Sable Meridian'].map((artistName, index) => {
                          const trackForArtist = MOCK_TRACK_DATABASE.find(t => t.artist === artistName) || MOCK_TRACK_DATABASE[0];
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                const artistTracks = MOCK_TRACK_DATABASE.filter(t => t.artist === artistName);
                                setSelectedPlaylist({ id: `art-${index}`, title: `${artistName} Essentials`, subtitle: 'Top tracks', imageUrl: trackForArtist.coverUrl, category: 'artists', tracks: artistTracks.length > 0 ? artistTracks : [trackForArtist] });
                              }}
                              className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.08] transition-colors"
                            >
                              <img src={trackForArtist.coverUrl} className="w-20 h-20 rounded-full object-cover border border-white/10 mb-2.5" alt={artistName} />
                              <h4 className="text-xs font-semibold text-white truncate w-full">{artistName}</h4>
                              <span className="text-[9px] text-brand-green mt-1 font-medium">Artist</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Albums */}
                  {activeCategory === 'albums' && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Disc size={13} /> Albums
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { title: 'Awake',          artist: 'Tycho',            src: MOCK_TRACK_DATABASE[7] },
                          { title: 'Says EP',         artist: 'Nils Frahm',       src: MOCK_TRACK_DATABASE[4] },
                          { title: 'Eclipse Protoc.', artist: 'Sable Meridian',   src: MOCK_TRACK_DATABASE[0] },
                          { title: 'Nocturnes',       artist: 'Kiasmos',          src: MOCK_TRACK_DATABASE[2] },
                        ].map((album, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              const matchingTracks = MOCK_TRACK_DATABASE.filter(t => t.artist === album.artist);
                              setSelectedPlaylist({ id: `alb-${index}`, title: album.title, subtitle: `Album • ${album.artist}`, imageUrl: album.src.coverUrl, category: 'albums', tracks: matchingTracks.length ? matchingTracks : [album.src] });
                            }}
                            className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 cursor-pointer hover:bg-white/[0.08] transition-colors"
                          >
                            <img src={album.src.coverUrl} className="w-full aspect-square rounded-xl object-cover mb-2.5" alt={album.title} />
                            <h4 className="text-xs font-semibold text-white truncate">{album.title}</h4>
                            <p className="text-[10px] text-white/35 truncate">{album.artist}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Podcasts */}
                  {activeCategory === 'podcasts' && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquareText size={13} /> Podcasts
                      </h3>
                      <div className="space-y-2.5">
                        {[
                          { title: 'The Huberman Lab Podcast',      host: 'Dr. Andrew Huberman', eps: '150 episodes' },
                          { title: 'Lex Fridman Philosophy Series', host: 'Lex Fridman',         eps: '412 episodes' },
                          { title: 'Design Matters & Aesthetics',   host: 'Debbie Millman',      eps: '92 episodes'  },
                        ].map((pod, i) => (
                          <div key={i} className="flex items-center gap-3.5 p-3 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
                            <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center shrink-0">
                              <Headphones size={18} className="text-white/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">{pod.title}</h4>
                              <p className="text-[10px] text-white/35">{pod.host} · {pod.eps}</p>
                            </div>
                            <button
                              onClick={() => { const p = MOCK_PLAYLIST_DATABASE.find(p => p.category === 'podcasts'); if (p) setSelectedPlaylist(p); }}
                              className="text-[10px] font-semibold text-white/50 hover:text-white transition-colors shrink-0"
                            >
                              Browse
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </motion.div>
        )}

        {/* ══════════════ VIEW 3 — PLAYLIST DETAIL ═══════════════════ */}
        {activeCategory && selectedPlaylist && (
          <motion.div
            key="playlist-detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="flex flex-col h-full absolute inset-0 bg-brand-dark z-40"
          >
            <div className="relative h-52 flex-shrink-0 flex flex-col justify-end p-6">
              <button onClick={() => setSelectedPlaylist(null)} className="absolute top-5 left-6 p-2 rounded-full bg-black/50 backdrop-blur-md text-white z-50">
                <ArrowLeft size={20} />
              </button>
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img src={selectedPlaylist.imageUrl} className="w-full h-full object-cover blur-xl scale-110" alt="" />
              </div>
              <div className="relative z-10 flex gap-4 items-end">
                <img src={selectedPlaylist.imageUrl} alt={selectedPlaylist.title} className="w-24 h-24 rounded-2xl object-cover shadow-2xl" />
                <div className="min-w-0 pb-1">
                  <span className="text-[9px] font-semibold text-brand-green uppercase tracking-widest">Playlist</span>
                  <h1 className="text-lg font-bold text-white mt-0.5 leading-tight">{selectedPlaylist.title}</h1>
                  <p className="text-xs text-white/40 mt-1 line-clamp-1">{selectedPlaylist.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-y border-white/[0.06] bg-brand-dark/60 backdrop-blur">
              <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{selectedPlaylist.tracks.length} tracks</span>
              <button
                onClick={() => handlePlayPlaylistTrack(selectedPlaylist, selectedPlaylist.tracks[0])}
                className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all"
              >
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </button>
            </div>

            <main className="flex-1 overflow-y-auto px-6 pt-4 pb-36 no-scrollbar">
              <div className="space-y-1">
                {selectedPlaylist.tracks.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => handlePlayPlaylistTrack(selectedPlaylist, track)}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer group transition-colors"
                  >
                    <span className="w-4 text-[11px] font-mono text-white/25 text-center group-hover:text-brand-green transition-colors shrink-0">
                      {idx + 1}
                    </span>
                    <img src={track.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                      <p className="text-xs text-white/35 truncate">{track.artist}</p>
                    </div>
                    {track.duration && (
                      <span className="text-[10px] font-mono text-white/25 flex items-center gap-1">
                        <Clock size={9} />
                        {track.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </main>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaylistRow({ playlist, onSelect }: { playlist: CustomPlaylist; onSelect: (p: CustomPlaylist) => void }) {
  return (
    <div
      onClick={() => onSelect(playlist)}
      className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <img src={playlist.imageUrl} alt={playlist.title} className="w-14 h-14 rounded-xl object-cover" />
        <div className="min-w-0">
          <h4 className="font-semibold text-white truncate text-sm">{playlist.title}</h4>
          <p className="text-xs text-white/35 truncate mt-0.5">{playlist.subtitle}</p>
          <p className="text-[10px] text-brand-green font-medium mt-1">{playlist.tracks.length} tracks</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-white/25 shrink-0" />
    </div>
  );
}

function BrowseCard({ label, hint, Icon, onClick }: { label: string; hint: string | null; Icon: React.ElementType; onClick?: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="h-[88px] rounded-2xl p-4 flex flex-col justify-between cursor-pointer bg-white/[0.05] border border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.12] transition-colors"
    >
      <Icon size={22} className="text-white/50" strokeWidth={1.5} />
      <div>
        <span className="font-semibold text-white text-[13px] block leading-tight">{label}</span>
        {hint && <span className="text-[10px] text-white/25 font-medium">{hint}</span>}
      </div>
    </motion.div>
  );
}