/**
 * AddOnsScreen — fully wired to addonStore
 *
 * States per addon:
 *   Not installed  → "Connect" (sources) or "Install" (themes/tools)
 *   Installed + enabled  → green Connected + Disable | Disconnect actions
 *   Installed + disabled → greyed out + Enable | Disconnect actions
 *
 * Source addons that need credentials show a bottom sheet with input fields.
 * Theme/tool addons install with one tap (no credentials needed).
 */

import {
  LayoutGrid, Check, X, ChevronDown,
  Disc, Music2, Radio, Server, Youtube,
  ExternalLink, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ADDONS } from '../constants';
import { AddOn } from '../types';
import { useAddonStore } from '../Store/addonStore';
import { getSpotifyAuthUrl } from '../addons/spotify/index';

// ── Map each addon's icon key to a store ID ──────────────────────────────────
// Convention: 'aether.{icon}' — keep this consistent with the addon files
function toStoreId(addon: AddOn): string {
  return `aether.${addon.icon}`; // e.g. 'aether.soundcloud'
}

// ── Which addons need credentials before they can be used ───────────────────
const CREDENTIAL_FIELDS: Record<string, Array<{
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  optional?: boolean;
  helpText?: string;
}>> = {
  audius: [
    {
      key: 'bearerToken',
      label: 'Bearer Token (optional)',
      placeholder: 'Free API key from api.audius.co/plans',
      secret: true,
      optional: true,
      helpText: 'Optional — higher rate limits. Works without a key.',
    },
  ],
  soundcloud: [
    {
      key: 'clientId',
      label: 'Client ID',
      placeholder: 'Your SoundCloud Client ID',
      helpText: 'soundcloud.com/you/apps → create app → copy Client ID',
    },
    {
      key: 'clientSecret',
      label: 'Client Secret',
      placeholder: 'Your SoundCloud Client Secret',
      secret: true,
    },
  ],
 
  navidrome: [
    { key: 'serverUrl',  label: 'Server URL',  placeholder: 'https://music.yourserver.com' },
    { key: 'username',   label: 'Username',    placeholder: 'Your Navidrome username' },
    { key: 'password',   label: 'Password',    placeholder: 'Your Navidrome password', secret: true },
  ],
  jellyfin: [
    { key: 'serverUrl', label: 'Server URL', placeholder: 'https://jellyfin.yourserver.com' },
    { key: 'apiKey',    label: 'API Key',    placeholder: 'Jellyfin API key', secret: true },
  ],
};

// ── Tab filtering ────────────────────────────────────────────────────────────
const TABS = ['Featured', 'Sources', 'Visualizers', 'Themes', 'Tools'] as const;
type TabName = typeof TABS[number];

function filterByTab(addons: AddOn[], tab: TabName): AddOn[] {
  if (tab === 'Featured') return addons;
  const map: Record<TabName, AddOn['type'] | null> = {
    Featured:    null,
    Sources:     'source',
    Visualizers: 'visualizer',
    Themes:      'theme',
    Tools:       'tool',
  };
  return addons.filter((a) => a.type === map[tab]);
}

// ────────────────────────────────────────────────────────────────────────────

