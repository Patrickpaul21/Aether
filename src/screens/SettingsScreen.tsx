import { 
  User, Server, Sliders, Moon, Globe, Download, Settings, ChevronRight, 
  ChevronLeft, Check, Plus, Trash2, Shield, Key, AlertTriangle, 
  Terminal, Loader2, Play, RefreshCw, HardDrive, Sparkles, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore, THEMES } from '../Store/themestore';
// Translation dictionary for all main pages
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: 'Settings',
    sources: 'Sources',
    manageSources: 'Manage sources',
    connectSources: 'Connect and manage your audio servers',
    playback: 'Playback',
    playbackSettings: 'Playback settings',
    audioQuality: 'Audio quality, gapless, presets, EQ',
    appearance: 'Appearance',
    theme: 'Theme',
    appLanguage: 'App language',
    advanced: 'Advanced',
    downloads: 'Downloads',
    manageDownloads: 'Manage downloaded offline tracks',
    advancedSettings: 'Advanced settings',
    devOptions: 'Developer engine logs & buffers',
    back: 'Back',
  },
  es: {
    title: 'Ajustes',
    sources: 'Fuentes',
    manageSources: 'Gestionar servidores',
    connectSources: 'Conéctate a tus servidores de audio',
    playback: 'Reproducción',
    playbackSettings: 'Ajustes de reproducción',
    audioQuality: 'Calidad de audio, EQ y fundidos',
    appearance: 'Apariencia',
    theme: 'Tema visual',
    appLanguage: 'Idioma de la aplicación',
    advanced: 'Avanzado',
    downloads: 'Descargas',
    manageDownloads: 'Gestionar pistas sin conexión',
    advancedSettings: 'Ajustes avanzados',
    devOptions: 'Parámetros del motor y registros',
    back: 'Atrás',
  },
  fr: {
    title: 'Paramètres',
    sources: 'Sources',
    manageSources: 'Gérer les sources',
    connectSources: 'Connecter et gérer vos serveurs',
    playback: 'Lecture',
    playbackSettings: 'Paramètres de lecture',
    audioQuality: 'Qualité audio, EQ et enchaînements',
    appearance: 'Apparence',
    theme: 'Thème de style',
    appLanguage: 'Langue de l\'application',
    advanced: 'Avancé',
    downloads: 'Téléchargements',
    manageDownloads: 'Gérer le contenu hors ligne',
    advancedSettings: 'Paramètres avanzados',
    devOptions: 'Journaux système et mémoire tampon',
    back: 'Retour',
  },
  de: {
    title: 'Einstellungen',
    sources: 'Musikquellen',
    manageSources: 'Quellen verwalten',
    connectSources: 'Verbinde deine Hosting-Server',
    playback: 'Wiedergabe',
    playbackSettings: 'Wiedergabeeinstellungen',
    audioQuality: 'Equalizer, Qualität & Effekte',
    appearance: 'Aussehen',
    theme: 'Farbthema',
    appLanguage: 'App-Sprache',
    advanced: 'Erweitert',
    downloads: 'Downloads',
    manageDownloads: 'Lokale Musik verwalten',
    advancedSettings: 'Erweiterte Einstellungen',
    devOptions: 'Entwicklerprotokolle & Datenpuffer',
    back: 'Zurück',
  },
  ja: {
    title: '設定',
    sources: '接続ソース',
    manageSources: 'ソースの管理',
    connectSources: 'オーディオサーバーの追加と管理',
    playback: '再生',
    playbackSettings: '再生・音質設定',
    audioQuality: 'イコライザー、ギャップレス、クロスフェード',
    appearance: '外観設定',
    theme: 'カラーテーマ',
    appLanguage: '表示言語',
    advanced: 'システム設定',
    downloads: 'ダウンロード',
    manageDownloads: 'オフライン楽曲の容量管理',
    advancedSettings: '高度な設定',
    devOptions: 'エンジンの動作ログとデバッグバッファ',
    back: '戻る',
  }
};

interface LogLine {
  time: string;
  type: 'INFO' | 'DEBUG' | 'WARN' | 'SUCCESS';
  message: string;
}

