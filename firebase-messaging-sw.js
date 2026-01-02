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

// Força o Android a atualizar o código imediatamente
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });

// OUVIR EM SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log('[Background] Notificação:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    
    // 👇 AQUI ESTAVA O ERRO! Flaticon bloqueia o Android.
    // Usei este link do Imgur que funciona 100%:
    icon: 'https://i.imgur.com/vA47S8s.png', 
    badge: 'https://i.imgur.com/vA47S8s.png',
    
    vibrate: [200, 100, 200],
    tag: 'promo-alert', // Substitui a anterior para não acumular
    data: { 
        url: payload.data?.url || '/' 
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
