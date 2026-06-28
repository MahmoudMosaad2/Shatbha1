import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const socialSignIn = async (providerName: 'Google' | 'Facebook' | 'Apple'): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    let providerInfo;
    
    if (providerName === 'Google') providerInfo = googleProvider;
    else if (providerName === 'Facebook') providerInfo = facebookProvider;
    else if (providerName === 'Apple') providerInfo = appleProvider;
    else throw new Error('Unsupported provider');

    const result = await signInWithPopup(auth, providerInfo);
    
    // Attempt to extract credential depending on provider type, though often just result.user is enough
    let accessToken = '';
    
    if (providerName === 'Google') {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken || '';
    } else if (providerName === 'Facebook') {
        const credential = FacebookAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken || '';
    } else if (providerName === 'Apple') {
        const credential = OAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken || '';
    }

    cachedAccessToken = accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Sign-in popup closed by user.');
        return null; // Gracefully handle user closing the popup
    }
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Backwards compatibility alias
export const googleSignIn = () => socialSignIn('Google');

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR';
  createdAt: string;
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' = 'CLIENT'
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set displayName on Firebase User
    await updateProfile(user, { displayName: name });

    // Save profile to Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);

    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

