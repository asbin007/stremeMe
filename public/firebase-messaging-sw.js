importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyB0edaGrDZ3B_qXnQ1kDPIRvh3HOrV4MQQ",
  authDomain: "aurascreen-d29ea.firebaseapp.com",
  projectId: "aurascreen-d29ea",
  storageBucket: "aurascreen-d29ea.firebasestorage.app",
  messagingSenderId: "810232660306",
  appId: "1:810232660306:web:eb617f06434d0df039ba8b",
  measurementId: "G-JP8JWML6LN"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});