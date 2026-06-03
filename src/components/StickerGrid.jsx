import React, { useState } from 'react';
import { CATEGORIES, ALL_VALID_CODES, SHINY_CODES } from '../lib/stickers';
import { Plus, Minus, Check, Search, ChevronLeft, Trophy, Beer, Star, Users, LayoutGrid, List } from 'lucide-react';
import { translations } from '../lib/translations';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-component for Flags/Logos to handle errors gracefully
const TeamIcon = ({ team, isSpecial, t }) => {
  const [hasError, setHasError] = useState(false);

  const getUrl = () => {
    if (team.id === 'fifa_world_cup') return '/fotos/fifa.svg';
    if (team.id === 'coca-cola') return '/fotos/coca.svg';
    return `https://flagcdn.com/w160/${team.flag}.png`;
  };

  const displayName = t?.countries?.[team.id] || team.name;

  if (hasError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-primary/10 rounded gap-1 p-2`}>
        {team.id === 'fifa_world_cup' ? <Trophy size={24} className="text-primary" /> :
          team.id === 'coca-cola' ? <Beer size={24} className="text-accent" /> :
            <span className="text-[10px] font-bold uppercase">{team.flag}</span>}
        <span className="text-[8px] font-bold opacity-50 truncate w-full text-center">{displayName}</span>
      </div>
    );
  }

  return (
    <img
      src={getUrl()}
      alt={displayName}
      className={`transition-opacity duration-300 ${isSpecial ? 'h-full w-auto object-contain' : 'absolute inset-0 w-full h-full object-cover'}`}
      onError={() => setHasError(true)}
    />
  );
};

function StickerGrid({ user, collection, onUpdate, lang = 'pt', settings = {} }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [colsCount, setColsCount] = useState(() => {
    const saved = localStorage.getItem('album_cols_count');
    return saved ? Number(saved) : 2;
  });
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
  const isExcludeCoca = settings?.excludeCoca === true;
  const filteredCategories = isExcludeCoca 
    ? CATEGORIES.filter(c => c.id !== 'coca-cola') 
    : CATEGORIES;

  const groups = [...new Set(filteredCategories.map(c => c.group))].sort((a, b) => {
    if (a === 'FIFA World Cup') return -1;
    if (b === 'FIFA World Cup') return 1;
    if (a === 'Coca-Cola') return -1;
    if (b === 'Coca-Cola') return 1;
    return a.localeCompare(b);
  });

  const categoriesInGroup = selectedGroup ? filteredCategories.filter(c => c.group === selectedGroup) : [];
  const currentCategory = filteredCategories.find(c => c.id === selectedCategory);

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
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header / Search */}
      <div className="flex gap-2 items-center">
        {selectedGroup && !searchTerm && (
          <button
            onClick={() => { setSelectedGroup(null); setSelectedCategory(null); }}
            className="p-3 bg-surface-color border border-surface-border rounded-xl text-text-dim hover:text-white transition-all active:scale-95 shrink-0"
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
        
        {/* Column Layout Toggle */}
        <button
          onClick={() => {
            const nextCols = colsCount === 1 ? 2 : 1;
            setColsCount(nextCols);
            localStorage.setItem('album_cols_count', nextCols);
          }}
          className="p-3 bg-surface-color border border-surface-border rounded-xl text-text-dim hover:text-white transition-all active:scale-95 shrink-0 flex items-center justify-center"
          title={colsCount === 1 ? t.changeTo2Cols : t.changeTo1Col}
        >
          {colsCount === 1 ? (
            <LayoutGrid size={20} className="text-primary animate-scale-in" />
          ) : (
            <List size={20} className="text-primary animate-scale-in" />
          )}
        </button>
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
            const colSpanClass = colsCount === 1
              ? (isSpecial ? 'col-span-1' : 'col-span-2 md:col-span-1')
              : 'col-span-1';
            return (
              <button
                key={group}
                onClick={() => handleGroupSelect(group)}
                className={`glass-card p-4 text-left hover:border-primary transition-all group active:scale-95 ${colSpanClass}`}
              >
                <h3 className="text-[10px] font-black uppercase tracking-tighter mb-3 text-text-dim group-hover:text-primary">
                  {group.startsWith('Grupo ') ? group.replace('Grupo ', (t.groupLabel || 'Grupo') + ' ') : group}
                </h3>
                <div className={`grid ${
                  isSpecial 
                    ? 'grid-cols-1' 
                    : (colsCount === 1 ? 'grid-cols-4' : 'grid-cols-2')
                } gap-2`}>
                  {teams.map(team => {
                    const isCompleted = team.stickers.every(code => collection[code]?.status === 'collected');
                    return (
                      <div key={team.id} className={`flex flex-col items-center gap-1 ${isSpecial ? 'h-24' : ''}`}>
                        <div className={`w-full flex items-center justify-center rounded-xl relative ${isSpecial ? 'h-full' : 'aspect-[3/2] bg-white/5 p-0.5 shadow-inner'} ${isCompleted ? 'border border-emerald-500/30 ring-1 ring-emerald-500/20' : ''}`}>
                          <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center relative">
                            <TeamIcon team={team} isSpecial={isSpecial} t={t} />
                          </div>
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white/20 shadow-md shadow-emerald-500/30 flex items-center justify-center z-10 animate-scale-in">
                              <Check size={8} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        {/* Hide country name on 1-column view to keep it extremely clean */}
                        {(colsCount === 2 || isSpecial) && (
                          <span className={`text-[8px] font-bold truncate w-full text-center ${isCompleted ? 'text-emerald-400 font-extrabold' : 'text-text-dim'}`}>
                            {t.countries?.[team.id] || team.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Selection (Horizontal Flags Only) */}
      {selectedGroup && !searchTerm && categoriesInGroup.length > 1 && (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide border-b border-white/5 px-2 justify-center">
          {categoriesInGroup.map(cat => {
            const isCompleted = cat.stickers.every(code => collection[code]?.status === 'collected');
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 w-12 h-8 rounded-lg border-2 transition-all active:scale-95 shadow-md relative ${selectedCategory === cat.id
                  ? 'border-primary scale-110 shadow-primary/20 z-10'
                  : isCompleted
                    ? 'border-emerald-500/50 opacity-90'
                    : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
              >
                <div className="w-full h-full rounded-md overflow-hidden flex items-center justify-center relative">
                  <TeamIcon team={cat} isSpecial={false} t={t} />
                </div>
                {isCompleted && (
                  <div className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-white/20 shadow-md shadow-emerald-500/30 flex items-center justify-center z-10 animate-scale-in">
                    <Check size={6} strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Stickers Grid with Title */}
      {((selectedGroup && selectedCategory) || searchTerm) && (
        <div className="space-y-3">
          {!searchTerm && currentCategory && (
            <div className="flex items-center justify-center gap-3 px-1 animate-slide-up">
              <div className="w-8 h-6 rounded border border-white/10 shadow-sm shrink-0 relative">
                <div className="w-full h-full rounded overflow-hidden flex items-center justify-center relative">
                  <TeamIcon team={currentCategory} isSpecial={false} t={t} />
                </div>
                {currentCategory.stickers.every(code => collection[code]?.status === 'collected') && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white/20 shadow-md shadow-emerald-500/30 flex items-center justify-center z-10 animate-scale-in">
                    <Check size={8} strokeWidth={4} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-text-color tracking-tight uppercase">
                  {t.countries?.[currentCategory.id] || currentCategory.name}
                </h2>
                <div className={`flex items-center gap-1 font-black text-xs px-2.5 py-1 rounded-lg border shadow-inner transition-all ${
                  currentCategory.stickers.every(code => collection[code]?.status === 'collected')
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5'
                    : 'text-primary bg-primary/10 border-primary/20'
                }`}>
                  <span>{currentCategory.stickers.filter(code => collection[code]?.status === 'collected').length}</span>
                  <span className="opacity-50 text-[10px]">/</span>
                  <span>{currentCategory.stickers.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className={`grid ${colsCount === 1 ? 'grid-cols-2' : 'grid-cols-3'} sm:grid-cols-4 lg:grid-cols-5 gap-4 pb-10`}>
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
