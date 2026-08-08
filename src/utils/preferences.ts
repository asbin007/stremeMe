/**
 * Small viewer preferences kept on the device.
 *
 * These are the settings a regular viewer re-applies constantly if the app
 * forgets them. They are deliberately local rather than server-side: they
 * should work signed out, and the correct answer differs per device and
 * network anyway.
 */

const SERVER_KEY = "aurascreen:preferredServer";

/** localStorage throws in private mode and when storage is full. */
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preference is a nicety; losing it must never break playback.
  }
}

/**
 * The stream source this viewer last chose by hand.
 *
 * Stored by id rather than list index, so reordering or removing a source
 * cannot silently point the preference at a different one.
 */
export function getPreferredServerId(): string | null {
  return safeGet(SERVER_KEY);
}

export function setPreferredServerId(id: string): void {
  safeSet(SERVER_KEY, id);
}

/**
 * Resolves the stored preference to an index in `servers`, falling back to the
 * first source when there is no preference or the stored one no longer exists.
 */
export function resolvePreferredServerIndex(
  servers: readonly { id: string }[]
): number {
  const preferred = getPreferredServerId();
  if (!preferred) return 0;

  const index = servers.findIndex(s => s.id === preferred);
  return index >= 0 ? index : 0;
}
