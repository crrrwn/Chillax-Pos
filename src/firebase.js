import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCcsMRSel7wMM4xnpyAHzIZD9ggfhVOJc0",
  authDomain: "chillaxpos.firebaseapp.com",
  databaseURL: "https://chillaxpos-default-rtdb.firebaseio.com",
  projectId: "chillaxpos",
  storageBucket: "chillaxpos.firebasestorage.app",
  messagingSenderId: "250096768661",
  appId: "1:250096768661:web:8f2d22fc57bba89bc02d9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

export { app, db, auth, rtdb, storage };

