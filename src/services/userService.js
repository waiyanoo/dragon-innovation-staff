// User management for super admin.
// Auth accounts live in Firebase Auth; profile data lives in Firestore at users/{uid}.
import { initializeApp, deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { database, firebaseConfig } from "../firebase";

export const listUsers = async () => {
  const snapshot = await getDocs(collection(database, "users"));
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
};

// Create the auth account on a throwaway secondary app so the super admin's
// own session is never replaced by the newly created user.
export const createUser = async ({ email, password, name, role, mobile, position }) => {
  const secondaryApp = initializeApp(firebaseConfig, `user-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await setDoc(doc(database, "users", cred.user.uid), {
      email,
      name,
      role,
      mobile: mobile || "",
      position: position || "",
      status: "active",
      createdAt: serverTimestamp(),
    });
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondaryApp);
  }
};

export const updateUser = async (uid, { name, role, mobile, position }) => {
  await updateDoc(doc(database, "users", uid), {
    name,
    role,
    mobile: mobile || "",
    position: position || "",
  });
};

export const setUserStatus = async (uid, status) => {
  await updateDoc(doc(database, "users", uid), { status });
};
