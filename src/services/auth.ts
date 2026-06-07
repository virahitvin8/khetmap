import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getAuthInstance, getFirestoreInstance } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function signUpWithEmail(email: string, password: string, name: string) {
  const auth = getAuthInstance();
  const db = getFirestoreInstance();
  
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  
  await updateProfile(user, { displayName: name });
  await sendEmailVerification(user);
  
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    phone: null,
    photoURL: null,
    createdAt: Date.now(),
  });
  
  return { uid: user.uid, name, email, phone: null, photoURL: null };
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getAuthInstance();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  
  return {
    uid: user.uid,
    name: user.displayName || 'Farmer',
    email: user.email,
    phone: user.phoneNumber,
    photoURL: user.photoURL,
  };
}

export async function signInWithGoogle() {
  const auth = getAuthInstance();
  const db = getFirestoreInstance();
  const provider = new GoogleAuthProvider();
  
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      phone: user.phoneNumber,
      photoURL: user.photoURL,
      createdAt: Date.now(),
    });
  }
  
  return {
    uid: user.uid,
    name: user.displayName || 'Farmer',
    email: user.email,
    phone: user.phoneNumber,
    photoURL: user.photoURL,
  };
}

export async function signOut() {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string) {
  const db = getFirestoreInstance();
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (docSnap.exists()) return docSnap.data() as any;
  return null;
}
