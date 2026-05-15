import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';

// trbt fireebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase connected ");

// code dyal user
export const saveUserToFirestore = async (uid: string, email: string) => {
  try {
    await setDoc(doc(db, "users", uid), {
      uid: uid,
      email: email,
      createdAt: new Date()
    });
    console.log("Utilisateur sauvegardé dans Firestore ");
  } catch (error) {
    console.error("Error saving user: ", error);
  }
};

// code dyal boxes
export const createBox = async (boxId: string, userId: string) => {
  try {
    await setDoc(doc(db, "boxes", boxId), {
      boxId: boxId,
      userId: userId,
      statut: "ferme",
      colisPresent: false,
      temperature: 0,
      mouvement: false,
      lastUpdated: new Date()
    });
    console.log("Box créée dans Firestore ");
  } catch (error) {
    console.error("Error creating box: ", error);
  }
};

// code dyal history
export const addHistoryEvent = async (boxId: string, userId: string, type: string) => {
  try {
    await addDoc(collection(db, "history"), {
      boxId: boxId,
      userId: userId,
      type: type,
      timestamp: new Date()
    });
    console.log("Événement ajouté dans history ");
  } catch (error) {
    console.error("Error adding history event: ", error);
  }
};

// code de notifications
export const saveNotification = async (userId: string, message: string, type: string) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId: userId,
      message: message,
      type: type,
      lu: false,
      createdAt: new Date()
    });
    console.log("Notification sauvegardée ");
  } catch (error) {
    console.error("Error saving notification: ", error);
  }
};

// code dyal realtime database
export const updateSensorData = async (boxId: string, data: { temperature: number, mouvement: boolean, colisPresent: boolean }) => {
  try {
    await set(ref(rtdb, "sensors/" + boxId), {
      temperature: data.temperature,
      mouvement: data.mouvement,
      colisPresent: data.colisPresent,
      lastUpdated: new Date().toISOString()
    });
    console.log("Données capteurs sauvegardées");
  } catch (error) {
    console.error("Error updating sensor data: ", error);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
