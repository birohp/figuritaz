import React, { useState, useEffect, useRef } from 'react';
import { Award, Footprints, User, Sparkles, Zap, Shield, Trophy, RefreshCcw, History, Flame, Target, Star, TrendingUp, Globe, Users } from 'lucide-react';
import { ACHIEVEMENTS, getAchievements, getAchievementProgress } from '../lib/stickers';
import { translations } from '../lib/translations';
import { motion, AnimatePresence } from 'framer-motion';

const IconMap = {
  Footprints, User, Award, Sparkles, Zap, Shield, Trophy, RefreshCcw, History, Flame, Target, Star, TrendingUp, Globe, UsersIcon: Users
};

function Achievements({ collection, lang = 'pt', unlockedAchievements: unlockedProp = [] }) {
  const t = translations[lang];
  const currentUnlocked = getAchievements(collection);
  const unlockedAchievements = new Set([...unlockedProp, ...currentUnlocked]);
  const progressMap = getAchievementProgress(collection);

  // Global device tilt state for mobile accelerometer support
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0, active: false });
  const [useSensor, setUseSensor] = useState(true);
  const [sensorPermission, setSensorPermission] = useState('default');

  // Silently request iOS permission on first tap anywhere inside page
  useEffect(() => {
    const requestiOSPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function' &&
        sensorPermission === 'default'
      ) {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          setSensorPermission(permissionState);
          if (permissionState === 'granted') {
            setUseSensor(true);
          }
        } catch (error) {
          console.log('Orientation permission failed or was not inside a user gesture:', error);
        }
      }
    };

    window.addEventListener('click', requestiOSPermission, { once: true });
    return () => {
      window.removeEventListener('click', requestiOSPermission);
    };
  }, [sensorPermission]);

  useEffect(() => {
    if (useSensor) {
      const handleOrientation = (e) => {
        const { beta, gamma } = e;
        if (beta === null || gamma === null) return;
        
        // Beta: front-to-back tilt (-180 to 180). Center around typical hand-held holding angle of 50 degrees
        const rawX = beta - 50; 
        // Gamma: left-to-right tilt (-90 to 90)
        const rawY = gamma;
        
        // Clamp values to prevent extreme rotations
        const clampedX = Math.max(-30, Math.min(30, rawX));
        const clampedY = Math.max(-30, Math.min(30, rawY));
        
        // Convert to smooth tilt angles (max 14 degrees)
        const scaleX = (clampedX / 30) * -14;
        const scaleY = (clampedY / 30) * 14;
        
        setDeviceTilt({ x: scaleX, y: scaleY, active: true });
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        setDeviceTilt({ x: 0, y: 0, active: false });
      };
    } else {
      setDeviceTilt({ x: 0, y: 0, active: false });
    }
  }, [useSensor]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-text-color tracking-tight uppercase">{t.achievements}</h1>
            <p className="text-text-dim text-sm font-medium leading-relaxed">
              {lang === 'pt' ? 'Sua jornada tática e conquistas como colecionador.' : lang === 'en' ? 'Your tactical journey and achievements as a collector.' : 'Tu viaje táctico y logros como coleccionador.'}
            </p>
          </div>
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

      {/* Grid of Interactive 3D Achievement Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedAchievements.has(ach.id);
          const Icon = IconMap[ach.icon] || IconMap.UsersIcon || Award;
          const prog = progressMap[ach.id] || { current: 0, target: 1 };
          const percent = Math.min(100, Math.floor((prog.current / prog.target) * 100));
          
          return (
            <AchievementCard 
              key={ach.id}
              ach={ach}
              isUnlocked={isUnlocked}
              Icon={Icon}
              prog={prog}
              percent={percent}
              t={t}
              lang={lang}
              deviceTilt={deviceTilt}
            />
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

// 3D Parallax and Glare Holographic Card Component
function AchievementCard({ ach, isUnlocked, Icon, prog, percent, t, lang, deviceTilt }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [mouseGlare, setMouseGlare] = useState({ x: 50, y: 50 });

  const maxTilt = 18; // Degrees of rotation

  // Compute tilt from mouse movement (Desktop)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const px = x / rect.width;
    const py = y / rect.height;
    
    // Rotate towards cursor
    const tiltX = -(py - 0.5) * maxTilt;
    const tiltY = (px - 0.5) * maxTilt;
    
    setMouseTilt({ x: tiltX, y: tiltY });
    setMouseGlare({ x: px * 100, y: py * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseTilt({ x: 0, y: 0 });
    setMouseGlare({ x: 50, y: 50 });
  };

  // Compute tilt from touch dragging (Mobile without gyroscope toggled)
  const handleTouchMove = (e) => {
    if (e.touches.length === 0 || !cardRef.current) return;
    const touch = e.touches[0];
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const px = Math.max(0, Math.min(1, x / rect.width));
    const py = Math.max(0, Math.min(1, y / rect.height));
    
    const tiltX = -(py - 0.5) * maxTilt;
    const tiltY = (px - 0.5) * maxTilt;
    
    setMouseTilt({ x: tiltX, y: tiltY });
    setMouseGlare({ x: px * 100, y: py * 100 });
  };

  // Combine interactions: Mouse overrides Device Gyroscope when actively hovering
  const activeTiltX = isHovered ? mouseTilt.x : (deviceTilt.active ? deviceTilt.x : 0);
  const activeTiltY = isHovered ? mouseTilt.y : (deviceTilt.active ? deviceTilt.y : 0);

  // Translate tilt rotation to glare position percentage (0 to 100)
  const activeGlareX = isHovered 
    ? mouseGlare.x 
    : (deviceTilt.active ? ((deviceTilt.y + 15) / 30) * 100 : 50);
  const activeGlareY = isHovered 
    ? mouseGlare.y 
    : (deviceTilt.active ? ((-deviceTilt.x + 15) / 30) * 100 : 50);

  // Dynamic Styles
  const perspectiveContainerStyle = {
    perspective: '1000px',
  };

  const cardTransformStyle = {
    transform: `rotateX(${activeTiltX}deg) rotateY(${activeTiltY}deg) scale(${isHovered ? 1.05 : 1})`,
    transformStyle: 'preserve-3d',
    transition: isHovered 
      ? 'transform 0.05s ease-out, box-shadow 0.05s ease-out' 
      : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease',
    willChange: 'transform',
  };

  return (
    <div style={perspectiveContainerStyle} className="w-full h-full">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
        style={cardTransformStyle}
        className={`glass-card p-6 flex flex-col h-full items-center text-center gap-4 transition-all duration-500 border-2 select-none overflow-hidden relative shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ${
          isUnlocked 
            ? 'border-yellow-400/40 bg-gradient-to-br from-yellow-950/20 via-black/45 to-yellow-900/35 shadow-yellow-500/5' 
            : 'opacity-65 border-white/5 bg-white/2'
        }`}
      >
        
        {/* Shiny Radial Sunlight Glare Layer (Z: 2px) */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: isHovered || deviceTilt.active ? 0.6 : 0,
            background: `radial-gradient(circle at ${activeGlareX}% ${activeGlareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 55%)`,
            transform: 'translateZ(2px)',
          }}
        />

        {/* Premium Holographic Rainbow Foil Layer for Unlocked Cards (Z: 1px) */}
        {isUnlocked && (
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none z-10 mix-blend-color-dodge transition-opacity duration-500"
            style={{
              opacity: isHovered ? 0.38 : (deviceTilt.active ? 0.22 : 0.08),
              background: `linear-gradient(115deg, transparent 0%, rgba(255, 0, 0, 0.4) 15%, rgba(255, 230, 0, 0.4) 30%, rgba(0, 255, 0, 0.4) 45%, rgba(0, 255, 255, 0.4) 60%, rgba(0, 0, 255, 0.4) 75%, rgba(255, 0, 255, 0.4) 90%, transparent 100%)`,
              backgroundSize: '200% 200%',
              backgroundPosition: `${activeGlareX}% ${activeGlareY}%`,
              transform: 'translateZ(1px)',
            }}
          />
        )}

        {/* Float Layer: Crest Medal (Z: 35px, preserve-3d) */}
        <div 
          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl relative transition-transform duration-300`}
          style={{ 
            transform: 'translateZ(35px)', 
            transformStyle: 'preserve-3d',
            background: isUnlocked 
              ? 'linear-gradient(to bottom right, #facc15, #eab308, #854d0e)' 
              : 'var(--surface-bg)',
            borderColor: isUnlocked ? '#fef08a' : 'rgba(255,255,255,0.1)'
          }}
        >
          {/* Inner Icon floats even further! (Z: 15px) */}
          <Icon 
            size={32} 
            className={isUnlocked ? 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]' : 'text-text-dim'} 
            style={{ transform: 'translateZ(15px)' }} 
          />
          {isUnlocked && (
            <>
              {/* Backing glow effect */}
              <div 
                className="absolute inset-0 rounded-full animate-ping-slow bg-yellow-400/20" 
                style={{ transform: 'translateZ(-5px)' }} 
              />
              {/* Mini-crest checkmark floats high! (Z: 25px) */}
              <div 
                className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg border border-yellow-200 flex items-center justify-center" 
                style={{ transform: 'translateZ(25px)' }}
              >
                <Award size={12} className="text-amber-600" />
              </div>
            </>
          )}
        </div>
        
        {/* Float Layer: Title and Description Texts (Z: 22px) */}
        <div className="space-y-1 w-full flex-1 flex flex-col justify-center" style={{ transform: 'translateZ(22px)' }}>
          <h3 className={`font-black uppercase tracking-tight text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] ${isUnlocked ? 'text-yellow-400' : 'text-text-dim'}`}>
            {ach.name}
          </h3>
          <p className="text-[10px] font-bold text-text-dim leading-tight">
            {ach.description}
          </p>
        </div>

        {/* Bottom Action/Status Layer (Z: 28px) */}
        <div className="w-full mt-auto" style={{ transform: 'translateZ(28px)' }}>
          {isUnlocked ? (
            <div 
              className="bg-yellow-400/20 text-yellow-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-400/30 shadow-[0_4px_12px_rgba(234,179,8,0.15)] inline-block"
            >
              {lang === 'pt' ? 'Desbloqueado' : lang === 'en' ? 'Unlocked' : 'Desbloqueado'}
            </div>
          ) : (
            <div className="space-y-1.5" style={{ transform: 'translateZ(5px)' }}>
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

      </div>
    </div>
  );
}

export default Achievements;
