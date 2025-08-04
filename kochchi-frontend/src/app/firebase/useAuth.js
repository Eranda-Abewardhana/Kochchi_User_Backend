import { useState, useEffect } from "react";
import { auth } from "./config";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get Firebase ID token
        const idToken = await firebaseUser.getIdToken();

        // Send to your FastAPI backend
        try {
          const response = await fetch("/api/auth/firebase", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firebase_id_token: idToken,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Store JWT token from your backend
            localStorage.setItem("access_token", data.access_token);
            setUser({
              ...firebaseUser,
              role: data.role,
              username: data.username,
            });
          }
        } catch (error) {
          console.error("Backend authentication failed:", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem("access_token");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign-in error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    logout,
  };
};
