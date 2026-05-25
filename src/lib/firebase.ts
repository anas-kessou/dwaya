import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getDatabase, ref, set, onValue } from 'firebase/database';

// trbt fireebase
// Check for missing environment variables
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn("ATTENTION: VITE_FIREBASE_API_KEY est manquant. Vérifiez vos variables d'environnement.");
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'missing',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'missing'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase initialized");

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
      ledStatus: "off",
      command: null,
      lastUpdated: new Date()
    });
    console.log("Box créée dans Firestore ");
  } catch (error) {
    console.error("Error creating box: ", error);
  }
};

export const sendBoxCommand = async (boxId: string, command: string) => {
  try {
    await setDoc(doc(db, "boxes", boxId), {
      command: command,
      lastUpdated: new Date()
    }, { merge: true });
    console.log("Commande envoyée : ", command);
  } catch (error) {
    console.error("Error sending command: ", error);
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

// ===== ALARM CONTROL (ESP32) =====
// Writes to /alarm/status in RTDB — the ESP32 reads this path to trigger the buzzer + LED

export const triggerAlarm = async () => {
  try {
    await set(ref(rtdb, 'alarm/status'), true);
    console.log('Alarm triggered');
  } catch (error) {
    console.error('Error triggering alarm: ', error);
  }
};

export const stopAlarm = async () => {
  try {
    await set(ref(rtdb, 'alarm/status'), false);
    console.log('Alarm stopped');
  } catch (error) {
    console.error('Error stopping alarm: ', error);
  }
};

export const onAlarmStatus = (callback: (status: boolean) => void) => {
  const alarmRef = ref(rtdb, 'alarm/status');
  return onValue(alarmRef, (snapshot) => {
    callback(snapshot.val() === true);
  });
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
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
  console.error('Firestore Error details: ', errInfo);
  // Do NOT throw here, it crashes the app. Just log it.
}
