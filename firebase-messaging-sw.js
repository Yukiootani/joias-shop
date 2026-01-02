importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyCWYPzaDszTenGqC627aKH5CNaCdIOdoKw",
    authDomain: "marias-joias-db345.firebaseapp.com",
    projectId: "marias-joias-db345",
    storageBucket: "marias-joias-db345.firebasestorage.app",
    messagingSenderId: "977811297166",
    appId: "1:977811297166:web:d0d9cf5477d7deb8bdcadf"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Esta função roda quando o app está FECHADO ou em SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log('[Background] Notificação recebida:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.imgur.com/BIXdM6M.png', // Ícone da notificação
    vibrate: [200, 100, 200],
    data: {
        url: payload.data?.url || payload.notification?.click_action || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clique na notificação abre o site
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
