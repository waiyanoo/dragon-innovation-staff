// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAt3HgI9wZQB4FH1p-ofpILxdNZcQMEcI",
  authDomain: "dg-auth-e9448.firebaseapp.com",
  databaseURL: "https://dg-auth-e9448-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dg-auth-e9448",
  storageBucket: "dg-auth-e9448.firebasestorage.app",
  messagingSenderId: "942649638403",
  appId: "1:942649638403:web:b5afb1ea0c1e3a436f1836",
  measurementId: "G-EMKXYZM5P9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getFirestore(app);
