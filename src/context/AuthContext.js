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
  const auth = getAuth();

  const userProfile = async (user) => {
    if (user) {
      const userRef = doc(database, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        // Suspended accounts are denied access at the app layer.
        if (data.status === "suspended") {
          await signOut(auth);
          setAuthUser(null);
          setUserData(null);
          return;
        }
        setUserData(data);
      } else {
        const newUser = {
          email: user.email,
          name: user.email.split("@")[0],
          role: "admin",
          status: "active",
          createdAt: new Date(),
        };
        await setDoc(userRef, newUser);
        setUserData(newUser);
      }
    } else {
      setUserData(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(!user){
        setAuthUser(null);
        setLoading(false);
      } else {
        setAuthUser(user);
        userProfile(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if(userData === null || !userData) {
      setLoading(true);
    }else{
      setLoading(false);
    }
  }, [userData])

  return <AuthContext.Provider value={{ authUser, userData, loading }}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function useAuth() {
  return useContext(AuthContext);
}