export default function SettingsScreen() {
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  
  // Settings values backed by localStorage
  const [lang, setLang] = useState<string>(() => localStorage.getItem('app-lang') || 'en');
  const { activeTheme, setTheme } = useThemeStore();
  const [audioQuality, setAudioQuality] = useState<string>(() => localStorage.getItem('pref-quality') || 'high');
  const [gapless, setGapless] = useState<boolean>(() => localStorage.getItem('pref-gapless') === 'true');
  const [crossfade, setCrossfade] = useState<number>(() => Number(localStorage.getItem('pref-crossfade')) || 4);
  const [eqPreset, setEqPreset] = useState<string>(() => localStorage.getItem('pref-eq') || 'normal');
  const [bufferSize, setBufferSize] = useState<string>(() => localStorage.getItem('pref-buffer') || 'safe');
  const [hwAccel, setHwAccel] = useState<boolean>(() => localStorage.getItem('pref-hw') !== 'false');
  const [cacheLimit, setCacheLimit] = useState<number>(() => Number(localStorage.getItem('pref-cache')) || 2); // GB
  
  // Real-time simulated developer logs
  const [logs, setLogs] = useState<LogLine[]>([
    { time: '23:55:01', type: 'INFO', message: 'Core music engine initialized.' },
    { time: '23:55:03', type: 'DEBUG', message: 'Preloaded next buffer block (32.1MB, chunk_index=41).' },
    { time: '23:56:41', type: 'SUCCESS', message: 'Navidrome handshake verified: demo.server (SSL v3).' }
  ]);

  const addLog = (type: 'INFO' | 'DEBUG' | 'WARN' | 'SUCCESS', message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { time: timeStr, type, message }].slice(-50)); // limit 50 logs max
  };

  // Dynamic Theme Styling Apply inside body element
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === 'theme-oled') {
      root.style.setProperty('--color-brand-dark', '#000000');
      root.style.setProperty('--color-brand-surface', '#000000');
      root.style.setProperty('--color-brand-card', '#0b0b0c');
      root.style.setProperty('--color-brand-border', '#1c1c1f');
    } else if (activeTheme === 'theme-cosmic') {
      root.style.setProperty('--color-brand-dark', '#08060f');
      root.style.setProperty('--color-brand-surface', '#100b21');
      root.style.setProperty('--color-brand-card', '#17112d');
      root.style.setProperty('--color-brand-border', '#2b1f52');
    } else if (activeTheme === 'theme-obsidian') {
      root.style.setProperty('--color-brand-dark', '#111215');
      root.style.setProperty('--color-brand-surface', '#181a1f');
      root.style.setProperty('--color-brand-card', '#22252c');
      root.style.setProperty('--color-brand-border', '#2e333d');
    } else if (activeTheme === 'theme-ascii') {
      root.style.setProperty('--color-brand-dark', '#0a0a0a');
      root.style.setProperty('--color-brand-surface', '#121212');
      root.style.setProperty('--color-brand-card', '#171717');
      root.style.setProperty('--color-brand-border', '#262626');
    } else {
      root.style.setProperty('--color-brand-dark', '#000000');
      root.style.setProperty('--color-brand-surface', '#000000');
      root.style.setProperty('--color-brand-card', '#0b0b0c');
      root.style.setProperty('--color-brand-border', '#1c1c1f');
    }
  }, [activeTheme]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  const renderSubPage = () => {
    switch (activeSubPage) {
      case 'sources':
        return <SourcesSubPage onBack={() => setActiveSubPage(null)} addLog={addLog} />;
      case 'playback':
        return (
          <PlaybackSubPage 
            quality={audioQuality} setQuality={(q) => { setAudioQuality(q); localStorage.setItem('pref-quality', q); addLog('INFO', `Audio quality target set to: ${q}`); }}
            gapless={gapless} setGapless={(g) => { setGapless(g); localStorage.setItem('pref-gapless', String(g)); addLog('DEBUG', `Gapless playback toggled: ${g}`); }}
            crossfade={crossfade} setCrossfade={(c) => { setCrossfade(c); localStorage.setItem('pref-crossfade', String(c)); addLog('DEBUG', `Crossfade duration: ${c}s`); }}
            eq={eqPreset} setEq={(e) => { setEqPreset(e); localStorage.setItem('pref-eq', e); addLog('INFO', `Equalizer changed to preset: ${e}`); }}
            onBack={() => setActiveSubPage(null)} 
          />
        );
        case 'theme':
          return (
            <ThemeSubPage 
              onBack={() => setActiveSubPage(null)} 
            />
          );
      case 'language':
        return (
          <LanguageSubPage 
            lang={lang} 
            setLang={(la) => { setLang(la); localStorage.setItem('app-lang', la); addLog('INFO', `Language updated: ${la.toUpperCase()}`); }}
            onBack={() => setActiveSubPage(null)} 
          />
        );
      case 'downloads':
        return <DownloadsSubPage onBack={() => setActiveSubPage(null)} addLog={addLog} />;
      case 'advanced':
        return (
          <AdvancedSubPage 
            bufferSize={bufferSize} setBufferSize={(b) => { setBufferSize(b); localStorage.setItem('pref-buffer', b); addLog('DEBUG', `Engine cache buffer size set to: ${b}`); }}
            hwAccel={hwAccel} setHwAccel={(h) => { setHwAccel(h); localStorage.setItem('pref-hw', String(h)); addLog('DEBUG', `Hardware parsing: ${h}`); }}
            cacheLimit={cacheLimit} setCacheLimit={(c) => { setCacheLimit(c); localStorage.setItem('pref-cache', String(c)); addLog('INFO', `Storage cache cap updated: ${c}GB`); }}
            logs={logs}
            clearLogs={() => { setLogs([]); addLog('INFO', 'Log buffer cleared.'); }}
            onBack={() => setActiveSubPage(null)} 
            addLog={addLog}
            onResetApp={() => {
              localStorage.clear();
              setTheme('theme-oled');
              setLang('en');
              setAudioQuality('high');
              setGapless(false);
              setCrossfade(4);
              setEqPreset('normal');
              setBufferSize('safe');
              setHwAccel(true);
              setCacheLimit(2);
              setActiveSubPage(null);
              addLog('WARN', 'All configurations cleared. App state reset to source.');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-dark transition-colors duration-500 overflow-y-auto no-scrollbar pb-32">
      <AnimatePresence mode="wait">
        {activeSubPage === null ? (
          <motion.div
            key="settings-list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="px-6 pt-5"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-8">{t.title}</h1>

            <div className="space-y-8">
              <SettingsSection title={t.sources}>
                <SettingsItem 
                  icon={<Server size={20} className="text-white/60" />} 
                  title={t.manageSources} 
                  subtitle={t.connectSources} 
                  onClick={() => { setActiveSubPage('sources'); addLog('INFO', 'Opened servers router dashboard.'); }} 
                />
              </SettingsSection>

              <SettingsSection title={t.playback}>
                <SettingsItem 
                  icon={<Sliders size={20} className="text-white/60" />} 
                  title={t.playbackSettings} 
                  subtitle={t.audioQuality} 
                  onClick={() => { setActiveSubPage('playback'); addLog('INFO', 'Opened audio engine EQ dashboard.'); }} 
                />
              </SettingsSection>

              <SettingsSection title={t.appearance}>
                <SettingsItem 
                  icon={<Moon size={20} className="text-white/60" />} 
                  title={t.theme} 
                  subtitle={activeTheme.toUpperCase()} 
                  subtitleColor="text-white/80 font-semibold"
                  onClick={() => { setActiveSubPage('theme'); addLog('INFO', 'Opened visual themes selection.'); }}
                />
                <SettingsItem 
                  icon={<Globe size={20} className="text-white/60" />} 
                  title={t.appLanguage} 
                  subtitle={lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang === 'fr' ? 'Français' : lang === 'de' ? 'Deutsch' : '日本語'} 
                  onClick={() => { setActiveSubPage('language'); addLog('INFO', 'Language customization accessed.'); }}
                />
              </SettingsSection>

              <SettingsSection title={t.advanced}>
                <SettingsItem 
                  icon={<Download size={20} className="text-white/60" />} 
                  title={t.downloads} 
                  subtitle={t.manageDownloads} 
                  onClick={() => { setActiveSubPage('downloads'); addLog('INFO', 'Scanning offline downloads storage...'); }}
                />
                <SettingsItem 
                  icon={<Settings size={20} className="text-white/60" />} 
                  title={t.advancedSettings} 
                  subtitle={t.devOptions} 
                  onClick={() => { setActiveSubPage('advanced'); addLog('INFO', 'System advanced logs console open.'); }}
                />
              </SettingsSection>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`page-${activeSubPage}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="px-6 pt-5"
          >
            {renderSubPage()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Helper UI Components */
function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">{title}</h2>
      <div className="bg-brand-card rounded-2xl overflow-hidden divide-y divide-white/[0.04] border border-white/[0.04] shadow-md">
        {children}
      </div>
    </section>
  );
}

function SettingsItem({ icon, title, subtitle, subtitleColor, onClick }: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  subtitleColor?: string;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-brand-card hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/70 group-hover:text-white transition-colors group-hover:scale-105 duration-200">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[15px] text-white tracking-tight leading-tight group-hover:text-white/95 transition-colors">{title}</p>
          <p className={`text-xs truncate block mt-0.5 ${subtitleColor || 'text-white/40'}`}>{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

interface SubPageHeaderProps {
  title: string;
  onBack: () => void;
}

function SubPageHeader({ title, onBack }: SubPageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8 -ml-2">
      <button 
        onClick={onBack}
        className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
      </button>
      <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
    </div>
  );
}

/* ==================== SUB-PAGES IMPLEMENTATION ==================== */

/* 1. PROFILE SUB-PAGE REMOVED AS APP IS OPEN SOURCE AND HAS NO LOGIN */

/* 2. SOURCES SUB-PAGE */
interface MediaSource {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'Online' | 'Offline' | 'Connecting';
}

function SourcesSubPage({ onBack, addLog }: { 
  onBack: () => void; 
  addLog: (type: 'INFO' | 'DEBUG' | 'WARN' | 'SUCCESS', m: string) => void;
}) {
  const [sources, setSources] = useState<MediaSource[]>(() => {
    const cached = localStorage.getItem('app-sources');
    return cached ? JSON.parse(cached) : [
      { id: '1', name: 'Universal Cloud', type: 'Navidrome', url: 'https://lh3.googleusercontent.com', status: 'Online' }
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);
  
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'Navidrome',
    url: '',
    username: '',
    password: ''
  });

  const saveSources = (updated: MediaSource[]) => {
    setSources(updated);
    localStorage.setItem('app-sources', JSON.stringify(updated));
  };

  const handleTestConnection = () => {
    if (!newSource.url.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    addLog('INFO', `Handshaking URL: ${newSource.url}`);
    
    setTimeout(() => {
      setIsTesting(false);
      // Fail on local ip or empty nickname, succeed for others
      if (newSource.url.toLowerCase().includes('fail')) {
        setTestResult('failed');
        addLog('WARN', `Gateway test failed handshake sequence.`);
      } else {
        setTestResult('success');
        addLog('SUCCESS', `Connection verified successfully to server: ${newSource.type}`);
      }
    }, 1500);
  };

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name || !newSource.url) return;
    
    const added: MediaSource = {
      id: Math.random().toString(),
      name: newSource.name,
      type: newSource.type,
      url: newSource.url,
      status: 'Online'
    };
    
    const updated = [...sources, added];
    saveSources(updated);
    addLog('SUCCESS', `Merged source database: ${newSource.name}`);
    
    // reset
    setNewSource({ name: '', type: 'Navidrome', url: '', username: '', password: '' });
    setTestResult(null);
    setShowAddForm(false);
  };

  const handleDeleteSource = (id: string, name: string) => {
    const updated = sources.filter(s => s.id !== id);
    saveSources(updated);
    addLog('WARN', `Severed media pipeline link for: ${name}`);
  };

  return (
    <div>
      <SubPageHeader title="Audio Host Servers" onBack={onBack} />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] ml-1">Connected Pipelines</h3>
        {!showAddForm && (
          <button 
            onClick={() => { setShowAddForm(true); setTestResult(null); }}
            className="text-xs font-black bg-white hover:bg-neutral-200 text-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} /> Connect Source
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddSource}
            className="bg-brand-card border border-white/10 p-5 rounded-2xl mb-6 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-3 mb-1">
              <span className="text-sm font-black tracking-tight text-white/90">Connect New Server</span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-white/40 hover:text-white text-xs font-bold px-2 py-0.5 hover:bg-white/5 rounded-md"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/40">Nickname</label>
                <input 
                  type="text"
                  required
                  value={newSource.name}
                  onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Home Server"
                  className="w-full bg-black/30 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/40">Server Protocol</label>
                <select 
                  className="w-full bg-black/30 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none h-8 select-custom"
                  value={newSource.type}
                  onChange={(e) => setNewSource(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="Navidrome">Navidrome API</option>
                  <option value="Jellyfin">Jellyfin Direct</option>
                  <option value="Plex">Plex Media Server</option>
                  <option value="WebDAV">Universal WebDAV</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/40">Endpoint Domain URL</label>
              <input 
                type="url"
                required
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-navidrome-address.me:443"
                className="w-full bg-black/30 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/40">Username</label>
                <input 
                  type="text"
                  value={newSource.username}
                  onChange={(e) => setNewSource(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Optional"
                  className="w-full bg-black/30 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-white/40">Access token / Password</label>
                <input 
                  type="password"
                  value={newSource.password}
                  onChange={(e) => setNewSource(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Secure string"
                  className="w-full bg-black/30 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Simulated verification outcomes */}
            {testResult === 'success' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl p-2.5 text-center flex items-center justify-center gap-1.5">
                <Check size={14} strokeWidth={3} className="text-emerald-400" /> Handshake verification succeeded!
              </div>
            )}
            {testResult === 'failed' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl p-2.5 text-center flex items-center justify-center gap-1.5">
                <AlertTriangle size={14} className="text-red-400" /> Failed resolving host domain handshake.
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !newSource.url}
                className="flex-1 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-40 text-xs font-black py-2.5 border border-white/10 text-white rounded-xl flex items-center justify-center gap-1.5 h-10"
              >
                {isTesting ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white/70" /> Synthesizing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} /> Link Query Verification
                  </>
                )}
              </button>
              <button 
                type="submit"
                disabled={testResult !== 'success'}
                className="flex-1 bg-white hover:bg-neutral-200 text-black font-black text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-white h-10"
              >
                Add Host Source
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {sources.length === 0 ? (
          <div className="bg-brand-card/50 border border-white/[0.04] p-8 text-center rounded-2xl">
            <Server size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">No Sources Defined</p>
            <p className="text-[11px] text-white/30">Connect a media source using Navidrome or Plex above to feed audio streams.</p>
          </div>
        ) : (
          sources.map(source => (
            <div 
              key={source.id}
              className="bg-brand-card border border-white/[0.04] p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60">
                  <Server size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm tracking-tight text-white/90 truncate">{source.name}</p>
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                      {source.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/30 truncate mt-0.5 font-mono">{source.url}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                  <span className={`w-1.5 h-1.5 rounded-full ${source.status === 'Online' ? 'bg-emerald-400' : 'bg-red-500'} shadow`}></span>
                  <span className="text-[9px] font-black uppercase text-white/50 tracking-wider font-mono">{source.status}</span>
                </div>
                <button 
                  onClick={() => handleDeleteSource(source.id, source.name)}
                  className="p-1 px-2 hover:bg-red-500/10 hover:text-red-400 text-white/30 rounded-xl transition-all"
                  title="Purge Active Pipeline Connections"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* 3. PLAYBACK SETTINGS SUB-PAGE */
function PlaybackSubPage({ 
  quality, setQuality, gapless, setGapless, crossfade, setCrossfade, eq, setEq, onBack 
}: {
  quality: string; setQuality: (q: string) => void;
  gapless: boolean; setGapless: (g: boolean) => void;
  crossfade: number; setCrossfade: (c: number) => void;
  eq: string; setEq: (e: string) => void;
  onBack: () => void;
}) {
  // Equalizer visual wave frames based on preset
  const getEqHeights = () => {
    switch (eq) {
      case 'bass': return [90, 80, 60, 40, 25, 20, 30, 45];
      case 'vocals': return [15, 30, 45, 85, 95, 70, 40, 20];
      case 'acoustic': return [60, 50, 35, 45, 60, 75, 80, 70];
      case 'treble': return [10, 20, 30, 45, 60, 75, 90, 95];
      default: return [40, 40, 40, 40, 40, 40, 40, 40]; // normal
    }
  };

  return (
    <div>
      <SubPageHeader title="Audio Decoding Engine" onBack={onBack} />

      {/* Streaming quality tier selector */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Decoding Pipeline Rate</h3>
      <div className="bg-brand-card border border-white/[0.04] p-4 rounded-xl mb-6 space-y-3">
        {[
          { id: 'saver', title: 'Data Saver (64 kbps)', desc: 'Optimized for slow standard data networks' },
          { id: 'medium', title: 'High Fidelity SD (192 kbps)', desc: 'Balanced compression rates' },
          { id: 'high', title: 'Ultra HD HQ (320 kbps)', desc: 'Original sound stage detailing' },
          { id: 'lossless', title: 'Studio Master Lossless (FLAC)', desc: 'Pure uncompressed source pipeline' }
        ].map(item => (
          <div 
            key={item.id}
            onClick={() => setQuality(item.id)}
            className={`p-3.5 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
              quality === item.id 
                ? 'bg-white/10 border-white/20 shadow-md' 
                : 'bg-white/5 border-transparent hover:bg-white/[0.08]'
            }`}
          >
            <div className="text-left">
              <p className={`text-sm font-bold tracking-tight ${quality === item.id ? 'text-white' : 'text-white/70'}`}>{item.title}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{item.desc}</p>
            </div>
            {quality === item.id && (
              <div className="bg-white p-1 rounded-full text-black flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Latency toggles */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Buffers & Layouts</h3>
      <div className="bg-brand-card border border-white/[0.04] px-4 rounded-xl mb-6 divide-y divide-white/[0.04]">
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white/90">Seamless Gapless Playback</p>
            <p className="text-xs text-white/40 mt-0.5">Stich audio decoders back-to-back</p>
          </div>
          <button 
            type="button"
            onClick={() => setGapless(!gapless)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none ${
              gapless ? 'bg-white' : 'bg-white/10 border border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-full shadow-md transform duration-200 ${
              gapless ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/70'
            }`} />
          </button>
        </div>

        {/* Crossfade slider */}
        <div className="py-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/90">Decrossfade Fading</span>
            <span className="font-mono text-xs text-white/60 font-black">{crossfade === 0 ? 'Disabled' : `${crossfade}s`}</span>
          </div>
          <div className="flex items-center gap-4 py-2">
            <input 
              type="range"
              min="0"
              max="12"
              value={crossfade}
              onChange={(e) => setCrossfade(Number(e.target.value))}
              className="w-full h-[3px] bg-white/10 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-[5.5px] transition-all"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${(crossfade/12)*100}%, rgba(255,255,255,0.1) ${(crossfade/12)*100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Pre-equalizer customization inside card */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Live Equalizer presets</h3>
      <div className="bg-brand-card border border-white/[0.04] p-5 rounded-xl space-y-6">
        
        {/* EQ curves bands animators */}
        <div className="flex items-end justify-between h-20 px-8 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-1 flex items-center justify-between text-[8px] px-8 text-white/20 font-mono select-none">
            <span>32Hz</span>
            <span>125Hz</span>
            <span>500Hz</span>
            <span>2kHz</span>
            <span>8kHz</span>
            <span>16kHz</span>
          </div>
          {getEqHeights().map((height, i) => (
            <motion.div 
              key={`${eq}-${i}`}
              className="w-2.5 bg-gradient-to-t from-zinc-700 to-white rounded-t-md relative flex items-center"
              initial={{ height: 10 }}
              animate={{ height: `${height}%` }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
            />
          ))}
        </div>

        {/* EQ presets list selectors */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { id: 'normal', name: 'Reference Flat' },
            { id: 'bass', name: 'Bass Thumper' },
            { id: 'vocals', name: 'Vocal Enhance' },
            { id: 'acoustic', name: 'Acoustic Ambient' },
            { id: 'treble', name: 'Bright Highs' }
          ].map(preset => (
            <button
               key={preset.id}
               onClick={() => setEq(preset.id)}
               className={`py-2 px-3.5 border rounded-full text-xs font-bold tracking-tight transition-all active:scale-95 ${
                 eq === preset.id
                   ? 'bg-white text-black border-white shadow'
                   : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'
               }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

/* 4. THEME (APPEARANCE) SUB-PAGE */
function ThemeSubPage({ onBack }: { onBack: () => void }) {
  const { activeTheme, setTheme } = useThemeStore();

  return (
    <div>
      <SubPageHeader title="Visual Canvas Themes" onBack={onBack} />

      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Pick Ambient Canvas</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {THEMES.map(item => (
          <div
            key={item.id}
            onClick={() => setTheme(item.id)}
            className={`p-4 rounded-2xl cursor-pointer border hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
              activeTheme === item.id
                ? 'border-white'
                : 'border-white/[0.04] bg-brand-card hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`w-8 h-8 rounded-full ${
                item.id === 'theme-oled' ? 'bg-black border border-white/20' :
                item.id === 'theme-cosmic' ? 'bg-[#0d0b1e]' :
                item.id === 'theme-obsidian' ? 'bg-[#0f1710]' :
                'bg-black border border-green-500/50'
              }`} />
              {activeTheme === item.id && (
                <div className="bg-white p-1 rounded-full text-black">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="text-left mt-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-white/95">{item.name}</p>
                {item.isCustom && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 border border-white/10 text-white/50 px-1.5 py-0.5 rounded">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/40 leading-tight mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Live Theme Preview</h3>
      <div className="bg-brand-card border border-white/[0.04] p-5 rounded-2xl space-y-4">
        <p className="text-xs text-white/40">Applied globally across the interface in real-time. Persists on reload.</p>
        <div className="rounded-xl border border-brand-border p-4 space-y-3 bg-brand-surface relative overflow-hidden">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded bg-brand-card shrink-0 shadow-md border border-brand-border" />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="h-3 w-1/2 bg-white/80 rounded" />
              <div className="h-2 w-1/3 bg-white/30 rounded mt-1.5" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-black">
                <Play size={10} fill="currentColor" />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-brand-border rounded-full">
            <div className="h-full bg-brand-green w-2/5 rounded-full" />
          </div>
        </div>
      </div>

      {/* ASCII font preview */}
      {activeTheme === 'theme-ascii' && (
        <div className="mt-4 bg-black border border-green-500/30 p-4 rounded-2xl font-mono text-green-400 text-xs space-y-1">
          <p>{'> AETHER OS v1.0.0'}</p>
          <p>{'> THEME: ASCII TERMINAL'}</p>
          <p>{'> STATUS: ONLINE ■■■■■□□□□□'}</p>
          <p className="animate-pulse">{'> _'}</p>
        </div>
      )}
    </div>
  );
}

      

/* 5. APP LANGUAGE SUB-PAGE */
function LanguageSubPage({ lang, setLang, onBack }: {
  lang: string;
  setLang: (la: string) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <SubPageHeader title="Core System Language" onBack={onBack} />

      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Select Language</h3>
      <div className="bg-brand-card border border-white/[0.04] p-3 rounded-2xl space-y-1.5 shadow-md">
        {[
          { id: 'en', title: 'English', sub: 'Primary interface engine', tag: 'EN' },
          { id: 'es', title: 'Español', sub: 'Traducciones completas', tag: 'ES' },
          { id: 'fr', title: 'Français', sub: 'Interface utilisateur polie', tag: 'FR' },
          { id: 'de', title: 'Deutsch', sub: 'Systemlokalisierung bereit', tag: 'DE' },
          { id: 'ja', title: '日本語', sub: 'インターフェース全体を完全翻訳', tag: 'JA' }
        ].map(item => (
          <div
            key={item.id}
            onClick={() => setLang(item.id)}
            className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
              lang === item.id
                ? 'bg-white/10 border border-white/10 shadow'
                : 'bg-transparent border border-transparent hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black w-8 h-8 rounded-lg bg-black/40 border flex items-center justify-center font-mono ${
                lang === item.id ? 'border-white text-white' : 'border-white/10 text-white/50'
              }`}>
                {item.tag}
              </span>
              <div className="text-left">
                <span className="text-sm font-bold block text-white/95 leading-tight">{item.title}</span>
                <span className="text-xs text-white/35 block mt-0.5">{item.sub}</span>
              </div>
            </div>
            {lang === item.id && (
              <div className="bg-white p-1 rounded-full text-black flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6. DOWNLOADS SUB-PAGE */
interface TrackStorage {
  id: string;
  title: string;
  artist: string;
  size: string;
}

function DownloadsSubPage({ onBack, addLog }: {
  onBack: () => void;
  addLog: (type: 'INFO' | 'DEBUG' | 'WARN' | 'SUCCESS', m: string) => void;
}) {
  const [downloadedTracks, setDownloadedTracks] = useState<TrackStorage[]>([
    { id: 't1', title: 'Eclipse Protocol', artist: 'Sable Meridian', size: '12.4 MB' },
    { id: 't2', title: 'Midnight Loops', artist: 'Hotel Pools', size: '8.9 MB' },
    { id: 't3', title: 'Fragments', artist: 'Kiasmos', size: '10.1 MB' },
    { id: 't4', title: 'Bon Iver Selections', artist: 'Bon Iver', size: '14.2 MB' }
  ]);

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const calculateUsedSpace = () => {
    const totalMB = downloadedTracks.reduce((acc, curr) => acc + parseFloat(curr.size.split(' ')[0]), 0);
    return totalMB.toFixed(1);
  };

  const handleDeleteItem = (id: string, title: string) => {
    setDownloadedTracks(prev => prev.filter(t => t.id !== id));
    addLog('WARN', `Purged offline cache for track: ${title}`);
  };

  const handleClearAll = () => {
    setDownloadedTracks([]);
    setClearConfirmOpen(false);
    addLog('SUCCESS', 'All offline storage caches purged successfully.');
  };

  return (
    <div>
      <SubPageHeader title="Offline Storage Pipeline" onBack={onBack} />

      {/* Disk utilization gauge */}
      <div className="bg-brand-card border border-white/[0.04] p-5 rounded-2xl mb-6 relative overflow-hidden shadow-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-white/40 flex items-center gap-2">
            <HardDrive size={14} /> Device Cache Capacity
          </span>
          <span className="text-xs font-mono font-black text-white/90">
            {calculateUsedSpace()} MB used
          </span>
        </div>
        
        {/* Progress Bar representation */}
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden mb-1 border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            style={{ width: `${Math.min(100, (parseFloat(calculateUsedSpace()) / 250) * 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-white/35 mt-1 font-mono">
          <span>{downloadedTracks.length} tracks offline</span>
          <span>500.0 MB Limit</span>
        </div>

        {downloadedTracks.length > 0 && (
          <button 
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            className="w-full mt-4 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-500 hover:text-white text-xs font-black py-2.5 rounded-xl transition-all h-9 flex items-center justify-center tracking-wider uppercase"
          >
            Clear Out Everything
          </button>
        )}
      </div>

      {/* Tracks List */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Downloaded offline items</h3>
      <div className="bg-brand-card border border-white/[0.04] p-3 rounded-2xl space-y-1.5 shadow-inner">
        {downloadedTracks.length === 0 ? (
          <div className="p-8 text-center bg-black/10 rounded-xl">
            <Download size={28} className="mx-auto text-white/15 mb-2 animate-pulse" />
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Local Space Empty</p>
            <p className="text-[10px] text-white/30">Download tracks in Player page to populate this screen.</p>
          </div>
        ) : (
          downloadedTracks.map(item => (
            <div 
              key={item.id}
              className="flex justify-between items-center p-3.5 hover:bg-white/[0.02] border border-transparent rounded-xl transition-all"
            >
              <div className="min-w-0 text-left">
                <span className="text-sm font-bold text-white/95 leading-tight block truncate">{item.title}</span>
                <span className="text-xs text-white/35 block mt-0.5 truncate">{item.artist}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-white/45 bg-black/40 px-2 py-0.5 border border-white/5 rounded">
                  {item.size}
                </span>
                <button 
                  onClick={() => handleDeleteItem(item.id, item.title)}
                  className="p-1 px-1.5 hover:bg-white/5 text-white/30 hover:text-white rounded"
                  title="Wipe Track Off Local Cache"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Overlays */}
      <AnimatePresence>
        {clearConfirmOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setClearConfirmOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-50 text-white shadow-2xl flex flex-col pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              <div className="text-center space-y-3 mb-6">
                <AlertTriangle size={36} className="mx-auto text-red-400" />
                <h3 className="text-lg font-black tracking-tight uppercase">Purge All Download Cache?</h3>
                <p className="text-xs text-white/45 leading-relaxed">
                  This action is irreversible. All offline pre-decoded songs and stream files will be erased from local storage layout.
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setClearConfirmOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-xs font-black py-3 rounded-xl transition-all"
                >
                  Abstain Cancel
                </button>
                <button 
                  onClick={handleClearAll}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-3 rounded-xl transition-all uppercase tracking-wider"
                >
                  Purge Storage
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 7. ADVANCED SETTINGS SUB-PAGE */
function AdvancedSubPage({
  bufferSize, setBufferSize, hwAccel, setHwAccel, cacheLimit, setCacheLimit, logs, clearLogs, onBack, addLog, onResetApp
}: {
  bufferSize: string; setBufferSize: (b: string) => void;
  hwAccel: boolean; setHwAccel: (h: boolean) => void;
  cacheLimit: number; setCacheLimit: (c: number) => void;
  logs: LogLine[];
  clearLogs: () => void;
  onBack: () => void;
  addLog: (type: 'INFO' | 'DEBUG' | 'WARN' | 'SUCCESS', m: string) => void;
  onResetApp: () => void;
}) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs terminal
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div>
      <SubPageHeader title="Developer Systems Core" onBack={onBack} />

      {/* Systems limit cache slider */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Decoder Memory Cache</h3>
      <div className="bg-brand-card border border-white/[0.04] p-5 rounded-2xl mb-6 space-y-4 shadow">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-white/80">Offline Cap limit</span>
          <span className="text-white/95 font-mono">{cacheLimit} GB Limit</span>
        </div>
        <div className="flex items-center gap-4 py-2">
          <input 
            type="range"
            min="1"
            max="10"
            value={cacheLimit}
            onChange={(e) => setCacheLimit(Number(e.target.value))}
            className="w-full h-[3px] bg-white/10 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-[5.5px] transition-all"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${((cacheLimit-1)/9)*100}%, rgba(255,255,255,0.1) ${((cacheLimit-1)/9)*100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </div>

      {/* Logic parameters */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] mb-3 ml-1">Engine parameters</h3>
      <div className="bg-brand-card border border-white/[0.04] px-4 rounded-2xl mb-6 divide-y divide-white/[0.04]">
        <div className="py-4 flex justify-between items-center">
          <div className="text-left">
            <p className="text-sm font-bold text-white/90">Buffer Frame Allocation</p>
            <p className="text-xs text-white/35 mt-0.5">Adjust decoder block read depth</p>
          </div>
          <select 
            value={bufferSize}
            onChange={(e) => setBufferSize(e.target.value)}
            className="bg-black/40 border border-white/5 focus:border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-white focus:outline-none select-custom h-8"
          >
            <option value="fast">Fast (4MB)</option>
            <option value="safe">Safe (32MB)</option>
            <option value="large">Aggressive (128MB)</option>
          </select>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm font-bold text-white/90">Hardware Acceleration</p>
            <p className="text-xs text-white/35 mt-0.5">Leverage device hardware DSP chips</p>
          </div>
          <button 
            type="button"
            onClick={() => setHwAccel(!hwAccel)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none ${
              hwAccel ? 'bg-white' : 'bg-white/10 border border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-full shadow-md transform duration-200 ${
              hwAccel ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/70'
            }`} />
          </button>
        </div>
      </div>

      {/* Live logging emulator console */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] ml-1 flex items-center gap-1.5">
          <Terminal size={14} /> Pipeline core logs
        </h3>
        <button 
          onClick={clearLogs}
          className="text-[10px] font-black uppercase text-white/40 hover:text-white px-2.5 py-1.5 border border-white/5 bg-white/5 rounded-md hover:bg-white/10 transition-colors"
        >
          Clear Console
        </button>
      </div>
      <div className="bg-neutral-950 font-mono text-[10px] p-4 rounded-2xl h-44 overflow-y-auto border border-white/5 flex flex-col space-y-1 shadow-inner scrollbar-thin scrollbar-thumb-white/10">
        {logs.length === 0 ? (
          <div className="text-neutral-500 italic h-full flex items-center justify-center">Console blank. Trigger actions to inject logs...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="leading-relaxed flex items-start gap-1">
              <span className="text-neutral-500 shrink-0 select-none">[{log.time}]</span>
              <span className={`font-black shrink-0 ${
                log.type === 'SUCCESS' ? 'text-emerald-400' : 
                log.type === 'WARN' ? 'text-red-400' : 
                log.type === 'DEBUG' ? 'text-blue-300' : 'text-neutral-300'
              }`}>
                {log.type}:
              </span>
              <span className="text-neutral-300 break-all">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Destruction resetting system */}
      <div className="mt-8 border-t border-white/[0.04] pt-6">
        <button 
          onClick={() => { setResetConfirmOpen(true); addLog('WARN', 'Critical reset prompt launched.'); }}
          className="w-full bg-red-600 border border-transparent text-white text-xs font-black py-3.5 rounded-xl transition-all uppercase tracking-wider h-11 flex items-center justify-center gap-1.5 shadow"
        >
          Reset Application State
        </button>
      </div>

      {/* Confirmation drawer overlay */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetConfirmOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-50 text-white shadow-2xl flex flex-col pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              <div className="text-center space-y-3 mb-6">
                <AlertTriangle size={36} className="mx-auto text-red-500" />
                <h3 className="text-lg font-black tracking-tight uppercase">Wipe all systems files?</h3>
                <p className="text-xs text-white/45 leading-relaxed">
                  This wipes all connected host servers, customized parameters, theme setups, language selections, offline audio cache, and restarts the engine from default files.
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-xs font-black py-3 rounded-xl transition-all"
                >
                  Cancel Escape
                </button>
                <button 
                  onClick={onResetApp}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-3 rounded-xl transition-all uppercase tracking-wider"
                >
                  Destroy Data
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
