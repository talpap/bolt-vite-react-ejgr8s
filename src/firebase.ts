import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB8JeYGf3dJfgmM4VlM4NOVtcjRTSKCpuI",
  authDomain: "dimri-hashahar.firebaseapp.com",
  projectId: "dimri-hashahar",
  storageBucket: "dimri-hashahar.appspot.com",
  messagingSenderId: "675102104155",
  appId: "1:675102104155:web:c026d6e7fc2f89d700fd7e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);