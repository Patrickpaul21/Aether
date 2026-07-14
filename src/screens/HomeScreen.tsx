import { ChevronRight, Radio, Bell, Loader2, Music2, Wifi, Disc, Archive, Headphones } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Track } from '../types';
import { usePlayerStore } from '../Store/playerStore';
import { useAddonStore } from '../Store/addonStore';
import { AudiusAddon } from '../addons/audius';
import { InternetArchiveAddon } from '../addons/internetarchive';
import { ItunesAddon } from '../addons/itunes/index';
import { RadioAddon } from '../addons/radio';

interface HomeScreenProps {
  onPlayTrack?: (track: Track, queue?: Track[]) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=480&q=80';

// Maps addon id → display config
const ADDON_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'aether.audius':       { label: 'Audius',           color: 'text-purple-400',  icon: <span className="font-black text-base">◈</span> },
  'aether.archive':      { label: 'Internet Archive', color: 'text-yellow-400',  icon: <span className="font-black text-xs">IA</span> },
  'aether.itunes':       { label: 'iTunes',           color: 'text-pink-400',    icon: <span className="font-black text-xs">IT</span> },
  'aether.radio':        { label: 'Radio Browser',    color: 'text-cyan-400',    icon: <Radio size={18} /> },
  'aether.jiosaavn':     { label: 'JioSaavn',         color: 'text-orange-400',  icon: <span className="font-black text-xs">JS</span> },
  'aether.soundcloud':   { label: 'SoundCloud',       color: 'text-orange-500',  icon: <Music2 size={18} /> },
  'aether.navidrome':    { label: 'Navidrome',        color: 'text-green-400',   icon: <Disc size={18} /> },
  'aether.spotify':      { label: 'Spotify',          color: 'text-green-500',   icon: <span className="font-black text-xs">♫</span> },
};

