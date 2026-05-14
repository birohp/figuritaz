import { Award, Footprints, User, Sparkles, Zap, Shield, Trophy, RefreshCcw, History, Flame, Target, Star, TrendingUp, Globe, Users } from 'lucide-react';
import { ACHIEVEMENTS, getAchievements, getAchievementProgress } from '../lib/stickers';
import { translations } from '../lib/translations';
import { motion } from 'framer-motion';

const IconMap = {
  Footprints, User, Award, Sparkles, Zap, Shield, Trophy, RefreshCcw, History, Flame, Target, Star, TrendingUp, Globe, UsersIcon: Users
};

function Achievements({ collection, lang = 'pt' }) {
  const t = translations[lang];
  const unlockedAchievements = getAchievements(collection);
  const progressMap = getAchievementProgress(collection);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-text-color tracking-tight uppercase">{t.achievements}</h1>
          <p className="text-text-dim text-sm font-medium leading-relaxed">
            {lang === 'pt' ? 'Sua jornada tática e conquistas como colecionador.' : lang === 'en' ? 'Your tactical journey and achievements as a collector.' : 'Tu viaje táctico y logros como coleccionador.'}
          </p>
        </div>

        {/* Master Progress Bar */}
        <div className="glass-card p-6 border-2 border-primary/20 bg-primary/5 space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Trophy size={18} className="text-primary" />
              </div>
              <span className="text-sm font-black text-text-color uppercase tracking-tight">Progreso General</span>
            </div>
            <span className="text-lg font-black text-primary">
              {unlockedAchievements.size} / {ACHIEVEMENTS.length}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedAchievements.size / ACHIEVEMENTS.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-shimmer rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">
                Estatus de la Carrera
              </p>
              <p className="text-[10px] font-black text-text-color uppercase">
                {Math.floor((unlockedAchievements.size / ACHIEVEMENTS.length) * 100)}% Completado
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedAchievements.has(ach.id);
          const Icon = IconMap[ach.icon] || IconMap.UsersIcon || Award;
          const prog = progressMap[ach.id] || { current: 0, target: 1 };
          const percent = Math.min(100, Math.floor((prog.current / prog.target) * 100));
          
          return (
            <div 
              key={ach.id} 
              className={`glass-card p-6 flex flex-col items-center text-center gap-4 transition-all duration-500 border-2 ${
                isUnlocked 
                  ? 'border-yellow-400/30 bg-yellow-400/5' 
                  : 'opacity-60 border-white/5 bg-white/2'
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
              
              <div className="space-y-1 w-full">
                <h3 className={`font-black uppercase tracking-tight ${isUnlocked ? 'text-text-color' : 'text-text-dim'}`}>
                  {ach.name}
                </h3>
                <p className="text-[10px] font-bold text-text-dim leading-tight">
                  {ach.description}
                </p>
                
                {!isUnlocked && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-text-dim opacity-70">
                      <span>Progresso</span>
                      <span>{prog.isPercent ? `${prog.current}%` : prog.current} / {prog.isPercent ? `${prog.target}%` : prog.target}</span>
                    </div>
                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
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
