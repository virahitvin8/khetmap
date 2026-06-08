/**
 * Database Service
 * 
 * Primary: Firebase Firestore (cloud sync across devices)
 * Fallback: localStorage (offline / when Firebase isn't configured)
 */

import { initFirebase, isFirebaseReady, getDb, collection, doc, setDoc, getDocs, query, where, orderBy, onSnapshot, deleteDoc, updateDoc, Timestamp } from './firebase';

export interface Farm {
  id: string;
  uid: string;
  name: string;
  areaHa: number;
  geometry: any;
  cropType?: string;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = 'khetmap-farms';

// ========================
// LocalStorage Backend
// ========================

function getAllFarmsLocal(): Farm[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAllFarmsLocal(farms: Farm[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  } catch (e) {
    console.error('Failed to save farms:', e);
  }
}

// ========================
// Initialization
// ========================

let firebaseInitialized = false;

function ensureFirebase(): boolean {
  if (!firebaseInitialized) {
    firebaseInitialized = initFirebase();
  }
  return isFirebaseReady();
}

// ========================
// Public API
// ========================

export async function getFarms(userId: string): Promise<Farm[]> {
  if (ensureFirebase()) {
    try {
      const db = getDb();
      const q = query(
        collection(db, 'farms'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const farms = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Farm));
      if (farms.length > 0) return farms;
    } catch (e) {
      console.warn('Firestore getFarms failed, falling back to localStorage:', e);
    }
  }
  // Fallback to localStorage
  const farms = getAllFarmsLocal();
  return farms.filter(f => !f.uid || f.uid === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export async function createFarm(userId: string, farm: Omit<Farm, 'id' | 'createdAt' | 'uid'>): Promise<string> {
  const id = crypto.randomUUID();
  const farmData = { id, uid: userId, ...farm, createdAt: Date.now() } as Farm;

  if (ensureFirebase()) {
    try {
      const db = getDb();
      await setDoc(doc(db, 'farms', id), {
        ...farmData,
        createdAt: Timestamp.fromMillis(farmData.createdAt),
      });
      return id;
    } catch (e) {
      console.warn('Firestore createFarm failed, falling back to localStorage:', e);
    }
  }

  // Fallback to localStorage
  const farms = getAllFarmsLocal();
  farms.push(farmData);
  saveAllFarmsLocal(farms);
  return id;
}

export async function updateFarm(userId: string, farmId: string, updates: Partial<Farm>) {
  if (ensureFirebase()) {
    try {
      const db = getDb();
      const firestoreUpdates: Record<string, any> = { ...updates };
      if (firestoreUpdates.createdAt !== undefined) {
        firestoreUpdates.createdAt = Timestamp.fromMillis(firestoreUpdates.createdAt);
      }
      await updateDoc(doc(db, 'farms', farmId), firestoreUpdates);
      return;
    } catch (e) {
      console.warn('Firestore updateFarm failed, falling back to localStorage:', e);
    }
  }

  // Fallback to localStorage
  const farms = getAllFarmsLocal();
  const idx = farms.findIndex(f => f.id === farmId);
  if (idx !== -1) {
    farms[idx] = { ...farms[idx], ...updates };
    saveAllFarmsLocal(farms);
  }
}

export async function deleteFarm(userId: string, farmId: string) {
  if (ensureFirebase()) {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'farms', farmId));
      return;
    } catch (e) {
      console.warn('Firestore deleteFarm failed, falling back to localStorage:', e);
    }
  }

  // Fallback to localStorage
  const farms = getAllFarmsLocal().filter(f => f.id !== farmId);
  saveAllFarmsLocal(farms);
}

export function subscribeToFarms(userId: string, callback: (farms: Farm[]) => void): () => void {
  const sortAndCallback = (farms: Farm[]) => {
    callback(farms.sort((a, b) => b.createdAt - a.createdAt));
  };

  if (ensureFirebase()) {
    try {
      const db = getDb();
      const q = query(
        collection(db, 'farms'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        const farms = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Farm));
        sortAndCallback(farms);
      }, (error) => {
        console.warn('Firestore onSnapshot error, falling back:', error);
        // Fallback: poll localStorage
        pollLocalStorage();
      });
      
      return unsub;
    } catch (e) {
      console.warn('Firestore subscribe failed, falling back to localStorage:', e);
    }
  }

  // Fallback: poll localStorage
  function pollLocalStorage() {
    const farms = getAllFarmsLocal().filter(f => !f.uid || f.uid === userId);
    sortAndCallback(farms);
  }

  // Initial call
  pollLocalStorage();

  // Listen for storage changes from other tabs
  const handler = () => pollLocalStorage();
  window.addEventListener('storage', handler);

  const interval = setInterval(pollLocalStorage, 2000);

  return () => {
    window.removeEventListener('storage', handler);
    clearInterval(interval);
  };
}
