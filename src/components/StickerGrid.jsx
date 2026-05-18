import React, { useState } from 'react';
import { CATEGORIES, ALL_VALID_CODES, SHINY_CODES } from '../lib/stickers';
import { Plus, Minus, Check, Search, ChevronLeft, Trophy, Beer, Star, Users } from 'lucide-react';
import { translations } from '../lib/translations';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-component for Flags/Logos to handle errors gracefully
const TeamIcon = ({ team, isSpecial }) => {
  const [hasError, setHasError] = useState(false);

  const getUrl = () => {
    if (team.id === 'fifa_world_cup') return '/fotos/fifa.svg';
    if (team.id === 'coca-cola') return '/fotos/coca.svg';
    return `https://flagcdn.com/w160/${team.flag}.png`;
  };

  if (hasError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-primary/10 rounded gap-1 p-2`}>
        {team.id === 'fifa_world_cup' ? <Trophy size={24} className="text-primary" /> :
          team.id === 'coca-cola' ? <Beer size={24} className="text-accent" /> :
            <span className="text-[10px] font-bold uppercase">{team.flag}</span>}
        <span className="text-[8px] font-bold opacity-50 truncate w-full text-center">{team.name}</span>
      </div>
    );
  }

  return (
    <img
      src={getUrl()}
      alt={team.name}
      className={`transition-opacity duration-300 ${isSpecial ? 'h-full w-auto object-contain' : 'w-full h-full object-cover'}`}
      onError={() => setHasError(true)}
    />
  );
};

function StickerGrid({ user, collection, onUpdate, lang = 'pt' }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const t = translations[lang];

  const toggleSticker = (number) => {
    const current = collection[number] || { status: 'none', repeated: 0 };
    const newStatus = current.status === 'collected' ? 'none' : 'collected';
    const newCollection = { ...collection, [number]: { ...current, status: newStatus } };
    onUpdate(newCollection);

    // Haptic Feedback (Vibration)
    if (newStatus === 'collected' && typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }

    // Celebration logic when completing a category
    if (newStatus === 'collected' && currentCategory) {
      const isComplete = currentCategory.stickers.every(code => 
        code === number ? true : collection[code]?.status === 'collected'
      );
      
      if (isComplete) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f43f5e', '#fbbf24'],
          zIndex: 999
        });
      }
    }
  };

  const updateRepeated = (number, delta) => {
    const current = collection[number] || { status: 'none', repeated: 0 };
    const val = Number(current.repeated || 0);
    const novoValor = Math.max(0, val + delta);
    const newCollection = { ...collection, [number]: { ...current, repeated: novoValor } };
    onUpdate(newCollection);
  };

  // Get unique groups and ensure Special ones are at the top
  const groups = [...new Set(CATEGORIES.map(c => c.group))].sort((a, b) => {
    if (a === 'FIFA World Cup') return -1;
    if (b === 'FIFA World Cup') return 1;
    if (a === 'Coca-Cola') return -1;
    if (b === 'Coca-Cola') return 1;
    return a.localeCompare(b);
  });

  const categoriesInGroup = selectedGroup ? CATEGORIES.filter(c => c.group === selectedGroup) : [];
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

  let filteredStickers = searchTerm
    ? ALL_VALID_CODES.filter(code => code.toLowerCase().includes(searchTerm.toLowerCase()))
    : currentCategory?.stickers || [];

  if (activeFilter !== 'all') {
    filteredStickers = filteredStickers.filter(code => {
      const data = collection[code] || { status: 'none', repeated: 0 };
      if (activeFilter === 'missing') return data.status !== 'collected';
      if (activeFilter === 'repeated') return data.repeated > 0;
      if (activeFilter === 'shiny') return SHINY_CODES.includes(code);
      return true;
    });
  }

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    const firstInGroup = CATEGORIES.find(c => c.group === group);
    if (firstInGroup) setSelectedCategory(firstInGroup.id);
  };

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('has_seen_onboarding');
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (dontShowAgain) {
      localStorage.setItem('has_seen_onboarding', 'true');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-sm p-8 text-center space-y-6 border-2 border-primary/30 relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-primary/30 animate-bounce">
                <Check size={40} strokeWidth={4} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-text-color uppercase tracking-tight">Instrução Tática</h2>
                <p className="text-xs text-text-dim leading-relaxed">
                  Para organizar sua campanha e conquistar o título, siga estas manobras:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                  <p className="text-[10px] font-medium text-text-color">
                    Toque no <b>número da figurinha</b> para colá-la no seu álbum.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                  <p className="text-[10px] font-medium text-text-color">
                    Use o <b>+ e -</b> na base da figurinha para gerenciar suas <b>repetidas</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-2">
                <button 
                  onClick={() => setDontShowAgain(!dontShowAgain)}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${dontShowAgain ? 'bg-primary border-primary' : 'border-white/20 hover:border-white/40'}`}>
                    {dontShowAgain && <Check size={14} strokeWidth={4} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-bold text-text-dim group-hover:text-text-color transition-colors">Não mostrar novamente</span>
                </button>
              </div>

              <button 
                onClick={handleCloseOnboarding}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all shadow-xl shadow-primary/20 hover:brightness-110"
              >
                Entendido, Professor!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Search */}
      <div className="flex gap-2">
        {selectedGroup && !searchTerm && (
          <button
            onClick={() => { setSelectedGroup(null); setSelectedCategory(null); }}
            className="p-3 bg-surface-color border border-surface-border rounded-xl text-text-dim hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          <input
            type="text"
            placeholder={t.search}
            className="w-full bg-surface-color border border-surface-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: 'all', label: t.filterAll },
          { id: 'missing', label: t.filterMissing },
          { id: 'repeated', label: t.filterRepeated },
          { id: 'shiny', label: t.filterShiny }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm ${
              activeFilter === f.id
                ? 'bg-primary border-primary text-white shadow-primary/20'
                : 'bg-surface-color border-surface-border text-text-dim hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Group View */}
      {!selectedGroup && !searchTerm && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
          {groups.map(group => {
            const teams = CATEGORIES.filter(c => c.group === group);
            const isSpecial = group === 'FIFA World Cup' || group === 'Coca-Cola';
            return (
              <button
                key={group}
                onClick={() => handleGroupSelect(group)}
                className="glass-card p-4 text-left hover:border-primary transition-all group active:scale-95"
              >
                <h3 className="text-[10px] font-black uppercase tracking-tighter mb-3 text-text-dim group-hover:text-primary">{group}</h3>
                <div className={`grid ${isSpecial ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                  {teams.map(team => (
                    <div key={team.id} className={`flex flex-col items-center gap-1 ${isSpecial ? 'h-24' : ''}`}>
                      <div className={`w-full flex items-center justify-center rounded-xl overflow-hidden ${isSpecial ? 'h-full' : 'aspect-[3/2] bg-white/5 p-0.5 shadow-inner'}`}>
                        <TeamIcon team={team} isSpecial={isSpecial} />
                      </div>
                      <span className="text-[8px] font-bold truncate w-full text-center text-text-dim">
                        {team.name}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Selection (Horizontal Flags Only) */}
      {selectedGroup && !searchTerm && categoriesInGroup.length > 1 && (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide border-b border-white/5 px-2 justify-center">
          {categoriesInGroup.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 w-12 h-8 rounded-lg overflow-hidden border-2 transition-all active:scale-95 shadow-md ${selectedCategory === cat.id
                ? 'border-primary scale-110 shadow-primary/20 z-10'
                : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
            >
              <TeamIcon team={cat} isSpecial={false} />
            </button>
          ))}
        </div>
      )}

      {/* Stickers Grid with Title */}
      {((selectedGroup && selectedCategory) || searchTerm) && (
        <div className="space-y-3">
          {!searchTerm && currentCategory && (
            <div className="flex items-center justify-center gap-3 px-1 animate-slide-up">
              <div className="w-8 h-6 rounded border border-white/10 overflow-hidden shadow-sm shrink-0">
                <TeamIcon team={currentCategory} isSpecial={false} />
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-text-color tracking-tight uppercase">
                  {currentCategory.name}
                </h2>
                <div className="flex items-center gap-1 font-black text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 shadow-inner">
                  <span>{currentCategory.stickers.filter(code => collection[code]?.status === 'collected').length}</span>
                  <span className="opacity-50 text-[10px]">/</span>
                  <span>{currentCategory.stickers.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 pb-10">
            {filteredStickers.map(code => {
              const data = collection[code] || { status: 'none', repeated: 0 };
              const isShiny = SHINY_CODES.includes(code);
              const isCollected = data.status === 'collected';

              return (
                <motion.div
                  key={code}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  initial={false}
                  animate={{ 
                    scale: isCollected ? 1.05 : 1,
                  }}
                  className={`relative aspect-square rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-pointer tactical-piece ${isCollected
                    ? 'bg-secondary border-white text-white shadow-lg shadow-secondary/20'
                    : 'bg-white/5 border-white/10 text-text-dim hover:border-white/30'
                    }`}
                  onClick={() => toggleSticker(code)}
                >
                  {isShiny && <div className="shiny-holographic-inner" />}
                  {isShiny && (
                    <div className="absolute top-0.75 left-1/2 -translate-x-1/2 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  {/^[A-Z]{3}13$/.test(code) && (
                    <div className="absolute top-0.75 left-1/2 -translate-x-1/2 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">
                      <Users size={10} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  
                  <span className="text-xs font-black">
                    {code}
                  </span>

                  <AnimatePresence>
                    {isCollected && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="bg-white text-secondary rounded-full p-0.5 mt-0.5 shadow-sm z-20"
                      >
                        <Check size={8} strokeWidth={5} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className="absolute -bottom-3 left-0 right-0 flex items-center justify-center gap-1 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateRepeated(code, -1); }} 
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-accent text-white shadow-md active:scale-90 transition-colors backdrop-blur-sm"
                    >
                      <Minus size={10} />
                    </button>
                    
                    <div className="bg-black/90 px-2 py-0.5 rounded-full border border-white/20 shadow-xl flex items-center gap-0.5">
                      <span className="text-[7px] text-white/50 font-black uppercase">x</span>
                      <span className="text-[10px] font-black text-white">{data.repeated || 0}</span>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); updateRepeated(code, 1); }} 
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary text-white shadow-md active:scale-90 transition-colors backdrop-blur-sm"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default StickerGrid;
