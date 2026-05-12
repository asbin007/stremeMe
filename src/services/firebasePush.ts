import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestFirebaseToken = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        // Find your VAPID key in Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
        // Without vapidKey, some browsers may not work.
        // vapidKey: 'YOUR_VAPID_KEY_HERE', 
      });

      if (currentToken) {
        console.log('Firebase token obtained:', currentToken);
        // Send token to our backend
        await sendTokenToBackend(currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Notification permission not granted.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
  return null;
};

export const onForegroundMessage = () => {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('Received foreground message: ', payload);
    // You can customize how foreground notifications are handled here
    // e.g. toast.info(`${payload.notification?.title}: ${payload.notification?.body}`);
  });
};

const sendTokenToBackend = async (token: string) => {
  try {
    // We assume you have a utility to get the JWT token, or its automatically attached via axios interceptor
    const deviceInfo = navigator.userAgent;
    
    // We'll use fetch directly if the api utility isn't straightforward
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const jwtToken = localStorage.getItem('token'); 
    
    if (!jwtToken) return; // User not logged in
    
    await fetch(`${apiUrl}/auth/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ token, deviceInfo })
    });
    console.log('Token successfully sent to backend');
  } catch (error) {
    console.error('Error sending token to backend', error);
  }
};
