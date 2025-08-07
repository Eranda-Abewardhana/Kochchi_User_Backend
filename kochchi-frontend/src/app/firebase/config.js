// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZquNSbqFzvkd2yY8JwOHt2dcqNSCiuh4",
  authDomain: "kochchiapp-1d8f1.firebaseapp.com",
  projectId: "kochchiapp-1d8f1",
  storageBucket: "kochchiapp-1d8f1.firebasestorage.app",
  messagingSenderId: "896094651555",
  appId: "1:896094651555:web:723e779f2ad31f86e1eb16",
  measurementId: "G-6859Y4763T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
