import React from 'react';
import { CATEGORIES } from '../lib/stickers';
import { translations } from '../lib/translations';
import { Trophy, Users, BarChart3, LayoutGrid, Star, Sparkles } from 'lucide-react';

function Stats({ collection, lang = 'pt' }) {
  const t = translations[lang];

  // Calculate stats per category (Individual Sections)
  const categoryStats = CATEGORIES.map(cat => {
    const total = cat.stickers.length;
    const collected = cat.stickers.filter(code => collection[code] && collection[code].status === 'collected').length;
    const percent = total > 0 ? (collected / total) * 100 : 0;
    return { ...cat, collected, total, percent };
  });

  // Calculate stats per group (Aggregate)
  const groupNames = [...new Set(CATEGORIES.map(c => c.group))];
  const groupStats = groupNames.map(groupName => {
    const catsInGroup = CATEGORIES.filter(c => c.group === groupName);
    const allStickers = catsInGroup.flatMap(c => c.stickers);
    const flags = catsInGroup.map(c => c.flag).filter(f => f && f !== 'fifa' && f !== 'coca');
    const total = allStickers.length;
    const collected = allStickers.filter(code => collection[code] && collection[code].status === 'collected').length;
    const percent = total > 0 ? (collected / total) * 100 : 0;
    return { name: groupName, collected, total, percent, flags };
  });

  // Filter 1: Actual Teams (Those in lettered groups like "Grupo A" to "Grupo L")
  const topTeams = categoryStats
    .filter(s => s.group.startsWith('Grupo') && s.collected > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  // Filter 2: Top 3 Groups (Only lettered groups "Grupo A" through "Grupo L")
  const topGroups = groupStats
    .filter(s => s.name.startsWith('Grupo') && s.collected > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  // Filter 3: Special Sections (Always show them)
  const specials = categoryStats
    .filter(s => !s.group.startsWith('Grupo'))
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Groups Ranking */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-text-color flex items-center gap-2 uppercase tracking-tight">
          <Users className="text-primary" size={18} />
          {t.topGroups}
        </h2>
        <div className="space-y-2">
          {topGroups.map(group => (
            <div key={group.name} className="glass-card py-2.5 px-3 flex items-center justify-between group hover:border-primary transition-all">
              <div className="flex items-center gap-3">
                {/* Group Flags (Perfect 2x2 Grid) */}
                <div className="grid grid-cols-2 grid-rows-2 w-10 h-8 rounded-lg overflow-hidden border border-surface-border bg-black/20 shrink-0">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-full bg-black/5 border-[0.5px] border-white/5 flex items-center justify-center">
                       {group.flags[i] ? (
                         <img 
                           src={`https://flagcdn.com/w80/${group.flags[i]}.png`} 
                           alt="flag" 
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <LayoutGrid size={6} className="text-text-dim opacity-20" />
                       )}
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-text-color text-[13px] uppercase tracking-tight leading-tight truncate">{group.name}</h3>
                    <span className="text-[12px] font-black text-primary shrink-0">{group.percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-44 h-1 bg-black/20 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${group.percent}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                {group.percent === 100 ? <CheckCircle size={18} className="text-green-500" /> : (
                  <div className="flex items-center gap-1 font-black">
                    <span className="text-[15px] text-text-color">{group.collected}</span>
                    <span className="text-[11px] text-text-dim opacity-50">/ {group.total}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Teams Ranking */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-text-color flex items-center gap-2 uppercase tracking-tight">
          <Trophy className="text-secondary" size={18} />
          {t.topTeams}
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {topTeams.map(team => (
            <div key={team.id} className="glass-card py-2.5 px-3 flex items-center justify-between group hover:border-secondary transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-8 rounded-lg bg-surface-color overflow-hidden flex items-center justify-center border border-surface-border shadow-inner shrink-0">
                   {team.flag && (
                     <img src={`https://flagcdn.com/w160/${team.flag}.png`} alt={team.name} className="w-full h-full object-cover" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-text-color text-[13px] leading-tight truncate">{team.name}</h3>
                    <span className="text-[12px] font-black text-secondary shrink-0">{team.percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-44 h-1 bg-black/20 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${team.percent}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                {team.percent === 100 ? <CheckCircle size={18} className="text-green-500" /> : (
                  <div className="flex items-center gap-1 font-black">
                    <span className="text-[15px] text-text-color">{team.collected}</span>
                    <span className="text-[11px] text-text-dim opacity-50">/ {team.total}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Sections Ranking */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-text-color flex items-center gap-2 uppercase tracking-tight">
          <Sparkles className="text-accent" size={18} />
          {t.specials}
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {specials.map(special => (
            <div key={special.id} className="glass-card py-2.5 px-3 flex items-center justify-between group hover:border-accent transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 shadow-inner overflow-hidden shrink-0">
                   {special.flag === 'fifa' ? (
                     <div className="w-full h-full bg-[#0054a6] flex items-center justify-center font-black text-[7px] text-white">FIFA</div>
                   ) : special.flag === 'coca' ? (
                     <div className="w-full h-full bg-[#f40009] flex items-center justify-center font-black text-[7px] text-white italic">COCA</div>
                   ) : (
                     <Star size={16} className="text-accent" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-text-color text-[13px] uppercase tracking-tight leading-tight truncate">{special.name}</h3>
                    <span className="text-[12px] font-black text-accent shrink-0">{special.percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-44 h-1 bg-black/20 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${special.percent}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                {special.percent === 100 ? <CheckCircle size={18} className="text-green-500" /> : (
                  <div className="flex items-center gap-1 font-black">
                    <span className="text-[15px] text-text-color">{special.collected}</span>
                    <span className="text-[11px] text-text-dim opacity-50">/ {special.total}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {topTeams.length === 0 && topGroups.length === 0 && specials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <BarChart3 size={48} className="text-text-dim opacity-20" />
          <p className="text-text-dim font-bold">Inicie sua coleção para ver estatísticas detalhadas.</p>
        </div>
      )}
    </div>
  );
}

const CheckCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default Stats;
