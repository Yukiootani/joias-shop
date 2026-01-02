self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Apenas um pass-through simples
});
