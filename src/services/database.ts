import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';

export interface Farm {
  id: string;
  name: string;
  areaHa: number;
  geometry: any;
  cropType?: string;
  notes?: string;
  createdAt: number;
}

export async function getFarms(userId: string): Promise<Farm[]> {
  const db = getFirestoreInstance();
  const snapshot = await getDocs(
    query(collection(db, 'users', userId, 'farms'), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Farm));
}

export async function createFarm(userId: string, farm: Omit<Farm, 'id' | 'createdAt'>): Promise<string> {
  const db = getFirestoreInstance();
  const docRef = await addDoc(collection(db, 'users', userId, 'farms'), {
    ...farm,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function updateFarm(userId: string, farmId: string, updates: Partial<Farm>) {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, 'users', userId, 'farms', farmId), updates);
}

export async function deleteFarm(userId: string, farmId: string) {
  const db = getFirestoreInstance();
  await deleteDoc(doc(db, 'users', userId, 'farms', farmId));
}

export function subscribeToFarms(userId: string, callback: (farms: Farm[]) => void): Unsubscribe {
  const db = getFirestoreInstance();
  const q = query(collection(db, 'users', userId, 'farms'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Farm)));
  });
}
