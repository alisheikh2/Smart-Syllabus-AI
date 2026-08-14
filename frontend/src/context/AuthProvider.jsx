import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";
import { AuthContext } from "./AuthContext";
import { syncUser } from "../services/userService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => isFirebaseConfigured ? null : ({ displayName: "Demo Learner", email: "demo@smartsyllabus.ai", photoURL: null, isDemo: true }));
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          await syncUser({
            name: currentUser.displayName || currentUser.email.split("@")[0],
            email: currentUser.email,
            photo: currentUser.photoURL,
          });
        } catch (error) {
          console.error("User sync failed:", error.message);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const logout = () => {
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};