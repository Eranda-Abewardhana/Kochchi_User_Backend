import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRb8oj21gc9FrYIPgf_cZf57L2XFN_gZY",
  authDomain: "kochchiapp-1d8f1.firebaseapp.com",
  projectId: "kochchiapp-1d8f1",
  storageBucket: "kochchiapp-1d8f1.appspot.com",
  messagingSenderId: "896094651555",
  appId: "1:896094651555:android:08d1aa27c06b347be1eb16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app; 