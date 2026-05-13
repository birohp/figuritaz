import React, { useState } from 'react';
import { calculateStats, ALL_VALID_CODES, SHINY_CODES } from '../lib/stickers';
import { Trophy, Hash, Repeat, Info, Share2, Check, ClipboardList, Send, X, AlertCircle, ShoppingBag, Plus, Minus, TrendingUp, DollarSign, Star, Users as UsersIcon } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard({ collection, lang = 'pt', packets = 0, onUpdatePackets, settings, onUpdateCollection }) {
  const stats = calculateStats(collection);
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  
  // States for Modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isRepeatedOpen, setIsRepeatedOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const pricePerSticker = ((settings?.packetPrice || 0) / 7).toFixed(2);
  const totalInvested = (packets * (settings?.packetPrice || 0)).toFixed(2);
  const currencySymbol = settings?.country === 'BR' ? 'R$' : '$';

  const handleUpdateRepeated = (code, delta) => {
    const current = collection[code] || { status: 'none', repeated: 0 };
    const newVal = Math.max(0, (current.repeated || 0) + delta);
    const newCollection = {
      ...collection,
      [code]: { ...current, repeated: newVal }
    };
    onUpdateCollection(newCollection);
  };

  const repeatedStickers = Object.entries(collection)
    .filter(([_, data]) => data.repeated > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const getProgressMessage = (percent) => {
    const p = parseFloat(percent);
    if (lang === 'en') {
      if (p >= 100) return "Album complete! You're a tactical master!";
      if (p >= 90) return "Final stretch! Just a few more adjustments for the title!";
      if (p >= 75) return "Great game volume! The team is well-coordinated.";
      if (p >= 50) return "Midfield dominated! Keep moving forward.";
      if (p >= 25) return "First half concluded. Let's go for the comeback!";
      if (p > 0) return "The game has started! Organize your collection.";
      return "Team lined up! Start sticking your stickers.";
    }
    if (lang === 'es') {
      if (p >= 100) return "¡Álbum completo! ¡Eres un maestro táctico!";
      if (p >= 90) return "¡Recta final! ¡Solo unos pocos ajustes más para el título!";
      if (p >= 75) return "¡Gran volumen de juego! El equipo está compenetrado.";
      if (p >= 50) return "¡Medio campo dominado! Sigue avanzando.";
      if (p >= 25) return "Primer tiempo concluido. ¡Vamos por la remontada!";
      if (p > 0) return "¡El juego ha comenzado! Organiza tu colección.";
      return "¡Equipo alineado! Comienza a pegar tus figuritaZ.";
    }
    // Default PT
    if (p >= 100) return "Álbum completo! Você é um mestre tático!";
    if (p >= 90) return "Reta final! Só mais alguns ajustes para o título!";
    if (p >= 75) return "Ótimo volume de jogo! O time está entrosado.";
    if (p >= 50) return "Meio de campo dominado! Continue avançando.";
    if (p >= 25) return "Primeiro tempo concluído. Vamos para a virada!";
    if (p > 0) return "O jogo começou! Organize sua coleção.";
    return "Time escalado! Comece a colar suas figurinhas.";
  };

  const handleShare = async () => {
    const repetidas = Object.entries(collection)
      .filter(([_, data]) => data.repeated > 0)
      .map(([code, data]) => `${code}${data.repeated > 1 ? ` (x${data.repeated})` : ''}`)
      .join(', ');

    const shareText = repetidas || (lang === 'pt' ? 'Nenhuma repetida ainda.' : lang === 'en' ? 'No duplicates yet.' : 'Ninguna repetida aún.');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FiguritaZ',
          text: shareText,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAnalyze = () => {
    const foundCodes = pastedText.match(/[A-Z0-9]+/g) || [];
    const validFound = foundCodes
      .map(c => c.toUpperCase())
      .filter(c => ALL_VALID_CODES.includes(c));
    
    const uniqueFound = [...new Set(validFound)];

    if (uniqueFound.length === 0) {
      setAnalysis({ error: t.noneFound });
      return;
    }

    const iWant = uniqueFound.filter(code => !collection[code] || collection[code].status !== 'collected');
    const iHave = uniqueFound.filter(code => collection[code] && collection[code].status === 'collected');

    setAnalysis({ iWant, iHave });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tactical Stats Header */}
      <div className="glass-card p-6 border-l-4 border-l-primary">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-black text-text-color tracking-tight">{t.vision}</h2>
            <p className="text-text-dim text-xs font-bold uppercase tracking-widest">{getProgressMessage(stats.porcentagem)}</p>
          </div>
          <div className="bg-primary/20 p-3 rounded-full border border-primary/30">
            <Trophy className="text-primary" size={24} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-black text-text-color opacity-90">
            <span>{t.progress}</span>
            <span className="text-primary">{stats.porcentagem}%</span>
          </div>
          <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out relative"
              style={{ width: `${stats.porcentagem}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripe_1s_linear_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Tactical Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center tactical-piece shadow-md border-white/5">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-text-color">{stats.coladas}</span>
            <span className="text-sm font-bold text-text-dim">/ {stats.total}</span>
          </div>
          <span className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-1">{t.coladas}</span>
        </div>

        <button 
          onClick={() => setIsRepeatedOpen(true)}
          className="glass-card p-6 flex flex-col items-center justify-center text-center tactical-piece active:scale-95 transition-all group shadow-xl border-white/5"
        >
          <div className="relative">
            <span className="text-4xl font-black text-text-color">{stats.repetidas}</span>
          </div>
          <span className="text-[10px] font-black text-text-dim uppercase tracking-widest mt-1">{t.repetidas}</span>
          <span className="text-[9px] font-black text-accent uppercase tracking-tighter mt-1 opacity-70">(Gerenciar)</span>
        </button>
      </div>

      {/* Split Logistics & Investment Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Packets Card */}
        <div className="glass-card p-4 flex flex-col border-t-4 border-t-secondary/50 tactical-piece">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="text-secondary" size={18} />
            <h3 className="font-black text-[10px] text-text-color uppercase tracking-tight">{t.packets}</h3>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 bg-black/10 p-1 rounded-xl w-full justify-between">
              <button 
                onClick={() => onUpdatePackets(Math.max(0, packets - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/20 transition-colors text-text-dim"
              >
                <Minus size={14} />
              </button>
              <span className="text-xl font-black text-text-color">{packets}</span>
              <button 
                onClick={() => onUpdatePackets(packets + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-secondary"
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="text-[9px] text-text-dim font-bold uppercase">{t.totalStickers}: {packets * 7}</p>
          </div>
        </div>

        {/* Investment Card */}
        <div className="glass-card p-4 flex flex-col border-t-4 border-t-primary/50 tactical-piece justify-between">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-primary" size={18} />
            <h3 className="font-black text-[10px] text-text-color uppercase tracking-tight">{t.totalInvested}</h3>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-text-color">{currencySymbol} {totalInvested}</p>
            <p className="text-[9px] font-bold text-primary uppercase mt-1">
              {currencySymbol} {pricePerSticker} / fig
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Comparison Button */}
        <button 
          onClick={() => setIsCompareOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-secondary transition-all active:scale-[0.98] group"
        >
          <div className="p-3 rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
            <ClipboardList className="text-secondary" size={20} />
          </div>
          <span className="font-bold text-xs text-text-color uppercase tracking-tighter">
            {t.checkList}
          </span>
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-all active:scale-[0.98] group"
        >
          <div className={`p-3 rounded-full transition-colors ${copied ? 'bg-green-500/20' : 'bg-primary/20 group-hover:bg-primary/30'}`}>
            {copied ? <Check className="text-green-500" size={20} /> : <Share2 className="text-primary" size={20} />}
          </div>
          <span className="font-bold text-xs text-text-color uppercase tracking-tighter">
            {copied ? t.shareSuccess : t.share}
          </span>
        </button>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isCompareOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-lg p-6 space-y-6 max-h-[80vh] flex flex-col"
              style={{ backgroundColor: 'var(--board-bg)' }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-text-color">
                  <ClipboardList size={20} className="text-secondary" />
                  {t.checkList}
                </h2>
                <button onClick={() => { setIsCompareOpen(false); setAnalysis(null); setPastedText(''); }} className="p-1 hover:bg-white/10 rounded-full text-text-color">
                  <X size={20} />
                </button>
              </div>

              {!analysis ? (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  <textarea
                    className="flex-1 w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-secondary transition-all resize-none text-text-color placeholder:text-text-dim"
                    placeholder={t.pasteHere}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />
                  <button 
                    onClick={handleAnalyze}
                    className="w-full bg-secondary py-4 rounded-xl font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    {t.analyze}
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                  {analysis.error ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                      <AlertCircle className="text-accent" size={48} />
                      <p className="text-text-dim font-bold">{analysis.error}</p>
                      <button onClick={() => setAnalysis(null)} className="text-secondary font-bold text-sm underline">Tentar novamente</button>
                    </div>
                  ) : (
                    <>
                      {/* I Want (Missing) */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-widest">
                          <Check size={16} />
                          {t.iWant} ({analysis.iWant.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.iWant.map(code => (
                            <span key={code} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-black">
                              {code}
                            </span>
                          ))}
                          {analysis.iWant.length === 0 && <span className="text-text-dim text-xs italic">Nenhuma figurinha nova encontrada.</span>}
                        </div>
                      </div>

                      {/* I Have (Already Owned) */}
                      <div className="space-y-3 opacity-60">
                        <h3 className="text-sm font-black text-text-dim flex items-center gap-2 uppercase tracking-widest">
                          <X size={16} />
                          {t.iHave} ({analysis.iHave.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.iHave.map(code => (
                            <span key={code} className="bg-white/5 text-text-dim border border-white/10 px-3 py-1 rounded-full text-xs font-bold line-through">
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => setAnalysis(null)}
                        className="w-full bg-white/10 py-3 rounded-xl font-bold hover:bg-white/20 transition-all text-text-color"
                      >
                        Nova Análise
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repeated Stickers Modal */}
      <AnimatePresence>
        {isRepeatedOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-lg p-6 space-y-6 max-h-[80vh] flex flex-col"
              style={{ backgroundColor: 'var(--board-bg)' }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-text-color uppercase tracking-tight">
                  <Repeat size={20} className="text-accent" />
                  {t.repetidas}
                </h2>
                <button onClick={() => setIsRepeatedOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-text-color">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {repeatedStickers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <Repeat size={48} className="text-text-dim opacity-20" />
                    <p className="text-text-dim font-bold">{lang === 'pt' ? 'Nenhuma figurinha repetida' : lang === 'en' ? 'No duplicate stickers' : 'Sin figuritas repetidas'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 pb-6 px-1">
                    {repeatedStickers.map(([code, data]) => {
                      const isShiny = SHINY_CODES.includes(code);
                      return (
                        <div key={code} className="flex flex-col items-center gap-3">
                          <div
                            className={`relative aspect-square w-full rounded-full flex flex-col items-center justify-center border-2 transition-all tactical-piece ${data.status === 'collected'
                              ? 'bg-secondary border-white text-white'
                              : 'bg-surface-color border-white/10 text-text-dim'
                              }`}
                          >
                            {isShiny && (
                              <div className="absolute top-0.75 left-1/2 -translate-x-1/2 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">
                                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              </div>
                            )}
                            {/^[A-Z]{3}13$/.test(code) && (
                              <div className="absolute top-0.75 left-1/2 -translate-x-1/2 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">
                                <UsersIcon size={10} className="text-yellow-400 fill-yellow-400" />
                              </div>
                            )}
                            <span className="text-[10px] font-black">{code}</span>
                            
                            <div className="absolute -bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-30">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateRepeated(code, -1); }} 
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-accent hover:brightness-125 text-white shadow-md active:scale-90"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="text-[9px] font-black min-w-[14px] text-center bg-black/80 px-1 rounded-full text-white border border-white/20">{data.repeated || 0}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateRepeated(code, 1); }} 
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-primary hover:brightness-125 text-white shadow-md active:scale-90"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setIsRepeatedOpen(false)}
                className="w-full bg-white/5 py-4 rounded-xl font-black text-text-color hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
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

export default Dashboard;