export default function HomeScreen({ onPlayTrack }: HomeScreenProps) {
  const [featured, setFeatured] = useState<Track[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  const { history, setTrack } = usePlayerStore();
  const { installed, isEnabled } = useAddonStore();

  const connectedSources = Object.entries(installed)
    .filter(([_, v]) => v.isEnabled)
    .map(([id]) => id);

  // Pull getFeatured() from all connected addons in parallel
  useEffect(() => {
    const fetchers: Promise<Track[]>[] = [];

    if (isEnabled('aether.audius'))  fetchers.push(AudiusAddon.getFeatured().catch(() => []));
    if (isEnabled('aether.archive')) fetchers.push(InternetArchiveAddon.getFeatured().catch(() => []));
    if (isEnabled('aether.itunes'))  fetchers.push(ItunesAddon.getFeatured?.().catch(() => []) ?? Promise.resolve([]));
    if (isEnabled('aether.radio'))   fetchers.push(RadioAddon.getFeatured?.().catch(() => []) ?? Promise.resolve([]));

    if (fetchers.length === 0) return;

    setLoadingFeatured(true);
    Promise.all(fetchers)
      .then(results => {
        // Interleave results from different sources for variety
        const merged: Track[] = [];
        const max = Math.max(...results.map(r => r.length));
        for (let i = 0; i < max; i++) {
          results.forEach(r => { if (r[i]) merged.push(r[i]); });
        }
        setFeatured(merged.slice(0, 20));
      })
      .finally(() => setLoadingFeatured(false));
  }, [JSON.stringify(connectedSources)]);

  const handlePlay = (track: Track, queue: Track[]) => {
    const clean = (t: Track): Track => ({ ...t, streamUrl: undefined });
    if (onPlayTrack) { onPlayTrack(clean(track), queue.map(clean)); return; }
    setTrack(clean(track), queue.map(clean));
  };

  const continueListening = history.length > 0 ? history.slice(0, 6) : featured.slice(0, 6);
  const recentlyPlayed    = history.slice(0, 5);
  const featuredGrid      = featured.slice(0, 12);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <header className="px-6 pt-5 pb-4 flex items-center justify-between sticky top-0 bg-brand-dark/80 backdrop-blur-md z-30">
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white/60">P</span>
        </div>
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell size={22} />
        </button>
      </header>

      <div className="px-6 pb-36">

        {/* Greeting */}
        <section className="mt-2 mb-7">
          <p className="text-sm text-white/40 font-medium mb-1">
            {new Date().toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-black tracking-tight">{getGreeting()}</h1>
        </section>

        {/* Category chips — placeholder */}
        <section className="mb-8 flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Music', 'Podcasts', 'Radio', 'Add-ons'].map((cat, i) => (
            <button key={cat}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                i === 0 ? 'bg-brand-green text-black' : 'bg-white/[0.07] border border-white/[0.08] text-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Continue listening */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {history.length > 0 ? 'Continue listening' : 'Featured'}
            </h2>
            <ChevronRight className="text-zinc-500" size={20} />
          </div>

          {loadingFeatured && continueListening.length === 0 ? (
            <div className="flex items-center gap-2 text-white/30 py-6">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : continueListening.length === 0 ? (
            <EmptySection icon={<Music2 size={24} />} message="Connect a source in Add-ons to see music here" />
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2 pb-1">
              {continueListening.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <FeaturedCard
                    image={track.coverUrl}
                    title={track.title}
                    subtitle={track.artist}
                    source={track.source}
                    onClick={() => handlePlay(track, continueListening)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Recently played */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recently played</h2>
              <ChevronRight className="text-zinc-500" size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              {recentlyPlayed.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <ListItem
                    image={track.coverUrl}
                    title={track.title}
                    subtitle={`${track.source}${track.duration ? ` · ${track.duration}` : ''}`}
                    onClick={() => handlePlay(track, history)}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Featured grid — from all addons */}
        {featuredGrid.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">From your sources</h2>
              <ChevronRight className="text-zinc-500" size={20} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredGrid.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onClick={() => handlePlay(track, featuredGrid)}
                  className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.06] rounded-2xl p-2.5 cursor-pointer hover:bg-white/[0.09] transition-colors active:scale-[0.98]"
                >
                  <img
                    src={track.coverUrl || FALLBACK_COVER}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
                    alt={track.title}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate text-white">{track.title}</p>
                    <p className="text-[11px] text-white/40 truncate mt-0.5">{track.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Your sources */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Your sources</h2>
            <button className="text-xs text-zinc-500 font-medium hover:text-white transition-colors">View all</button>
          </div>

          {connectedSources.length === 0 ? (
            <EmptySection icon={<Wifi size={20} />} message="No sources connected — go to Add-ons to connect one" />
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {connectedSources
                .filter(id => ADDON_META[id])
                .map((id) => {
                  const meta = ADDON_META[id];
                  return (
                    <div key={id}
                      className="bg-white/[0.05] border border-white/[0.07] p-3 rounded-2xl flex flex-col gap-2 hover:bg-white/[0.09] transition-colors cursor-pointer">
                      <div className={meta.color}>{meta.icon}</div>
                      <div>
                        <p className="text-[11px] font-bold text-white truncate">{meta.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Connected</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeaturedCard({ image, title, subtitle, source, onClick }: {
  image: string; title: string; subtitle: string; source?: string; onClick?: () => void;
}) {
  return (
    <div
      className="w-[155px] flex-shrink-0 flex flex-col gap-2 cursor-pointer active:opacity-70 transition-opacity group"
      onClick={onClick}
    >
      <div className="aspect-square bg-white/[0.06] rounded-2xl overflow-hidden relative">
        <img
          src={image || FALLBACK_COVER}
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {source && (
          <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-white/70">
            {source}
          </span>
        )}
      </div>
      <div className="px-0.5">
        <p className="text-sm font-semibold truncate text-white">{title}</p>
        <p className="text-xs text-white/40 truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function ListItem({ image, title, subtitle, onClick }: {
  image: string; title: string; subtitle: string; onClick?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3.5 py-2 px-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors active:opacity-70 group"
      onClick={onClick}
    >
      <img
        src={image || FALLBACK_COVER}
        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_COVER; }}
        alt={title}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-white">{title}</p>
        <p className="text-xs text-white/40 truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptySection({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex items-center gap-3 py-6 text-white/20">
      <div className="shrink-0">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}