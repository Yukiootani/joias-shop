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

// FORÇAR ATUALIZAÇÃO IMEDIATA (Resolve problema de Cache no Android)
self.addEventListener('install', (event) => {
    self.skipWaiting();
});
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 1. RECEBER NO BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log('[Background] Notificação:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.imgur.com/BIXdM6M.png',
    badge: 'https://i.imgur.com/BIXdM6M.png', // Ícone pequeno na barra
    vibrate: [200, 100, 200, 100, 200], // Vibração mais forte
    tag: 'promo-alert', // Substitui notificação antiga para não acumular
    renotify: true, // Toca o som mesmo se já tiver notificação lá
    data: { 
        url: payload.data?.url || payload.notification?.click_action || '/' 
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada');
  event.notification.close(); // FECHA A NOTIFICAÇÃO (Isso ajuda a sumir o número vermelho)

  // Tenta limpar o Badge (número vermelho)
  if (navigator.setAppBadge) { navigator.setAppBadge(0); }
  if (navigator.clearAppBadge) { navigator.clearAppBadge(); }

  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
        // Se o app já estiver aberto, foca nele
        for (var i = 0; i < windowClients.length; i++) {
            var client = windowClients[i];
            if (client.url === event.notification.data.url && 'focus' in client) {
                return client.focus();
            }
        }
        // Se não, abre nova janela
        if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url || '/');
        }
    })
  );
});
