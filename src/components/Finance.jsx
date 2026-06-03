import React, { useState } from 'react';
import { calculateStats } from '../lib/stickers';
import { translations } from '../lib/translations';
import { ShoppingBag, Minus, Plus, TrendingUp, Calculator, DollarSign, Info, Landmark, Repeat } from 'lucide-react';

function Finance({ collection, lang = 'pt', packets = 0, onUpdatePackets, settings }) {
  const stats = calculateStats(collection, settings);
  const t = translations[lang];

  const [financeStrategy, setFinanceStrategy] = useState('coop');
  const [financeGroupSize, setFinanceGroupSize] = useState(5);

  const getScientificEstimate = () => {
    const N = stats.total || 994;
    const coladas = stats.coladas;
    const packetPrice = settings?.packetPrice || 4.00;
    const stickersPerPack = 7; // 7 stickers per pack
    
    let remainingPacks = 0;
    let directCost = 0;
    
    // 1. Lone Collector Strategy (CCP 100% completion)
    let harmonicCCP = 0;
    const missing = N - coladas;
    for (let i = 1; i <= missing; i++) {
      harmonicCCP += 1 / i;
    }
    const expectedPacksCCP = Math.ceil((N * harmonicCCP) / stickersPerPack);
    
    if (financeStrategy === 'ccp') {
      remainingPacks = expectedPacksCCP;
    } 
    // 2. Cooperative Strategy (Group size K)
    else {
      const expectedTotalStickers = N * (1 + (Math.log(N) - 1.2) / financeGroupSize);
      const totalStickersBought = coladas + stats.repetidas;
      remainingPacks = Math.max(0, Math.ceil((expectedTotalStickers - totalStickersBought) / stickersPerPack));
    }
    
    const remainingPacksCost = remainingPacks * packetPrice;
    const remainingCost = remainingPacksCost + directCost;
    
    const ccpRemainingCost = expectedPacksCCP * packetPrice;
    const savings = Math.max(0, ccpRemainingCost - remainingCost);
    
    return {
      remainingPacks,
      remainingCost,
      savings,
      totalCost: (packets * packetPrice) + remainingCost
    };
  };

  const sciEstimate = getScientificEstimate();
  const remainingCost = sciEstimate.remainingCost;
  const totalCost = sciEstimate.totalCost;
  const remainingPacks = sciEstimate.remainingPacks;
  const savings = sciEstimate.savings;

  const totalInvested = (packets * (settings?.packetPrice || 0)).toFixed(2);
  const currencySymbol = settings?.country === 'BR' ? 'R$' : '$';

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Finance Header */}
      <div className="glass-card p-6 border-l-4 border-l-secondary">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-text-color tracking-tight uppercase">
              {lang === 'pt' ? 'Painel Financeiro' : lang === 'es' ? 'Panel Financiero' : 'Financial Panel'}
            </h2>
            <p className="text-text-dim text-xs font-bold uppercase tracking-widest mt-1">
              {lang === 'pt' ? 'Planejamento e Orçamento do Álbum' : lang === 'es' ? 'Planificación y Presupuesto' : 'Planning and Budgeting'}
            </p>
          </div>
          <div className="bg-secondary/20 p-3 rounded-full border border-secondary/30">
            <Landmark className="text-secondary" size={24} />
          </div>
        </div>
      </div>

      {/* Grid of Logistics & Estimates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Packets Card */}
        <div className="glass-card p-5 border-l-4 border-l-secondary relative overflow-hidden group shadow-lg">
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
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/20 active:bg-black/30 transition-all text-text-dim font-black"
              >
                <Minus size={16} />
              </button>
              <button 
                onClick={() => onUpdatePackets(packets + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/20 hover:bg-secondary/30 active:scale-95 transition-all text-secondary font-black"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest opacity-60">{t.toBuyEst}</span>
              <span className="text-[11px] font-black text-secondary">+{remainingPacks} {t.packetsDim}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest opacity-60">{t.finalProjection}</span>
              <span className="text-[11px] font-black text-text-color">{packets + remainingPacks} {t.packetsNormal}</span>
            </div>
          </div>
        </div>

        {/* Investment Card */}
        <div className="glass-card p-5 border-l-4 border-l-primary relative overflow-hidden group shadow-lg">
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
              <span className="text-[11px] font-black text-text-color">{currencySymbol} {totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swap & Gift Balance Analysis */}
      {(() => {
        const stickersPerPack = 7;
        const compradas = packets * stickersPerPack;
        const totalInventario = stats.coladas + stats.repetidas;
        const diferenca = totalInventario - compradas;
        const packetPrice = settings?.packetPrice || 4.00;
        const totalInvestedNum = packets * packetPrice;
        
        const precoNominal = packetPrice / stickersPerPack;
        const precoEfetivo = totalInventario > 0 ? totalInvestedNum / totalInventario : 0;
        
        let eficienciaLabel = "";
        let eficienciaColorClass = "text-text-dim";
        
        if (totalInventario > 0 && packets > 0) {
          const diffPct = ((precoNominal - precoEfetivo) / precoNominal) * 100;
          if (diffPct > 0.01) {
            eficienciaLabel = lang === 'pt' ? `Economia de ${diffPct.toFixed(1)}% por fig.` : lang === 'es' ? `Ahorro de ${diffPct.toFixed(1)}% por fig.` : `${diffPct.toFixed(1)}% savings per sticker`;
            eficienciaColorClass = "text-primary";
          } else if (diffPct < -0.01) {
            eficienciaLabel = lang === 'pt' ? `Custo +${Math.abs(diffPct).toFixed(1)}% por fig.` : lang === 'es' ? `Costo +${Math.abs(diffPct).toFixed(1)}% por fig.` : `Cost +${Math.abs(diffPct).toFixed(1)}% per sticker`;
            eficienciaColorClass = "text-accent";
          } else {
            eficienciaLabel = lang === 'pt' ? 'Custo padrão equilibrado' : lang === 'es' ? 'Costo estándar equilibrado' : 'Balanced standard cost';
            eficienciaColorClass = "text-text-dim";
          }
        } else {
          eficienciaLabel = lang === 'pt' ? 'Sem dados de compra' : lang === 'es' ? 'Sin datos de compra' : 'No purchase data';
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sticker Balance Card */}
            <div className="glass-card p-5 border border-white/5 relative overflow-hidden group shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-black text-text-color uppercase tracking-widest flex items-center gap-2">
                    <Repeat size={14} className="text-secondary" />
                    {lang === 'pt' ? 'Balanço de Figurinhas' : lang === 'es' ? 'Balance de Figurinhas' : 'Sticker Balance'}
                  </h3>
                  <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mt-0.5">
                    {lang === 'pt' ? 'Comparativo de Pacotes vs Coleção Real' : lang === 'es' ? 'Paquetes vs Colección Real' : 'Packs bought vs Real Inventory'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] font-black text-text-dim uppercase tracking-wider block">{lang === 'pt' ? 'Compradas (Pacotes)' : lang === 'es' ? 'Compradas (Paquetes)' : 'Purchased (Packs)'}</span>
                  <span className="text-lg font-black text-white">{compradas}</span>
                  <span className="text-[8px] text-text-dim block mt-0.5">{packets} pac. x 7 fig.</span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] font-black text-text-dim uppercase tracking-wider block">{lang === 'pt' ? 'Total Atual (Coleção)' : lang === 'es' ? 'Total Actual (Colección)' : 'Total Current (Inventory)'}</span>
                  <span className="text-lg font-black text-white">{totalInventario}</span>
                  <span className="text-[8px] text-text-dim block mt-0.5">{stats.coladas} col. + {stats.repetidas} rep.</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                diferenca > 0 
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : diferenca < 0 
                    ? 'bg-accent/10 border-accent/20 text-accent' 
                    : 'bg-white/5 border-white/10 text-text-dim'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {lang === 'pt' ? 'Saldo de Trocas / Brindes:' : lang === 'es' ? 'Saldo de Intercambio / Regalos:' : 'Swap & Gift Balance:'}
                </span>
                <span className="text-sm font-black">
                  {diferenca > 0 ? `+${diferenca}` : diferenca} {lang === 'pt' ? 'figurinhas' : lang === 'es' ? 'figuras' : 'stickers'}
                </span>
              </div>
            </div>

            {/* Cost Efficiency Card */}
            <div className="glass-card p-5 border border-white/5 relative overflow-hidden group shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-black text-text-color uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} className="text-primary" />
                    {lang === 'pt' ? 'Eficiência de Custo' : lang === 'es' ? 'Eficiencia de Costo' : 'Cost Efficiency'}
                  </h3>
                  <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mt-0.5">
                    {lang === 'pt' ? 'Custo unitário real vs nominal por figurinha' : lang === 'es' ? 'Costo unitario real vs nominal' : 'Real vs Nominal cost per sticker'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] font-black text-text-dim uppercase tracking-wider block">{lang === 'pt' ? 'Custo Nominal' : lang === 'es' ? 'Costo Nominal' : 'Nominal Cost'}</span>
                  <span className="text-lg font-black text-white">{currencySymbol} {precoNominal.toFixed(2)}</span>
                  <span className="text-[8px] text-text-dim block mt-0.5">{lang === 'pt' ? 'Preço por fig. no pacotinho' : lang === 'es' ? 'Precio por fig. en el paquete' : 'Price per sticker in pack'}</span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] font-black text-text-dim uppercase tracking-wider block">{lang === 'pt' ? 'Custo Real Efetivo' : lang === 'es' ? 'Costo Real Efectivo' : 'Real Effective Cost'}</span>
                  <span className={`text-lg font-black ${eficienciaColorClass}`}>{currencySymbol} {precoEfetivo.toFixed(2)}</span>
                  <span className="text-[8px] text-text-dim block mt-0.5">{lang === 'pt' ? 'Custo médio na coleção' : lang === 'es' ? 'Costo promedio' : 'Average cost in collection'}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between bg-white/5 border-white/10 ${eficienciaColorClass}`}>
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {lang === 'pt' ? 'Resultado:' : lang === 'es' ? 'Resultado:' : 'Performance:'}
                </span>
                <span className="text-xs font-black uppercase tracking-wider">
                  {eficienciaLabel}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Central de Economia Tática (Scientific Financial Simulator) */}
      <div className="glass-card p-6 border border-white/5 relative overflow-hidden group shadow-lg bg-gradient-to-b from-white/5 to-transparent rounded-3xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-black text-text-color uppercase tracking-wider flex items-center gap-2">
              <Calculator className="text-primary animate-pulse" size={16} />
              {t.scientificFinanceTitle}
            </h3>
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">
              {t.scientificFinanceSubtitle}
            </p>
          </div>
        </div>

        {/* Strategy Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-2xl border border-white/5 mb-4">
          <button
            onClick={() => setFinanceStrategy('ccp')}
            className={`py-2.5 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              financeStrategy === 'ccp' ? 'bg-primary text-white shadow-md font-bold' : 'text-text-dim hover:text-text-color'
            }`}
          >
            {t.strategyCCP}
          </button>
          <button
            onClick={() => setFinanceStrategy('coop')}
            className={`py-2.5 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              financeStrategy === 'coop' ? 'bg-secondary text-white shadow-md font-bold' : 'text-text-dim hover:text-text-color'
            }`}
          >
            {t.strategyCoop}
          </button>
        </div>

        {/* Dynamic Controls based on selected Strategy */}
        <div className="mb-4">
          {financeStrategy === 'coop' && (
            <div className="flex items-center justify-between p-3.5 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[11px] font-black text-text-dim uppercase tracking-wider">
                {t.groupSize}:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFinanceGroupSize(prev => Math.max(2, prev - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-text-color font-bold text-sm"
                >
                  -
                </button>
                <span className="text-xs font-black text-text-color min-w-[80px] text-center">
                  {financeGroupSize} {t.people}
                </span>
                <button
                  onClick={() => setFinanceGroupSize(prev => Math.min(10, prev + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-text-color font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scientific Explanation block */}
        <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex gap-3 items-start mb-4">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-dim font-bold leading-normal uppercase">
            {financeStrategy === 'ccp' && t.ccpExplanation}
            {financeStrategy === 'coop' && t.coopExplanation}
          </p>
        </div>

        {/* Savings Metric (If any) */}
        {financeStrategy !== 'ccp' && savings > 0 && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center animate-fade-in">
            <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} />
              {t.economy}:
            </span>
            <span className="text-sm font-black text-primary animate-pulse">
              {currencySymbol} {savings.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Finance;
