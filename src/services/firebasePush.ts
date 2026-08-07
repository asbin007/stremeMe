import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging';
import api from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/** Push is only wired up when the project is actually configured for it. */
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

let appInstance: FirebaseApp | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

/**
 * Resolves the Messaging instance, or null when push is unavailable.
 *
 * This is lazy and support-checked on purpose. The previous version called
 * `getMessaging()` at module scope, which throws on browsers without the Push
 * API (and on any browser when the Firebase config is blank) — that exception
 * fired during module evaluation, before React could render anything.
 */
function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingPromise) return messagingPromise;

  messagingPromise = (async () => {
    if (!isConfigured || typeof window === 'undefined') return null;

    try {
      if (!(await isSupported())) return null;

      appInstance ??= initializeApp(firebaseConfig);
      return getMessaging(appInstance);
    } catch (error) {
      console.warn('Push messaging unavailable:', error);
      return null;
    }
  })();

  return messagingPromise;
}

export type PushPermission = NotificationPermission | 'unsupported';

export function getPushPermission(): PushPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

async function registerToken(messaging: Messaging): Promise<string | null> {
  // Firebase requires the VAPID public key for web push. Without it `getToken`
  // fails on most browsers, which is why registration silently never worked.
  const token = await getToken(
    messaging,
    VAPID_KEY ? { vapidKey: VAPID_KEY } : undefined
  );

  if (!token) return null;

  await sendTokenToBackend(token);
  return token;
}

/**
 * Prompts for notification permission and registers a push token.
 *
 * Call this only from a user gesture. Browsers penalise sites that ask on page
 * load, and a denied prompt is permanent for the origin.
 */
export async function enablePushNotifications(): Promise<PushPermission> {
  const messaging = await getMessagingInstance();
  if (!messaging) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerToken(messaging);
    }
    return permission;
  } catch (error) {
    console.error('Could not enable push notifications:', error);
    return getPushPermission();
  }
}

/**
 * Refreshes the stored token for a user who already granted permission.
 *
 * Safe to call on load: it never shows a prompt, and it no-ops when permission
 * has not been granted. Registration is skipped server-side for anonymous
 * callers, so a signed-out visitor simply gets a 401 that is swallowed below.
 */
export async function syncPushRegistration(): Promise<void> {
  if (getPushPermission() !== 'granted') return;

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  try {
    await registerToken(messaging);
  } catch (error) {
    console.warn('Could not refresh push token:', error);
  }
}

/** Subscribes to messages that arrive while the tab is focused. */
export async function onForegroundMessage(
  handler?: (payload: MessagePayload) => void
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  return onMessage(messaging, payload => {
    handler?.(payload);
  });
}

async function sendTokenToBackend(token: string): Promise<void> {
  // Goes through the shared axios client so it picks up the base URL and the
  // Clerk session token. The previous version hand-rolled a `fetch` against
  // `VITE_API_URL` — a variable defined nowhere — so every production build
  // posted device tokens to http://localhost:5000 and silently dropped them.
  try {
    await api.post('/auth/push-token', {
      token,
      deviceInfo: navigator.userAgent,
    });
  } catch (error) {
    console.error('Could not register device for push notifications:', error);
  }
}
