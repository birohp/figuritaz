import React, { useState } from 'react';
import { CATEGORIES, ALL_VALID_CODES } from '../lib/stickers';
import { Plus, Minus, Check, Search, ChevronLeft, Trophy, Beer } from 'lucide-react';
import { translations } from '../lib/translations';

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
  const t = translations[lang];

  const toggleSticker = (number) => {
    const current = collection[number] || { status: 'none', repeated: 0 };
    const newStatus = current.status === 'collected' ? 'none' : 'collected';
    const newCollection = { ...collection, [number]: { ...current, status: newStatus } };
    onUpdate(newCollection);
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
  
  const filteredStickers = searchTerm 
    ? ALL_VALID_CODES.filter(code => code.toLowerCase().includes(searchTerm.toLowerCase()))
    : currentCategory?.stickers || [];

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    const firstInGroup = CATEGORIES.find(c => c.group === group);
    if (firstInGroup) setSelectedCategory(firstInGroup.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
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

      {/* Group View */}
      {!selectedGroup && !searchTerm && (
        <div className="grid grid-cols-2 gap-4 pb-10">
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

      {/* Category Selection (Horizontal Flags Only) - Added py-2 to prevent clipping during scale */}
      {selectedGroup && !searchTerm && (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide border-b border-white/5 px-2 justify-center">
          {categoriesInGroup.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 w-12 h-8 rounded-lg overflow-hidden border-2 transition-all active:scale-95 shadow-md ${
                selectedCategory === cat.id 
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
          {!searchTerm && (
            <div className="flex items-center justify-center gap-3 px-1 animate-slide-up">
               <div className="w-8 h-6 rounded border border-white/10 overflow-hidden shadow-sm shrink-0">
                 <TeamIcon team={currentCategory} isSpecial={false} />
               </div>
               <h2 className="text-xl font-black text-text-color tracking-tight uppercase">
                 {currentCategory?.name}
               </h2>
               <div className="w-8 h-6 rounded border border-white/10 overflow-hidden shadow-sm shrink-0">
                 <TeamIcon team={currentCategory} isSpecial={false} />
               </div>
            </div>
          )}

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 pb-10">
            {filteredStickers.map(code => {
              const data = collection[code] || { status: 'none', repeated: 0 };
              return (
                <div 
                  key={code}
                  className={`relative aspect-square rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-pointer tactical-piece ${
                    data.status === 'collected' 
                      ? 'bg-secondary border-white text-white scale-110' 
                      : 'bg-surface-color border-white/10 text-text-dim hover:border-white/30'
                  }`}
                  onClick={() => toggleSticker(code)}
                >
                  <span className="text-xs font-black">{code}</span>
                  {data.status === 'collected' && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border border-white shadow-sm">
                      <Check size={8} />
                    </div>
                  )}
                  
                  <div 
                    className="absolute -bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={(e) => { e.stopPropagation(); updateRepeated(code, -1); }} className="w-5 h-5 flex items-center justify-center rounded-full bg-accent hover:brightness-125 text-white shadow-md active:scale-90"><Minus size={10}/></button>
                    <span className="text-[9px] font-black min-w-[14px] text-center bg-black/80 px-1 rounded-full text-white border border-white/20">{data.repeated || 0}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateRepeated(code, 1); }} className="w-5 h-5 flex items-center justify-center rounded-full bg-primary hover:brightness-125 text-white shadow-md active:scale-90"><Plus size={10}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default StickerGrid;
