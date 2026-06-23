import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

