import React from 'react';
import { Award, Footprints, User, Sparkles, Zap, Shield, Trophy, RefreshCcw } from 'lucide-react';
import { ACHIEVEMENTS, getAchievements } from '../lib/stickers';
import { translations } from '../lib/translations';

const IconMap = {
  Footprints, User, Award, Sparkles, Zap, Shield, Trophy, RefreshCcw
};

function Achievements({ collection, lang = 'pt' }) {
  const t = translations[lang];
  const unlockedAchievements = getAchievements(collection);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-text-color tracking-tight uppercase">{t.achievements}</h1>
        <p className="text-text-dim text-sm font-medium leading-relaxed">
          {lang === 'pt' ? 'Sua jornada tática e conquistas como colecionador.' : lang === 'en' ? 'Your tactical journey and achievements as a collector.' : 'Tu viaje táctico y logros como coleccionador.'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedAchievements.has(ach.id);
          const Icon = IconMap[ach.icon] || Award;
          
          return (
            <div 
              key={ach.id} 
              className={`glass-card p-6 flex flex-col items-center text-center gap-4 transition-all duration-500 border-2 ${
                isUnlocked 
                  ? 'border-yellow-400/30 bg-yellow-400/5' 
                  : 'opacity-40 grayscale blur-[0.5px] border-white/5 bg-white/2'
              }`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl relative ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 border-yellow-200 shadow-yellow-500/20' 
                  : 'bg-surface-color border-white/10'
              }`}>
                <Icon size={32} className={isUnlocked ? 'text-white' : 'text-text-dim'} />
                {isUnlocked && (
                  <>
                    <div className="absolute inset-0 rounded-full animate-ping-slow bg-yellow-400/20" />
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg border border-yellow-200">
                      <Award size={12} className="text-amber-600" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className={`font-black uppercase tracking-tight ${isUnlocked ? 'text-text-color' : 'text-text-dim'}`}>
                  {ach.name}
                </h3>
                <p className="text-[10px] font-bold text-text-dim leading-tight">
                  {ach.description}
                </p>
              </div>

              {isUnlocked && (
                <div className="mt-2 bg-yellow-400/20 text-yellow-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-400/30">
                  {lang === 'pt' ? 'Desbloqueado' : lang === 'en' ? 'Unlocked' : 'Desbloqueado'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unlockedAchievements.size === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Award size={64} className="text-text-dim opacity-20" />
          <p className="text-text-dim font-bold max-w-[200px]">
            {lang === 'pt' ? 'Comece sua coleção para ganhar suas primeiras medalhas!' : lang === 'en' ? 'Start your collection to earn your first medals!' : '¡Comienza tu colección para ganar tus primeras medallas!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Achievements;
