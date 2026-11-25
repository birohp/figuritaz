import React from 'react';
import { translations } from '../lib/translations';

// ─── PLAY AGE SIGNALS: UNDER-18 ADS GATE ─────────────────────────────
// Tarcisio chose the ads gate as the under-18 behavior (24 Nov 2026):
// users under 18 get no ads at all. `isUnder18` comes from the Play Age
// Signals flag in App.jsx — true when Play shared an age range below 18,
// false when 18+, null when no age range was shared (web build, user
// declined, verification pending, or API unavailable). Unknown is treated
// like adult today: the banner is a placeholder with no real ad yet, so
// there is nothing personalized to suppress. See src/lib/adsConsent.js
// for the future AdMob non-personalized-ads hook.
const AdBanner = ({ lang = 'pt', isUnder18 = null }) => {
  // Under-18 users: no ad slot at all — not even the placeholder.
  if (isUnder18 === true) {
    return null;
  }

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
