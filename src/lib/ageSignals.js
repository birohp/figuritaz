/**
 * Play Age Signals — age assurance plumbing (Google Play, mandatory in
 * Brazil from January 2027 under the Digital ECA / Lei 15.211/2025).
 *
 * Uses the @capawesome/capacitor-age-signals plugin (Capacitor 8), which
 * wraps the native Play Age Signals API on Android and DeclaredAgeRange
 * on iOS. The API returns only an age RANGE (e.g. 0-12, 13-15, 16-17,
 * 18+) — never a birth date — and only while the app is in the foreground.
 *
 * Privacy rules for this signal (Google + Digital ECA):
 * - It is stored ONLY in localStorage on the device, so the app can apply
 *   age-appropriate behavior. It must NEVER be written to Firestore,
 *   sent to analytics, used for ads, or shared with anyone else.
 * - The request runs only on native platforms (Android/iOS). On the web
 *   build it is a no-op: the web has no Play Age Signals API.
 *
 * Docs:
 * - https://developer.android.com/google/play/age-signals/
 * - https://capawesome.io/docs/sdks/capacitor/age-signals/
 */
import { Capacitor } from '@capacitor/core';
import { AgeSignals } from '@capawesome/capacitor-age-signals';

export const AGE_SIGNAL_STORAGE_KEY = 'age_signals';

/**
 * Normalized age-signal result kept in localStorage. `status` mirrors the
 * plugin's AgeRangeStatus, plus two local values:
 * - 'UNAVAILABLE': native API not usable on this device / web build.
 * - 'ERROR': the request threw (network, Play Services, ...). Not stored,
 *   so the next login retries.
 */
function normalizeResult({ status, ageRange, installId, error = null }) {
  return {
    status,
    lowerBound: ageRange?.lowerBound ?? null,
    upperBound: ageRange?.upperBound ?? null,
    ageRangeSource: ageRange?.ageRangeSource ?? null,
    installId: installId ?? null,
    error,
    updatedAt: new Date().toISOString(),
  };
}

/** Read the last stored age signal (or null when none was ever shared). */
export function getStoredAgeSignals() {
  try {
    const raw = localStorage.getItem(AGE_SIGNAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.status !== 'string') return null;
    return parsed;
  } catch (e) {
    console.warn('[AgeSignals] Could not read stored age signal:', e);
    return null;
  }
}

function storeAgeSignals(result) {
  try {
    localStorage.setItem(AGE_SIGNAL_STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.warn('[AgeSignals] Could not store age signal:', e);
  }
}

/** Remove the stored age signal (e.g. on logout). */
export function clearAgeSignals() {
  try {
    localStorage.removeItem(AGE_SIGNAL_STORAGE_KEY);
  } catch (e) {
    console.warn('[AgeSignals] Could not clear age signal:', e);
  }
}

/**
 * Is this stored/requested signal from a user under 18?
 * Returns true (under 18), false (18+), or null (unknown — nothing shared,
 * request declined, verification pending, or API unavailable).
 *
 * Play's default bands are 0-12 / 13-15 / 16-17 / 18+. `upperBound` is
 * undefined when the user meets or exceeds the highest age gate (18+);
 * `lowerBound` is undefined when the user is below the lowest age gate.
 */
export function isUnder18(signal) {
  if (!signal || signal.status !== 'SHARED') return null;
  if (signal.upperBound != null) return signal.upperBound < 18;
  if (signal.lowerBound != null) return signal.lowerBound < 18;
  return null;
}

/**
 * Ask Play for the user's age range. Call after login, on the native app
 * only, while the app is in the foreground. In regions where sharing is
 * mandatory (e.g. Brazil) Play does not show a prompt; if the user's age
 * still needs verification in the Play Store the status is
 * VERIFICATION_REQUIRED and the user must resolve it there.
 * The system caches the user's decision, so repeat calls usually resolve
 * without any user interaction.
 */
export async function requestAgeSignals() {
  if (!Capacitor.isNativePlatform()) {
    return normalizeResult({ status: 'UNAVAILABLE', error: 'not-a-native-platform' });
  }

  try {
    const { available } = await AgeSignals.isAvailable();
    if (!available) {
      return normalizeResult({ status: 'UNAVAILABLE', error: 'age-signals-not-available' });
    }

    const result = await AgeSignals.requestAgeRange();
    const normalized = normalizeResult(result);
    // Only persist a real answer (shared / not shared / verification
    // required). Errors are not stored so the next login retries.
    storeAgeSignals(normalized);
    return normalized;
  } catch (e) {
    console.warn('[AgeSignals] requestAgeRange failed:', e);
    return normalizeResult({ status: 'ERROR', error: e?.message ?? String(e) });
  }
}

/**
 * Re-read a previously shared age range without showing any prompt
 * (Android only). Useful on startup when a SHARED signal is already
 * stored, e.g. to catch a significant change that moved from PENDING
 * to APPROVED. Returns the refreshed signal, or null when it could not
 * be re-read (caller should keep using the stored one).
 */
export async function refreshAgeSignals() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return null;
  }

  try {
    const result = await AgeSignals.getAgeRange();
    if (!result?.ageRange) return null;
    const normalized = normalizeResult(result);
    storeAgeSignals(normalized);
    return normalized;
  } catch (e) {
    console.warn('[AgeSignals] getAgeRange failed:', e);
    return null;
  }
}
