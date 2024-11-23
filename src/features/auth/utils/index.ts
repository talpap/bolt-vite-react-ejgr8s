import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../../../firebase';

export const loginWithEmail = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in with email:', error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, provider);
    }
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};