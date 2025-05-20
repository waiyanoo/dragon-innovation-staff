import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { database } from "../firebase"; // your Firestore config

export const createUserProfile = async (userRef, user) => {


  // Only create if it doesn't exist

  await setDoc(userRef, {
    email: user.email,
    name: user.name || "",
    role: "super_user",
    createdAt: new Date(),
  });

}

