// AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import PropTypes from "prop-types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {database} from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const auth = getAuth();

  const userProfile = async (user) => {
    if (!user) {
      setUserData(null);
      setProfileError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setProfileError(null);
    try {
      const userRef = doc(database, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        // Suspended accounts are denied access at the app layer.
        if (data.status === "suspended") {
          sessionStorage.setItem("authNotice", "suspended");
          await signOut(auth);
          setAuthUser(null);
          setUserData(null);
          return;
        }
        setUserData(data);
      } else {
        // No profile yet: register the account with the no-access "pending"
        // role so it shows up in user management for a super admin to
        // promote. Never default to a privileged role here — anyone who can
        // obtain a Firebase Auth session would become that role.
        const newUser = {
          email: user.email,
          name: user.email.split("@")[0],
          role: "pending",
          status: "active",
          createdAt: new Date(),
        };
        await setDoc(userRef, newUser);
        setUserData(newUser);
      }
    } catch (error) {
      console.error("Unable to load user profile:", error);
      setProfileError("We could not load your staff profile. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if(!user){
        setAuthUser(null);
        setUserData(null);
        setProfileError(null);
        setLoading(false);
      } else {
        setAuthUser(user);
        await userProfile(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const retryProfile = () => userProfile(auth.currentUser);

  return <AuthContext.Provider value={{ authUser, userData, loading, profileError, retryProfile }}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function useAuth() {
  return useContext(AuthContext);
}
