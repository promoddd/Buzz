import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDjn0PhBS7YaquhNoHmD1-uFsR1tVPF-BY',
  authDomain: 'chat-61bdc.firebaseapp.com',
  projectId: 'chat-61bdc',
  storageBucket: 'chat-61bdc.firebasestorage.app',
  messagingSenderId: '766929710838',
  appId: '1:766929710838:web:82787fa768bf00832646d7',
  measurementId: 'G-KEKRKKYMEG'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);