import { ChevronRight, Radio, Bell, Loader2, Music2, Wifi } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Track } from '../types';
import { usePlayerStore } from '../Store/playerStore';
import { useAddonStore } from '../Store/addonStore';
import { AudiusAddon } from '../addons/audius';

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

export default function HomeScreen({ onPlayTrack }: HomeScreenProps) {
  const [trending,     setTrending]     = useState<Track[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const { history, setTrack } = usePlayerStore();
  const { installed }        = useAddonStore();

  // Connected source addons only
  const connectedSources = Object.entries(installed)
    .filter(([_, v]) => v.isEnabled)
    .map(([id]) => id);

  const audiusConnected = connectedSources.includes('aether.audius');

  // ── Fetch Audius trending on mount if connected ───────────────────────────
  useEffect(() => {
    if (!audiusConnected) return;
    setLoadingTrend(true);
    AudiusAddon.getFeatured()
      .then(setTrending)
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrend(false));
  }, [audiusConnected]);

  const handlePlay = (track: Track, queue: Track[]) => {
    const clean = (t: Track): Track => ({ ...t, streamUrl: undefined });
    const cleanTrack = clean(track);
    const cleanQueue = queue.map(clean);

    if (onPlayTrack) {
      onPlayTrack(cleanTrack, cleanQueue);
      return;
    }
    setTrack(cleanTrack, cleanQueue);
  };

  // "Continue listening" — trending if no history yet, otherwise history
  const continueListening = history.length > 0 ? history.slice(0, 6) : trending.slice(0, 6);

  // "Recently played" — last 5 from history
  const recentlyPlayed = history.slice(0, 5);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <header className="px-6 pt-5 pb-4 flex items-center justify-between sticky top-0 bg-brand-dark/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAidSlar_paA7A6MYfS7gdTvWmkBJpRed-Vtgh4zQl3sq_7gI55OXuRje_uAguRKvsnYzGyLXO3TGH1-sw6ufTBtz0kEJywe3jykacnjCJBgHbpm5PvgKzvsp8eBahCDNDs5XGzXSzw6NtS936KWV8errHccj5IceCbXf31GPSIW6h3gdW_jMBCj49v4jACeUubzNdTClUfE-dIa2pr9y3oO7lt26teptq6nnnWBVc75SJb3fZ0rPdL3YTeotBjcuZkT3PIp6Hlcrw"
          />
        </div>
        <button className="p-2 text-zinc-400">
          <Bell size={24} />
        </button>
      </header>

      <div className="px-6 pb-36">

        {/* Greeting */}
        <section className="mt-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
        </section>

        {/* Category chips */}
        <section className="mb-8 flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Music', 'Podcasts', 'Radio', 'Add-ons'].map((cat, i) => (
            <button
              key={cat}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                i === 0 ? 'bg-brand-green text-black' : 'bg-zinc-800 text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* ── Continue Listening ────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {history.length > 0 ? 'Continue listening' : 'Trending now'}
            </h2>
            <ChevronRight className="text-zinc-500" size={20} />
          </div>

          {loadingTrend && continueListening.length === 0 ? (
            <div className="flex items-center gap-2 text-white/30 py-6">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : continueListening.length === 0 ? (
            <EmptySection
              icon={<Music2 size={24} />}
              message="Connect a source in Add-ons to see music here"
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2">
              {continueListening.map((track) => (
                <div key={track.id}>
                  <FeaturedCard
                    image={track.coverUrl}
                    title={track.title}
                    subtitle={track.artist}
                    onClick={() => handlePlay(track, continueListening.length > 1 ? continueListening : history)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recently Played ───────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recently played</h2>
            <ChevronRight className="text-zinc-500" size={20} />
          </div>

          {recentlyPlayed.length === 0 ? (
            <EmptySection
              icon={<Music2 size={20} />}
              message="Tracks you play will appear here"
            />
          ) : (
            <div className="flex flex-col gap-1">
              {recentlyPlayed.map((track) => (
                <div key={track.id}>
                  <ListItem
                    image={track.coverUrl}
                    title={track.title}
                    subtitle={`${track.source}${track.duration ? ` · ${track.duration}` : ''}`}
                    onClick={() => handlePlay(track, history)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Your Sources ──────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Your sources</h2>
            <button className="text-xs text-zinc-500 font-medium">View all</button>
          </div>

          {connectedSources.length === 0 ? (
            <EmptySection
              icon={<Wifi size={20} />}
              message="No sources connected — go to Add-ons to connect one"
            />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {connectedSources.map((id) => (
                <div key={id}>
                  <SourceCard addonId={id} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeaturedCard({
  image, title, subtitle, onClick,
}: {
  image: string; title: string; subtitle: string; onClick?: () => void;
}) {
  return (
    <div
      className="w-[140px] flex-shrink-0 flex flex-col gap-2 cursor-pointer active:opacity-70 transition-opacity"
      onClick={onClick}
    >
      <div className="aspect-square bg-zinc-800 rounded-xl overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

function ListItem({
  image, title, subtitle, onClick,
}: {
  image: string; title: string; subtitle: string; onClick?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-4 group active:opacity-70 transition-opacity cursor-pointer py-1.5 rounded-xl hover:bg-white/[0.03]"
      onClick={onClick}
    >
      <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

// Derives label and icon from the addon ID
function SourceCard({ addonId }: { addonId: string }) {
  const label = addonId.replace('aether.', '');
  const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex flex-col gap-2">
      <div className="text-brand-green">
        <Radio size={20} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold truncate">
          {displayLabel}
        </p>
        <p className="text-[11px] text-zinc-300">Connected</p>
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