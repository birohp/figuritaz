import React from 'react';
import { translations } from '../lib/translations';

const AdBanner = ({ lang = 'pt' }) => {
  const t = translations[lang] || translations.pt;

  return (
    <div className="mx-4 mt-6 mb-2">
      <div className="glass-card bg-black/40 border border-white/5 h-[90px] flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 bg-secondary/20 text-[8px] font-black uppercase px-2 py-0.5 tracking-tighter text-secondary">
          AD
        </div>
        
        {/* Placeholder Content */}
        <p className="text-[10px] font-black text-text-dim uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">
          {t.adSpace}
        </p>
        <p className="text-[8px] font-bold text-text-dim opacity-20 mt-1 uppercase">
          Unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
        </p>
        
        {/* Decorative elements to make it look "pro" even as placeholder */}
        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-primary/5 rounded-full blur-xl" />
        <div className="absolute -left-4 -top-4 w-12 h-12 bg-secondary/5 rounded-full blur-xl" />
      </div>
    </div>
  );
};

export default AdBanner;
