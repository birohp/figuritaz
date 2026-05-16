import React, { useState, useEffect, useRef } from 'react';
import { ACHIEVEMENTS, getAchievements } from '../lib/stickers';
import { Award, Footprints, User, Sparkles, Zap, Shield, Trophy, RefreshCcw, History, Flame, Target, Star, TrendingUp, Globe, Users, Share2, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

const IconMap = {
  Footprints, User, Award, Sparkles, Zap, Shield, Trophy, RefreshCcw, History, Flame, Target, Star, TrendingUp, Globe, UsersIcon: Users
};

const AchievementShare = ({ collection, lang = 'pt' }) => {
  const [newAchievement, setNewAchievement] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const unlocked = Array.from(getAchievements(collection));
    const seenJson = localStorage.getItem('seen_achievements');
    const seen = seenJson ? JSON.parse(seenJson) : [];

    // Find first achievement that is unlocked but not yet seen
    const fresh = unlocked.find(id => !seen.includes(id));

    if (fresh) {
      const ach = ACHIEVEMENTS.find(a => a.id === fresh);
      if (ach) {
        setNewAchievement(ach);
        // Mark as seen immediately to avoid double triggering
        localStorage.setItem('seen_achievements', JSON.stringify([...seen, fresh]));
      }
    }
  }, [collection]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#064e3b',
        scale: 2,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `conquista-${newAchievement.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#064e3b',
        scale: 2
      });
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'achievement.png', { type: 'image/png' })] })) {
          await navigator.share({
            files: [new File([blob], 'achievement.png', { type: 'image/png' })],
            title: 'Nova Conquista no FiguritaZ!',
            text: `Acabei de desbloquear a conquista "${newAchievement.name}" no FiguritaZ! 🏆`
          });
        } else {
          handleDownload();
        }
      });
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (!newAchievement) return null;

  const Icon = IconMap[newAchievement.icon] || Award;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-sm"
        >
          {/* Close Button */}
          <button 
            onClick={() => setNewAchievement(null)}
            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* The Card - This is what will be captured */}
          <div 
            ref={cardRef}
            className="glass-card p-8 flex flex-col items-center text-center gap-6 border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-400/10 to-transparent overflow-hidden"
            style={{ 
              backgroundImage: 'radial-gradient(circle at top right, rgba(251,191,36,0.1), transparent), radial-gradient(circle at bottom left, rgba(251,191,36,0.1), transparent)'
            }}
          >
            {/* Background Branding (Only visible on capture or subtle on UI) */}
            <div className="absolute top-4 left-4 opacity-20 pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">FiguritaZ</span>
            </div>

            <div className="relative mt-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 flex items-center justify-center border-8 border-yellow-200/30 shadow-[0_0_50px_rgba(251,191,36,0.4)]">
                <Icon size={56} className="text-white drop-shadow-lg" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border-2 border-dashed border-yellow-400/30 rounded-full"
              />
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em]">Conquista Desbloqueada</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                {newAchievement.name}
              </h2>
              <p className="text-sm text-yellow-100/70 font-medium px-4">
                {newAchievement.description}
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent my-2" />

            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Coleção Oficial</span>
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1">
                    <img src="/pwa-192x192.png" alt="Logo" className="w-full h-full object-contain" />
                 </div>
                 <span className="text-xs font-black text-white uppercase">FiguritaZ 2024</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              <Share2 size={20} />
              {lang === 'pt' ? 'COMPARTILHAR' : 'SHARE'}
            </button>
            <button 
              onClick={handleDownload}
              disabled={isSharing}
              className="bg-white/10 text-white p-4 rounded-2xl active:scale-95 transition-all border border-white/10 disabled:opacity-50"
            >
              <Download size={20} />
            </button>
          </div>
          
          <p className="mt-4 text-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
            {lang === 'pt' ? 'Toque fora para continuar colecionando' : 'Tap outside to continue collecting'}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AchievementShare;
