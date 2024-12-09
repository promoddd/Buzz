importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDjn0PhBS7YaquhNoHmD1-uFsR1tVPF-BY',
  authDomain: 'chat-61bdc.firebaseapp.com',
  projectId: 'chat-61bdc',
  storageBucket: 'chat-61bdc.appspot.com',
  messagingSenderId: '766929710838',
  appId: '1:766929710838:web:82787fa768bf00832646d7',
  measurementId: 'G-KEKRKKYMEG'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  console.log('Showing notification:', { title: notificationTitle, options: notificationOptions });
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});