export default function AddOnsScreen() {
  const [activeTab,     setActiveTab]     = useState<TabName>('Featured');
  const [connectingId,  setConnectingId]  = useState<string | null>(null); // icon key
  const [formValues,    setFormValues]    = useState<Record<string, string>>({});
  const [showSecrets,   setShowSecrets]   = useState<Record<string, boolean>>({});
  const [connectError,  setConnectError]  = useState<string | null>(null);

  const { install, uninstall, toggle, isInstalled, isEnabled } = useAddonStore();

  const visibleAddons = filterByTab(ADDONS, activeTab);
  const connectingAddon = ADDONS.find((a) => a.icon === connectingId);
  const fields = connectingId ? (CREDENTIAL_FIELDS[connectingId] ?? []) : [];

  // ── Connect / Install handler ────────────────────────────────────────────
  const handleConnectTap = (addon: AddOn) => {
    // Spotify uses OAuth — redirect to Spotify login
    if (addon.icon === 'spotify') return;
    const hasFields = (CREDENTIAL_FIELDS[addon.icon] ?? []).length > 0;
    if (hasFields) {
      setConnectingId(addon.icon);
      setFormValues({});
      setConnectError(null);
    } else {
      install(toStoreId(addon));
    }
  };

  const handleSheetSubmit = () => {
    if (!connectingAddon) return;
    const required = CREDENTIAL_FIELDS[connectingAddon.icon] ?? [];

    // Validate all fields filled
    const missing = required.find((f) => !f.optional && !formValues[f.key]?.trim());
    if (missing) {
      setConnectError(`${missing.label} is required.`);
      return;
    }

    install(toStoreId(connectingAddon), formValues);
    setConnectingId(null);
    setFormValues({});
    setConnectError(null);
  };

  const handleDisconnect = (addon: AddOn) => {
    uninstall(toStoreId(addon));
  };

  const handleToggle = (addon: AddOn) => {
    toggle(toStoreId(addon));
  };

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="px-6 pt-5 pb-4">
        <h1 className="text-3xl font-bold">Add-ons</h1>
      </section>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <nav className="px-6 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-brand-green text-black'
                  : 'bg-brand-card border border-brand-border text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Addon list ───────────────────────────────────────────────────── */}
      <section className="px-6 space-y-1 pb-40">
        {visibleAddons.map((addon) => {
          const storeId    = toStoreId(addon);
          const installed  = isInstalled(storeId);
          const enabled    = isEnabled(storeId);
          const isSource   = addon.type === 'source';

          return (
            <motion.div
              key={addon.id}
              layout
              className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-0"
            >
              {/* Icon + info */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.06] ${
                  installed && enabled ? 'bg-brand-card' : 'bg-brand-card/50'
                }`}>
                  {getIcon(addon.icon, installed && enabled ? addon.color : 'text-white/25')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-[15px] ${installed && enabled ? 'text-white' : installed ? 'text-white/50' : 'text-white'}`}>
                      {addon.name}
                    </h3>
                    {installed && enabled && (
                      <span className="text-[9px] font-bold text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Active
                      </span>
                    )}
                    {installed && !enabled && (
                      <span className="text-[9px] font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/35 mt-0.5">{addon.description}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {!installed ? (
                  // Not connected
                  <button
                    onClick={() => handleConnectTap(addon)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-all active:scale-95"
                  >
                    {isSource ? 'Connect' : 'Install'}
                  </button>
                ) : (
                  // Connected — show toggle + disconnect
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(addon)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                        enabled
                          ? 'border border-white/10 text-white/40 hover:text-white/70'
                          : 'border border-brand-green/30 text-brand-green/70 hover:text-brand-green'
                      }`}
                    >
                      {enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(addon)}
                      className="w-7 h-7 rounded-full flex items-center justify-center border border-white/[0.08] text-white/25 hover:text-red-400 hover:border-red-400/30 transition-all active:scale-95"
                      title="Disconnect"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── Connect credential sheet ─────────────────────────────────────── */}
      <AnimatePresence>
        {connectingId && connectingAddon && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setConnectingId(null)}
              className="fixed inset-0 bg-black z-[110]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 z-[120] max-w-md mx-auto"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            >
              {/* Grabber */}
              <div className="flex justify-center mb-5">
                <div className="w-9 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    {getIcon(connectingAddon.icon, connectingAddon.color)}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold">Connect {connectingAddon.name}</h3>
                    <p className="text-xs text-white/35">Enter your credentials below</p>
                  </div>
                </div>
                <button
                  onClick={() => setConnectingId(null)}
                  className="text-white/30 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Credential fields */}
              <div className="space-y-3 mb-5">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={formValues[field.key] ?? ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors pr-10"
                      />
                      {field.secret && (
                        <button
                          onClick={() =>
                            setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                        >
                          {showSecrets[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                    {field.helpText && (
                      <p className="text-[10px] text-white/25 mt-1.5 flex items-center gap-1">
                        <ExternalLink size={9} />
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Error */}
              {connectError && (
                <div className="flex items-center gap-2 text-red-400 text-xs mb-4 bg-red-400/10 px-3 py-2 rounded-xl border border-red-400/15">
                  <AlertCircle size={13} />
                  {connectError}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSheetSubmit}
                className="w-full bg-brand-green text-black font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Connect {connectingAddon.name}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Icon resolver ─────────────────────────────────────────────────────────────
function getIcon(icon: string, color?: string) {
  const cls = color ?? 'text-white/50';
  switch (icon) {
    case 'audius': return <span className="font-black text-lg text-white/70">◈</span>;
    case 'navidrome':   return <Server    className={cls} size={22} />;
    case 'jellyfin':    return <Disc      className={cls} size={22} />;
    case 'youtube':     return <Youtube   className={cls} size={22} />;
    case 'radio':       return <Radio     className={cls} size={22} />;
    case 'archive':     return <span className={`font-black text-sm ${cls}`}>IA</span>;
    case 'spotify': return <span className={`font-black text-sm ${cls}`}>♫</span>;
    case 'soundcloud':  return <Music2    className={cls} size={22} />;
    case 'lastfm':      return <span className={`font-black text-lg italic leading-none ${cls}`}>as</span>;
    default:            return <LayoutGrid className={cls} size={22} />;
  }
}
