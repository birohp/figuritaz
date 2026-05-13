import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './lib/firebase';
import { signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { LayoutDashboard, Book, LogOut, User, Settings as SettingsIcon, X, Globe, Palette, MapPin, DollarSign, BarChart3, Award, Heart, Coffee, ExternalLink } from 'lucide-react';
import AdBanner from './components/AdBanner';
import Dashboard from './components/Dashboard';
import StickerGrid from './components/StickerGrid';
import Stats from './components/Stats';
import Achievements from './components/Achievements';
import { translations } from './lib/translations';

import { motion, AnimatePresence } from 'framer-motion';


function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authStatus, setAuthStatus] = useState("Iniciando...");
  
  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem('app_settings');
    return local ? JSON.parse(local) : { lang: 'pt', boardColor: '#064e3b', country: 'BR', packetPrice: 4.00 };
  });

  const [collection, setCollection] = useState(() => {
    const local = localStorage.getItem('sticker_collection');
    return local ? JSON.parse(local) : {};
  });

  const [packets, setPackets] = useState(() => {
    const local = localStorage.getItem('packets_count');
    return local ? parseInt(local) : 0;
  });

  const t = translations[settings.lang];

  // Apply Theme Variables
  useEffect(() => {
    const root = document.documentElement;
    const isLight = settings.boardColor === '#f8fafc';
    
    root.style.setProperty('--board-bg', settings.boardColor);
    root.style.setProperty('--text-main', isLight ? '#0f172a' : '#f8fafc');
    root.style.setProperty('--text-muted', isLight ? '#475569' : '#94a3b8');
    root.style.setProperty('--surface-bg', isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--surface-border', isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--grid-color', isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--marking-color', isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)');

    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('sticker_collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('packets_count', packets.toString());
  }, [packets]);

  // Auth Listener
  useEffect(() => {
    setAuthStatus("Sincronizando...");
    
    // Safety timeout: if it takes more than 5s, stop loading
    const timer = setTimeout(() => {
      setLoading(false);
      if (!user) setAuthStatus("Conexão lenta - Tente logar");
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timer);
      if (user) {
        setAuthStatus("Logado!");
        setUser(user);
      } else {
        setAuthStatus("Pronto para login");
        setUser(null);
      }
      setLoading(false);
    });

    // Handle redirect specifically
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setAuthStatus("Login mobile concluído!");
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Erro no redirect:", error);
        if (error.code !== 'auth/invalid-pending-token') {
          setAuthError(error.code);
          setAuthStatus("Erro: " + error.code);
        }
      });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Firebase Listener & Initial Sync
  useEffect(() => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    let initialLoad = true;
    
    const unsub = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Only update local state if data is different
        if (data.collection && initialLoad) {
          setCollection(data.collection);
          if (data.settings) setSettings(data.settings);
          if (data.packets !== undefined) setPackets(data.packets);
          initialLoad = false;
        }
      } else if (initialLoad) {
        // First time login ever! Upload what we have
        setDoc(userRef, {
          collection,
          settings,
          packets,
          updatedAt: new Date().toISOString()
        });
        initialLoad = false;
      }
    });
    return () => unsub();
  }, [user]);

  const updateCollection = async (newCollection) => {
    setCollection(newCollection);
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { collection: newCollection });
    } catch (e) {
      await setDoc(userRef, { collection: newCollection }, { merge: true });
    }
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { settings: newSettings });
    } catch (e) {
      await setDoc(userRef, { settings: newSettings }, { merge: true });
    }
  };

  const updatePackets = async (val) => {
    setPackets(val);
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { packets: val });
    } catch (e) {
      await setDoc(userRef, { packets: val }, { merge: true });
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    setAuthStatus("Configurando acesso...");
    
    try {
      // Force local persistence
      await setPersistence(auth, browserLocalPersistence);
      
      setAuthStatus("Iniciando login...");
      // Try popup first
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro no login:", error);
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        setAuthStatus("Redirecionando...");
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e) {
          setAuthError(e.code);
        }
      } else {
        // Log technical failure
        setAuthError(error.code);
      }
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <img 
          src="/pwa-192x192.png" 
          alt="FiguritaZ Logo" 
          className="w-32 h-32 mb-6 rounded-3xl shadow-2xl animate-bounce-slow border-2 border-surface-border"
        />
        <h1 className="text-5xl mb-4 text-text-color" style={{ fontFamily: "'Permanent Marker', cursive" }}>FiguritaZ</h1>
        <p className="text-text-dim mb-8 max-w-md text-sm">{t.welcome}</p>
        
        <button onClick={handleLogin} className="btn-primary text-lg px-8 py-4">
          <User size={20} />
          {t.login}
        </button>

        {authError && (
          <p className="mt-4 text-[10px] text-accent font-bold uppercase tracking-tighter opacity-80">
            Erro: {authError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="p-4 flex justify-between items-center glass-card m-4 mb-0 rounded-3xl">
        <div className="flex items-center gap-3">
          <img 
            src="/pwa-192x192.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-xl shadow-lg border border-surface-border"
          />
          <h1 className="text-2xl text-text-color" style={{ fontFamily: "'Permanent Marker', cursive" }}>FiguritaZ</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-text-dim hover:text-text-color transition-colors">
            <SettingsIcon size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-text-dim hover:text-accent transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                collection={collection} 
                lang={settings.lang} 
                packets={packets} 
                onUpdatePackets={updatePackets}
                settings={settings}
                onUpdateCollection={updateCollection}
              />
            )}
            {activeTab === 'collection' && (
              <StickerGrid 
                user={user} 
                collection={collection} 
                onUpdate={updateCollection} 
                lang={settings.lang}
              />
            )}
            {activeTab === 'stats' && (
              <Stats 
                collection={collection} 
                lang={settings.lang}
                settings={settings}
              />
            )}
            {activeTab === 'achievements' && (
              <Achievements 
                collection={collection} 
                lang={settings.lang}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AdBanner lang={settings.lang} />

      {/* Navigation Bar */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 px-4">
        <nav className="glass-card p-1.5 rounded-full flex gap-0.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={22} />}
            label={t.dashboard}
          />
          <NavButton 
            active={activeTab === 'collection'} 
            onClick={() => setActiveTab('collection')}
            icon={<Book size={22} />}
            label={t.album}
          />
          <NavButton 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 size={22} />}
            label={t.stats}
          />
          <NavButton 
            active={activeTab === 'achievements'} 
            onClick={() => setActiveTab('achievements')}
            icon={<Award size={22} />}
            label={t.achievements}
          />
        </nav>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-sm p-6 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto scrollbar-hide"
              style={{ backgroundColor: settings.boardColor === '#f8fafc' ? '#ffffff' : 'rgba(31, 41, 55, 0.95)' }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-text-color">
                  <SettingsIcon size={20} className="text-primary" />
                  {t.settings}
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-black/5 rounded-full text-text-color">
                  <X size={20} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} />
                  {t.language}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['pt', 'en', 'es'].map(l => (
                    <button
                      key={l}
                      onClick={() => updateSettings({ ...settings, lang: l })}
                      className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                        settings.lang === l 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-black/5 border-black/10 text-text-dim hover:bg-black/10'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} />
                  {t.country}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BR', name: t.brazil, flag: '🇧🇷' },
                    { id: 'MX', name: t.mexico, flag: '🇲🇽' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => updateSettings({ ...settings, country: c.id })}
                      className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                        settings.country === c.id 
                          ? 'bg-secondary border-secondary text-white' 
                          : 'bg-black/5 border-black/10 text-text-dim hover:bg-black/10'
                      }`}
                    >
                      <span>{c.flag}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packet Price */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={14} />
                  {t.packetPrice}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-dim">
                    {settings.country === 'BR' ? 'R$' : '$'}
                  </span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-12 pr-4 text-text-color font-bold focus:outline-none focus:border-primary transition-all"
                    value={settings.packetPrice}
                    onChange={(e) => updateSettings({ ...settings, packetPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Board Color Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                  <Palette size={14} />
                  {t.boardColor}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { color: '#064e3b', name: t.green },
                    { color: '#111827', name: t.black },
                    { color: '#1e3a8a', name: t.blue },
                    { color: '#374151', name: t.gray },
                    { color: '#f8fafc', name: t.white }
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => updateSettings({ ...settings, boardColor: c.color })}
                      className={`aspect-square rounded-full border-2 transition-all ${
                        settings.boardColor === c.color ? 'border-primary scale-110 shadow-lg' : 'border-black/10 opacity-60'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Support Project */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Heart size={18} fill="currentColor" />
                  <h3 className="font-black uppercase tracking-tight text-sm">Apoie o Projeto</h3>
                </div>
                <p className="text-[10px] font-medium text-text-dim leading-relaxed">
                  Gostou do FiguritaZ? Sua contribuição ajuda a manter o servidor online e a desenvolver novas funções táticas!
                </p>
                
                {settings.country === 'BR' ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pague via PIX</span>
                      <Coffee size={16} className="text-primary" />
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl break-all">
                      <code className="text-[10px] font-mono text-text-color">54e4b9ff-cff0-4aa3-be5b-cfa9bd4800c9</code>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('54e4b9ff-cff0-4aa3-be5b-cfa9bd4800c9');
                        alert('Chave PIX copiada!');
                      }}
                      className="w-full py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Copiar Chave PIX
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#004481]/10 border border-[#004481]/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#004481] uppercase tracking-widest">Transferencia CLABE (BBVA)</span>
                      <Coffee size={16} className="text-[#004481]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Tarcisio Fernandes</p>
                      <div className="bg-black/20 p-3 rounded-xl break-all">
                        <code className="text-[10px] font-mono text-text-color">012225015122793574</code>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('012225015122793574');
                        alert('CLABE copiada!');
                      }}
                      className="w-full py-2 bg-[#004481] text-white rounded-lg text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Copiar CLABE
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-black/5 py-3 rounded-xl font-bold hover:bg-black/10 transition-all border border-black/10 text-text-color"
              >
                {t.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 sm:px-6 py-3 rounded-full transition-all duration-500 overflow-hidden group ${
        active 
          ? 'text-white' 
          : 'text-text-dim hover:text-text-color'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="nav-bg"
          className="absolute inset-0 bg-gradient-to-r from-primary to-secondary z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 transition-transform duration-300 group-active:scale-90">
        {icon}
      </span>
      <AnimatePresence mode="popLayout">
        {active && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            className="relative z-10 font-bold text-sm tracking-wide"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default App;
