// ─── PLAY AGE SIGNALS: FUTURE ADMOB HOOK ─────────────────────────────
// AdMob is NOT integrated in FiguritaZ yet — AdBanner is a placeholder and
// under-18 users get no ad slot at all (see src/components/AdBanner.jsx).
// When AdMob is added, use getAdRequestConfig(isUnder18) when building the
// ad request. For under-18 users it returns `{ npa: '1' }`, which tells
// Google to serve non-personalized ads only:
// https://developers.google.com/admob/android/targeting#users_under_the_age_of_consent
//
// The safest option for minors remains no ads at all; only switch an
// under-18 user to non-personalized ads if that is a deliberate product
// decision by Tarcisio. Never pass the age signal itself, or any
// identifier derived from it, to an ad request. The `isUnder18` value
// comes from the Play Age Signals flag in App.jsx (see src/lib/ageSignals.js).

/**
 * Build the AdMob request extras for the given under-18 flag.
 * @param {boolean|null} isUnder18 - true when Play shared an age range
 *   below 18, false when 18+, null when no age range was shared.
 * @returns {{ npa: string } | {}} `{ npa: '1' }` for under-18 users
 *   (non-personalized ads only), an empty object otherwise.
 */
export function getAdRequestConfig(isUnder18) {
  return isUnder18 === true ? { npa: '1' } : {};
}
