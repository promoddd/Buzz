import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDjn0PhBS7YaquhNoHmD1-uFsR1tVPF-BY',
  authDomain: 'chat-61bdc.firebaseapp.com',
  projectId: 'chat-61bdc',
  storageBucket: 'chat-61bdc.appspot.com',
  messagingSenderId: '766929710838',
  appId: '1:766929710838:web:82787fa768bf00832646d7',
  measurementId: 'G-KEKRKKYMEG'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Add error logging for auth state changes
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
});

// Add error handling for auth operations
auth.onIdTokenChanged((user) => {
  console.log('Token changed:', user ? 'New token available' : 'No token');
});

// Add error handling for general auth errors using onAuthStateChanged
auth.onAuthStateChanged(null, (error) => {
  if (error) {
    console.error('Auth error:', error);
  }
});