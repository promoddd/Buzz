import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyDjn0PhBS7YaquhNoHmD1-uFsR1tVPF-BY',
  authDomain: 'chat-61bdc.firebaseapp.com',
  projectId: 'chat-61bdc',
  storageBucket: 'chat-61bdc.appspot.com',
  messagingSenderId: '766929710838',
  appId: '1:766929710838:web:82787fa768bf00832646d7',
  measurementId: 'G-KEKRKKYMEG',
  vapidKey: 'BCvcDEiJITrIEwdRVLII4VewHoD5YltII0GL6_jd3e-kpZpcyNMeVUhASnw0PxN0MTzOy4pJrcjHICCvB2DMLCs'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export let messaging: any;

try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        messaging = getMessaging(app);
        
        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log('Received foreground message:', payload);
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'New Message', {
              body: payload.notification?.body,
              icon: '/favicon.ico'
            });
          }
        });
      })
      .catch(err => console.error('Service Worker registration failed:', err));
  }
} catch (error) {
  console.error('Error initializing messaging:', error);
}

// Initialize auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Request notification permission and get FCM token
export const initializeMessaging = async () => {
  if (!messaging) {
    console.error('Messaging not initialized');
    return null;
  }

  try {
    console.log('Checking notification permission status...');
    const currentPermission = Notification.permission;
    console.log('Current permission status:', currentPermission);

    if (currentPermission === 'denied') {
      console.log('Notifications are blocked. Please enable them in your browser settings.');
      return null;
    }

    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission response:', permission);
    
    if (permission === 'granted') {
      console.log('Notification permission granted, getting FCM token...');
      const token = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
      });
      console.log('FCM Token obtained:', token ? 'Success' : 'Failed');
      return token;
    } else {
      console.log('Notification permission not granted:', permission);
      return null;
    }
  } catch (error) {
    console.error('Error in initializeMessaging:', error);
    return null;
  }
};

// Add error logging for auth state changes
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
});

// Add error logging for token changes
auth.onIdTokenChanged((user) => {
  console.log('Token changed:', user ? 'New token available' : 'No token');
});

// Add error handling for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('No user signed in');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});