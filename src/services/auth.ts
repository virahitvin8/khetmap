import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuthInstance, getFirestoreInstance } from './firebase';

// ─── Google Sign-In ─────────────────────────────────────────────
export async function signInWithGoogle(): Promise<void> {
  const auth = getAuthInstance();
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  await upsertUserProfile(result.user.uid, {
    name: result.user.displayName || 'Farmer',
    email: result.user.email,
    phone: result.user.phoneNumber,
    photoURL: result.user.photoURL,
  });
}

// ─── Phone OTP ──────────────────────────────────────────────────
let recaptchaVerifier: RecaptchaVerifier | null = null;

export async function signInWithPhone(phoneNumber: string): Promise<ConfirmationResult> {
  const auth = getAuthInstance();

  // Destroy previous verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  const container = document.getElementById('recaptcha-container');
  if (!container) throw new Error('recaptcha-container not found');

  recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      recaptchaVerifier = null;
    },
  });

  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<void> {
  const result = await confirmationResult.confirm(code);
  await upsertUserProfile(result.user.uid, {
    name: result.user.displayName || 'Farmer',
    email: result.user.email,
    phone: result.user.phoneNumber,
    photoURL: null,
  });
}

// ─── Email Auth ──────────────────────────────────────────────────
export async function signInWithEmailPassword(email: string, password: string): Promise<void> {
  const auth = getAuthInstance();
  const result = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserProfile(result.user.uid, {
    name: result.user.displayName || 'Farmer',
    email: result.user.email,
    phone: result.user.phoneNumber,
    photoURL: result.user.photoURL,
  });
}

export async function createAccountWithEmail(email: string, password: string): Promise<void> {
  const auth = getAuthInstance();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await upsertUserProfile(result.user.uid, {
    name: email.split('@')[0],
    email: result.user.email,
    phone: null,
    photoURL: null,
  });
}

// ─── Sign Out ────────────────────────────────────────────────────
import { signOut as firebaseSignOut } from 'firebase/auth';
export async function signOut(): Promise<void> {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
}

// ─── Firestore user profile ──────────────────────────────────────
interface ProfileData {
  name: string;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  state?: string;
}

async function upsertUserProfile(uid: string, data: ProfileData): Promise<void> {
  const db = getFirestoreInstance();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...data, uid, createdAt: serverTimestamp() });
  }
}

export async function saveUserProfile(uid: string, data: Partial<ProfileData>): Promise<void> {
  const db = getFirestoreInstance();
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<any> {
  const db = getFirestoreInstance();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) throw new Error('Profile not found');
  return snap.data();
}
