// src/authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Sign up
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);

// Log in
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

// Log out
export const logout = () => signOut(auth);
