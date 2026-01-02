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

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.imgur.com/BIXdM6M.png', // Pode trocar pelo logo da joalheria se tiver
    tag: 'push-alert-' + Date.now(),
    data: { url: payload.notification.click_action || '/' }
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
