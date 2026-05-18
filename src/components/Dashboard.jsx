import React, { useState } from 'react';
import { calculateStats, ALL_VALID_CODES, SHINY_CODES, calculateCompletionEstimate, getAchievements, ACHIEVEMENTS } from '../lib/stickers';
import { Trophy, Hash, Repeat, Info, Share2, Check, ClipboardList, Send, X, AlertCircle, ShoppingBag, Plus, Minus, TrendingUp, DollarSign, Star, Users as UsersIcon, Calculator, Wallet, ExternalLink, Award, BarChart3, Download, LayoutGrid } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../lib/stickers';
import html2canvas from 'html2canvas';

function Dashboard({ 
  collection, 
  lang = 'pt', 
  packets = 0, 
  onUpdatePackets, 
  settings, 
  onUpdateCollection, 
  setActiveTab, 
  unlockedAchievements = [], 
  tradePartnerUid = null, 
  tradePartnerData = null, 
  onClearTrade = () => {}, 
  user = null 
}) {
  const stats = calculateStats(collection);
  const t = translations[lang];

  // Matchmaking Computation
  const partnerCollection = tradePartnerData?.collection || {};
  const partnerName = tradePartnerData?.settings?.userName || t.partnerName || 'Parceiro';
  
  const gives = ALL_VALID_CODES.filter(code => {
    const mySticker = collection[code];
    const partnerSticker = partnerCollection[code];
    return mySticker?.repeated > 0 && (!partnerSticker || partnerSticker.status === 'none');
  });

  const receives = ALL_VALID_CODES.filter(code => {
    const partnerSticker = partnerCollection[code];
    const mySticker = collection[code];
    return partnerSticker?.repeated > 0 && (!mySticker || mySticker.status === 'none');
  });

  const getTradeMatchMessage = () => {
    let msg = t.matchingTradeText || '';
    return msg
      .replace('{give}', gives.length.toString())
      .replace('{receive}', receives.length.toString());
  };
  const currentUnlocked = getAchievements(collection);
  const unlockedSet = new Set([...unlockedAchievements, ...currentUnlocked]);
  const [copied, setCopied] = useState(false);
  
  const estimate = calculateCompletionEstimate(stats.coladas, stats.total);
  const remainingCost = estimate.remaining * (settings?.packetPrice || 4.00);
  const totalCost = estimate.total * (settings?.packetPrice || 4.00);

  // States for Modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isRepeatedOpen, setIsRepeatedOpen] = useState(false);
  const [isTradeDetailsOpen, setIsTradeDetailsOpen] = useState(false);
  const [copiedTradeSummary, setCopiedTradeSummary] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedTradeLink, setCopiedTradeLink] = useState(false);
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

  const repeatedStickers = ALL_VALID_CODES
    .filter(code => collection[code]?.repeated > 0)
    .map(code => [code, collection[code]]);

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

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyTradeLink = async () => {
    if (!user) return;
    const tradeLink = `${window.location.origin}/?trade=${user.uid}`;
    try {
      await navigator.clipboard.writeText(tradeLink);
      setCopiedTradeLink(true);
      setTimeout(() => setCopiedTradeLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy trade link:", err);
    }
  };

  const handleCopyTextList = async () => {
    const repetidas = ALL_VALID_CODES
      .filter(code => collection[code]?.repeated > 0)
      .map(code => {
        const data = collection[code];
        return `${code}${data.repeated > 1 ? ` (x${data.repeated})` : ''}`;
      })
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

  const [analysisMode, setAnalysisMode] = useState('friend_repeated'); // or 'friend_wishlist'

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

    if (analysisMode === 'friend_repeated') {
      // Amigo mandou o que ele TEM. Eu vejo o que me falta.
      const iWant = uniqueFound.filter(code => !collection[code] || collection[code].status !== 'collected');
      const iHave = uniqueFound.filter(code => collection[code] && collection[code].status === 'collected');
      setAnalysis({ iWant, iHave });
    } else {
      // Amigo mandou o que ele PRECISA. Eu vejo o que eu tenho REPETIDA.
      const canGive = uniqueFound.filter(code => collection[code] && collection[code].repeated > 0);
      const cantGive = uniqueFound.filter(code => !collection[code] || collection[code].repeated === 0);
      setAnalysis({ canGive, cantGive });
    }
  };

  const handleShareWishlist = async () => {
    const missing = ALL_VALID_CODES
      .filter(code => !collection[code] || collection[code].status !== 'collected')
      .join(', ');

    const shareText = `${t.wishlistTitle}\n\n${missing || (lang === 'pt' ? 'Nenhuma! Álbum completo!' : 'None! Album complete!')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FiguritaZ - Minha Wishlist',
          text: shareText,
        });
      } catch (err) {
        console.log('Erro ao compartilhar wishlist:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopiedWishlist(true);
      setTimeout(() => setCopiedWishlist(false), 2000);
    }
  };

  const [copiedWishlist, setCopiedWishlist] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const summaryRef = React.useRef(null);

  const getTopTeam = () => {
    const teams = CATEGORIES.filter(c => c.group.startsWith('Grupo'));
    const teamStats = teams.map(cat => {
      const total = cat.stickers.length;
      const collected = cat.stickers.filter(code => collection[code] && collection[code].status === 'collected').length;
      return { ...cat, collected, total };
    });
    
    const completeTeams = teamStats.filter(t => t.collected === t.total);
    const sorted = teamStats.sort((a, b) => (b.collected / b.total) - (a.collected / a.total));
    
    return {
      best: sorted[0] || { name: '---', collected: 0, total: 0 },
      completeCount: completeTeams.length,
      totalTeams: teams.length
    };
  };

  const teamData = getTopTeam();

  const handleShareSummary = async (isDownload = false) => {
    if (!summaryRef.current) return;
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: settings.boardColor || '#064e3b',
        scale: 2,
        useCORS: true
      });
      
      if (isDownload) {
        const link = document.createElement('a');
        link.download = `meu-status-figuritaz.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        canvas.toBlob(async (blob) => {
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'status.png', { type: 'image/png' })] })) {
            await navigator.share({
              files: [new File([blob], 'status.png', { type: 'image/png' })],
              title: 'Meu Status no FiguritaZ!',
              text: `Confira meu progresso no FiguritaZ! Já completei ${stats.porcentagem}% do álbum! 🏆`
            });
          }
        });
      }
    } catch (err) {
      console.error('Error generating summary:', err);
    }
  };

  const handleCopyTradeSummary = async () => {
    const givesList = gives.join(', ') || (lang === 'pt' ? 'Nenhuma' : lang === 'en' ? 'None' : 'Ninguna');
    const receivesList = receives.join(', ') || (lang === 'pt' ? 'Nenhuma' : lang === 'en' ? 'None' : 'Ninguna');
    const summaryText = lang === 'pt'
      ? `🤝 Match Perfeito no FiguritaZ!\n\n🔹 Eu envio para ${partnerName}: ${givesList} (${gives.length} Fig.)\n🔸 ${partnerName} envia para mim: ${receivesList} (${receives.length} Fig.)\n\nGerado em figuritaz.web.app`
      : lang === 'en'
      ? `🤝 Perfect Swap on FiguritaZ!\n\n🔹 I give ${partnerName}: ${givesList} (${gives.length} stickers)\n🔸 ${partnerName} gives me: ${receivesList} (${receives.length} stickers)\n\nGenerated at figuritaz.web.app`
      : `🤝 ¡Match de Intercambio en FiguritaZ!\n\n🔹 Le envío a ${partnerName}: ${givesList} (${gives.length} Fig.)\n🔸 ${partnerName} me envía: ${receivesList} (${receives.length} Fig.)\n\nGenerado en figuritaz.web.app`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedTradeSummary(true);
      setTimeout(() => setCopiedTradeSummary(false), 2000);
    } catch (err) {
      console.error("Failed to copy trade summary:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Trade Partner Banners */}
      {tradePartnerUid && (
        <div className="glass-card p-5 border-l-4 border-l-secondary relative overflow-hidden group shadow-2xl animate-fade-in bg-gradient-to-r from-secondary/5 via-primary/5 to-transparent">
          {/* Holographic grid overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} 
          />
          
          <button 
            onClick={onClearTrade}
            className="absolute top-4 right-4 z-20 p-1 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 active:scale-95"
          >
            <X size={16} />
          </button>

          {!user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 p-2.5 rounded-2xl border border-secondary/30">
                  <UsersIcon className="text-secondary animate-pulse" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{t.tradeInvitation}</h3>
                  <p className="text-[11px] text-text-dim font-bold uppercase tracking-wide opacity-80">{t.loginToTrade}</p>
                </div>
              </div>
              <p className="text-xs text-text-dim leading-relaxed">
                {lang === 'pt' 
                  ? 'Você foi convidado para uma troca automática! Clique no ícone de engrenagem no topo direito para fazer login com o Google e descobrir o Match Perfeito instantaneamente.' 
                  : lang === 'en' 
                  ? 'You were invited to an automatic trade! Click the settings gear icon at the top right to log in with Google and reveal the Perfect Match instantly.' 
                  : '¡Fuiste invitado a un intercambio automático! Haz clic en el engranaje de configuración arriba a la derecha para iniciar sesión con Google y descubrir tu Match Perfecto.'}
              </p>
            </div>
          ) : !tradePartnerData ? (
            <div className="flex items-center gap-3 py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-secondary"></div>
              <span className="text-xs font-bold text-text-dim uppercase tracking-widest">Carregando Match de Trocas...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/20 p-2.5 rounded-2xl border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Repeat className="text-primary animate-pulse" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                      {t.perfectMatch || 'Swap Match!'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-text-color uppercase tracking-wider mt-1 truncate">
                    {partnerName}
                  </h3>
                  <p className="text-xs text-text-dim mt-0.5">
                    {getTradeMatchMessage()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={() => setIsTradeDetailsOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <ClipboardList size={12} />
                  {t.viewTradeDetails}
                </button>
                <button 
                  onClick={onClearTrade}
                  className="bg-white/5 hover:bg-white/10 text-text-dim font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all active:scale-95"
                >
                  {lang === 'pt' ? 'Ignorar' : lang === 'en' ? 'Dismiss' : 'Ignorar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Grid of Tactical Metrics & Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <span className="text-[9px] font-black text-text-dim uppercase tracking-tighter mt-1 opacity-70">(Clicar)</span>
        </button>

        {/* Comparison Button */}
        <button 
          onClick={() => setIsCompareOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-secondary transition-all active:scale-[0.98] group min-h-[110px]"
        >
          <div className="p-3 rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
            <ClipboardList className="text-secondary" size={20} />
          </div>
          <span className="font-black text-[11px] text-text-color uppercase tracking-tight text-center leading-tight">
            {t.checkList}
          </span>
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-all active:scale-[0.98] group min-h-[110px]"
        >
          <div className={`p-3 rounded-full transition-colors ${copied ? 'bg-green-500/20' : 'bg-primary/20 group-hover:bg-primary/30'}`}>
            {copied ? <Check className="text-green-500" size={20} /> : <Repeat className="text-primary" size={20} />}
          </div>
          <span className="font-black text-[11px] text-text-color uppercase tracking-tight text-center leading-tight">
            {copied ? t.shareSuccess : t.share}
          </span>
        </button>

        {/* Wishlist Button */}
        <button 
          onClick={handleShareWishlist}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-accent transition-all active:scale-[0.98] group min-h-[110px]"
        >
          <div className={`p-3 rounded-full transition-colors ${copiedWishlist ? 'bg-green-500/20' : 'bg-accent/20 group-hover:bg-accent/30'}`}>
            {copiedWishlist ? <Check className="text-green-500" size={20} /> : <Calculator className="text-accent" size={20} />}
          </div>
          <span className="font-black text-[11px] text-text-color uppercase tracking-tight text-center leading-tight">
            {copiedWishlist ? t.copySuccess : t.wishlist}
          </span>
        </button>

        {/* Album Summary Shortcut */}
        <button 
          onClick={() => setIsSummaryOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-yellow-400 transition-all active:scale-[0.98] group min-h-[110px]"
        >
          <div className="p-3 rounded-full bg-yellow-400/20 group-hover:bg-yellow-400/30 transition-colors">
            <BarChart3 className="text-yellow-400" size={20} />
          </div>
          <span className="font-black text-[11px] text-text-color uppercase tracking-tight text-center leading-tight">
            {t.summary}
          </span>
        </button>
      </div>

      {/* Unified Logistics & Estimates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Packets Card */}
        <div className="glass-card p-4 border-l-4 border-l-secondary relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <ShoppingBag size={48} className="text-secondary" />
          </div>
          
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{t.packets}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-text-color">{packets}</span>
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-tighter opacity-60">{t.opened}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
              <button 
                onClick={() => onUpdatePackets(Math.max(0, packets - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/20 active:bg-black/30 transition-all text-text-dim"
              >
                <Minus size={16} />
              </button>
              <button 
                onClick={() => onUpdatePackets(packets + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/20 hover:bg-secondary/30 active:scale-95 transition-all text-secondary"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest opacity-60">{t.toBuyEst}</span>
              <span className="text-[11px] font-black text-secondary">+{estimate.remaining} {t.packetsDim}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest opacity-60">{t.finalProjection}</span>
              <span className="text-[11px] font-black text-text-color">{packets + estimate.remaining} {t.packetsNormal}</span>
            </div>
          </div>
        </div>

        {/* Investment Card */}
        <div className="glass-card p-4 border-l-4 border-l-primary relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={48} className="text-primary" />
          </div>
          
          <div className="mb-3">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t.totalInvested}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-text-color">{currencySymbol} {totalInvested}</span>
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-tighter opacity-60">{t.spent}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest opacity-60">{t.toInvestEst}</span>
              <span className="text-[11px] font-black text-primary">+{currencySymbol} {remainingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest opacity-60">{t.finalTotalCost}</span>
              <span className="text-[11px] font-black text-text-color">{currencySymbol} {(packets * (settings?.packetPrice || 4.00) + remainingCost).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs font-black text-text-dim uppercase text-center tracking-widest opacity-60">
        {t.estimateHint}
      </p>

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
                  {/* Mode Selector */}
                  <div className="flex p-1 bg-black/20 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setAnalysisMode('friend_repeated')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${analysisMode === 'friend_repeated' ? 'bg-secondary text-white shadow-lg' : 'text-text-dim'}`}
                    >
                      {t.friendRepeated}
                    </button>
                    <button 
                      onClick={() => setAnalysisMode('friend_wishlist')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${analysisMode === 'friend_wishlist' ? 'bg-accent text-white shadow-lg' : 'text-text-dim'}`}
                    >
                      {t.friendWishlist}
                    </button>
                  </div>

                  <p className="text-[10px] text-text-dim font-bold uppercase tracking-tight text-center px-4">
                    {analysisMode === 'friend_repeated' ? t.friendRepeatedHint : t.friendWishlistHint}
                  </p>

                  <textarea
                    className="flex-1 w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-secondary transition-all resize-none text-text-color placeholder:text-text-dim"
                    placeholder={t.pasteHere}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />
                  <button 
                    onClick={handleAnalyze}
                    className={`w-full py-4 rounded-xl font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${analysisMode === 'friend_repeated' ? 'bg-secondary' : 'bg-accent'}`}
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
                      {/* Mode A: Friend's Duplicates */}
                      {analysisMode === 'friend_repeated' && (
                        <>
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
                        </>
                      )}

                      {/* Mode B: Friend's Wishlist */}
                      {analysisMode === 'friend_wishlist' && (
                        <>
                          <div className="space-y-3">
                            <h3 className="text-sm font-black text-accent flex items-center gap-2 uppercase tracking-widest">
                              <Trophy size={16} />
                              {t.canGive} ({analysis.canGive.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {analysis.canGive.map(code => (
                                <span key={code} className="bg-accent/20 text-accent border border-accent/30 px-3 py-1 rounded-full text-xs font-black">
                                  {code}
                                </span>
                              ))}
                              {analysis.canGive.length === 0 && <span className="text-text-dim text-xs italic">{t.noTradeMatches}</span>}
                            </div>
                          </div>

                          <div className="space-y-3 opacity-40">
                            <h3 className="text-sm font-black text-text-dim flex items-center gap-2 uppercase tracking-widest">
                              <X size={16} />
                              {t.cantGive} ({analysis.cantGive.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {analysis.cantGive.map(code => (
                                <span key={code} className="bg-white/5 text-text-dim border border-white/10 px-3 py-1 rounded-full text-xs font-bold">
                                  {code}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

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
                      const isCollected = data.status === 'collected';
                      return (
                        <div key={code} className="flex flex-col items-center gap-3">
                          <div
                            className={`relative aspect-square w-full rounded-full flex flex-col items-center justify-center border-2 transition-all tactical-piece ${isCollected
                              ? 'bg-secondary border-white text-white shadow-lg shadow-secondary/20'
                              : 'bg-white/5 border-white/10 text-text-dim'
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
                            
                            <span className="text-xs font-black">{code}</span>

                            {isCollected && (
                              <div className="bg-white text-secondary rounded-full p-0.5 mt-0.5 shadow-sm z-20">
                                <Check size={8} strokeWidth={5} />
                              </div>
                            )}
                            
                            <div className="absolute -bottom-3 left-0 right-0 flex items-center justify-center gap-1 z-30">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateRepeated(code, -1); }} 
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-accent text-white shadow-md active:scale-90 transition-colors backdrop-blur-sm"
                              >
                                <Minus size={10} />
                              </button>
                              
                              <div className="bg-black/90 px-2 py-0.5 rounded-full border border-white/20 shadow-xl flex items-center gap-0.5">
                                <span className="text-[7px] text-white/50 font-black uppercase">x</span>
                                <span className="text-[10px] font-black text-white">{data.repeated || 0}</span>
                              </div>

                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateRepeated(code, 1); }} 
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary text-white shadow-md active:scale-90 transition-colors backdrop-blur-sm"
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

      {/* Album Summary Modal */}
      <AnimatePresence>
        {isSummaryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSummaryOpen(false)}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md px-6 py-12 flex justify-center items-start cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm flex flex-col gap-6 cursor-default"
            >
              <div 
                ref={summaryRef}
                className="relative glass-card p-6 flex flex-col items-center text-center gap-4 overflow-hidden border-2 border-white/10"
                style={{ 
                  background: `linear-gradient(135deg, ${settings.boardColor || '#064e3b'} 0%, #022c22 100%)`,
                }}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setIsSummaryOpen(false)}
                  className="absolute top-4 right-4 z-20 p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 border border-white/5 active:scale-90"
                >
                  <X size={18} />
                </button>

                {/* Background Pattern (Football Grid) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} 
                />
                
                {/* Holographic Shine Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay animate-pulse"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 55%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'holographic-shine 3s infinite linear'
                  }}
                />

                {/* Branding */}
                <div className="relative z-10 flex flex-col items-center gap-1.5 mb-1">
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md scale-90">
                    <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center p-1 shadow-lg shadow-white/10">
                      <img src="/pwa-192x192.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">FiguritaZ</span>
                  </div>
                  <span className="text-[13px] font-black text-primary uppercase tracking-[0.5em] opacity-80 leading-none">FIFA WORLD CUP</span>
                </div>

                <div className="relative z-10 space-y-0">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] drop-shadow-lg leading-none">Progresso do Álbum</span>
                  <div className="relative inline-block">
                    <h2 className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                      {stats.porcentagem}%
                    </h2>
                    <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.porcentagem}%` }}
                        className="h-full bg-gradient-to-r from-primary via-secondary to-primary" 
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mt-2">
                  {/* Quadrinho 1: Coladas */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Check size={40} className="text-white" />
                    </div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{t.coladas}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-white">{stats.coladas}</p>
                      <p className="text-[13px] font-bold text-white/30">/ {stats.total}</p>
                    </div>
                  </div>

                  {/* Quadrinho 2: Seleção mais completa */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Trophy size={40} className="text-white" />
                    </div>
                    {teamData.completeCount > 0 ? (
                      <>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1 leading-tight">
                          {lang === 'pt' ? 'Seleções Completas' : 'Completed Teams'}
                        </p>
                        <p className="text-sm font-black text-white truncate leading-tight mt-1">Total</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <p className="text-2xl font-black text-white">{teamData.completeCount}</p>
                          <p className="text-[13px] font-bold text-white/30">/ {teamData.totalTeams}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1 leading-tight">{t.topTeam}</p>
                        <p className="text-sm font-black text-white truncate leading-tight mt-1">{teamData.best.name}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <p className="text-2xl font-black text-white">{teamData.best.collected}</p>
                          <p className="text-[13px] font-bold text-white/30">/ {teamData.best.total}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Quadrinho 3: Brilhantes */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Star size={40} className="text-white" />
                    </div>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">{t.shinyRank}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-white">{stats.coladasBrilhantes}</p>
                      <p className="text-[13px] font-bold text-white/30">/ {stats.totalBrilhantes}</p>
                    </div>
                  </div>

                  {/* Quadrinho 4: Repetidas */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Repeat size={40} className="text-white" />
                    </div>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1 opacity-50">{t.repetidas}</p>
                    <p className="text-2xl font-black text-white">{stats.repetidas}</p>
                  </div>

                  {/* Quadrinho 5: Conquistas */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award size={40} className="text-white" />
                    </div>
                    <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mb-1">{t.achievements}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-white">{unlockedSet.size}</p>
                      <p className="text-[13px] font-bold text-white/30">/ {ACHIEVEMENTS.length}</p>
                    </div>
                  </div>

                  {/* Quadrinho 6: FWC + Coca */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid size={40} className="text-white" />
                    </div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1 leading-tight">FWC + Coca</p>
                    {(() => {
                      const specials = CATEGORIES.filter(c => !c.group.startsWith('Grupo'));
                      const total = specials.flatMap(c => c.stickers).length;
                      const collected = specials.flatMap(c => c.stickers).filter(code => collection[code]?.status === 'collected').length;
                      return (
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-white">{collected}</p>
                          <p className="text-[13px] font-bold text-white/30">/ {total}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1 mt-1 pt-1 border-t border-white/10 w-full">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                    Crie o seu resumo em:
                  </p>
                  <p className="text-sm font-black text-white tracking-widest">
                    figuritaz.web.app
                  </p>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-br-full" />
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full" />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Match Details Modal */}
      <AnimatePresence>
        {isTradeDetailsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-lg p-6 space-y-6 max-h-[85vh] flex flex-col border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scrollbar-hide animate-fade-in"
              style={{ backgroundColor: 'var(--board-bg)' }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Repeat size={20} className="text-primary" />
                  <h2 className="text-xl font-black text-text-color uppercase tracking-tight">
                    {t.perfectMatch || 'Swap Match!'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsTradeDetailsOpen(false)} 
                  className="p-1 hover:bg-white/10 rounded-full text-text-color transition-colors active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Partner Header */}
              <div className="bg-black/25 px-4 py-3 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon size={16} className="text-secondary" />
                  <span className="text-[10px] text-text-dim font-black uppercase tracking-wider">{t.partnerName || 'Parceiro'}</span>
                </div>
                <span className="text-xs font-black text-text-color">{partnerName}</span>
              </div>

              {/* Gives & Receives Columns */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Column: Gives */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Check size={14} />
                      {t.youGive}
                    </h3>
                    {gives.length === 0 ? (
                      <p className="text-[11px] text-text-dim italic py-4">{t.cantGive}</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide">
                        {gives.map(code => (
                          <span key={code} className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.75 rounded-md text-[10px] font-black animate-scale-in">
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Receives */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col">
                    <h3 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Download size={14} />
                      {t.youReceive}
                    </h3>
                    {receives.length === 0 ? (
                      <p className="text-[11px] text-text-dim italic py-4">{t.noTradeMatches}</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide">
                        {receives.map(code => (
                          <span key={code} className="bg-secondary/20 text-secondary border border-secondary/20 px-2 py-0.75 rounded-md text-[10px] font-black animate-scale-in">
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={handleCopyTradeSummary}
                  className="w-full bg-primary hover:bg-primary/90 py-3 rounded-xl font-black text-[11px] text-white uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  {copiedTradeSummary ? (
                    <>
                      <Check size={14} />
                      {t.copySuccess || 'Copiado!'}
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      {lang === 'pt' ? 'Copiar Resumo da Troca 📱' : lang === 'en' ? 'Copy Swap Summary' : 'Copiar Resumen'}
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setIsTradeDetailsOpen(false)}
                  className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-black text-[11px] text-text-color uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Duplicates and Cloud Trade Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-sm p-6 space-y-6 max-h-[90vh] flex flex-col border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-y-auto scrollbar-hide animate-fade-in"
              style={{ backgroundColor: 'var(--board-bg)' }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Share2 size={20} className="text-primary" />
                  <h2 className="text-xl font-black text-text-color uppercase tracking-tight">
                    {lang === 'pt' ? 'Compartilhar' : lang === 'en' ? 'Share' : 'Compartir'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsShareModalOpen(false)} 
                  className="p-1 hover:bg-white/10 rounded-full text-text-color transition-colors active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cloud Trading Section */}
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col items-center text-center">
                  <div className="bg-secondary/20 p-2.5 rounded-full border border-secondary/30">
                    <Repeat className="text-secondary" size={20} />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">
                    {lang === 'pt' ? 'Troca Automática em Nuvem 🤝' : lang === 'en' ? 'Cloud Swap Link' : 'Enlace en la Nube'}
                  </h3>
                  
                  {!user ? (
                    <p className="text-[10px] text-text-dim leading-relaxed">
                      {lang === 'pt' 
                        ? 'Faça login com o Google para habilitar seu QR Code e Link de Troca em tempo real!' 
                        : lang === 'en' 
                        ? 'Sign in with Google to enable your custom QR Code and real-time Trade Link!' 
                        : '¡Inicia sesión con Google para activar tu QR Code y Enlace en tiempo real!'}
                    </p>
                  ) : (
                    <>
                      <p className="text-[10px] text-text-dim leading-relaxed max-w-[240px]">
                        {lang === 'pt' 
                          ? 'Seu amigo verá quais figurinhas vocês podem trocar de forma instantânea!' 
                          : lang === 'en' 
                          ? 'Your friend will instantly see which stickers you can swap!' 
                          : '¡Tu amigo verá al instante qué figuritas pueden intercambiar!'}
                      </p>

                      {/* QR Code Container */}
                      <div className="relative p-3 bg-white rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)] border-2 border-primary/20 scale-95 transition-transform hover:scale-100 duration-300">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/?trade=${user.uid}`)}`} 
                          alt="Trade QR Code" 
                          className="w-[150px] h-[150px]"
                        />
                      </div>

                      {/* Copy Link Button */}
                      <button 
                        onClick={handleCopyTradeLink}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        {copiedTradeLink ? (
                          <>
                            <Check size={12} />
                            {t.tradeLinkCopied}
                          </>
                        ) : (
                          <>
                            <ExternalLink size={12} />
                            {t.shareTradeLink}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Plain Text Section */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2.5">
                  <h4 className="text-[10px] font-black text-text-dim uppercase tracking-widest">
                    {lang === 'pt' ? 'Outras Opções' : lang === 'en' ? 'Other Options' : 'Otras Opciones'}
                  </h4>
                  <button 
                    onClick={async () => {
                      await handleCopyTextList();
                      setIsShareModalOpen(false);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-text-color font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all border border-white/5 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <ClipboardList size={12} className="text-primary" />
                    {lang === 'pt' ? 'Copiar Lista de Repetidas (Texto)' : lang === 'en' ? 'Copy Duplicates List (Text)' : 'Copy Duplicates List'}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="w-full bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-black text-[11px] text-text-dim uppercase tracking-widest transition-all active:scale-[0.98]"
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
