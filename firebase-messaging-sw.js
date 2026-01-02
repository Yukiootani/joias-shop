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

// FORÇA O SERVICE WORKER A ATUALIZAR (Para o Android largar o cache velho)
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });

// 1. OUVIR EM SEGUNDO PLANO (TELA BLOQUEADA)
messaging.onBackgroundMessage((payload) => {
  console.log('[Background] Notificação:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    
    // 👇 AQUI ESTAVA O ERRO! AGORA USAMOS UM LINK QUE EXISTE:
    icon: 'https://cdn-icons-png.flaticon.com/512/616/616430.png', // Diamante Dourado
    badge: 'https://cdn-icons-png.flaticon.com/512/616/616430.png', // Ícone pequeno
    
    vibrate: [200, 100, 200],
    data: { 
        url: payload.data?.url || '/' 
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
