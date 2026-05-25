import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCbTf0zGx99w-PBwVAUNUwNBFuU3-abp9c",
  authDomain: "projet-gaz-esp32.firebaseapp.com",
  databaseURL: "https://projet-gaz-esp32-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projet-gaz-esp32",
  storageBucket: "projet-gaz-esp32.firebasestorage.app",
  messagingSenderId: "1028903041312",
  appId: "1:1028903041312:web:37053a5ce6d14b14f5ff45"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
