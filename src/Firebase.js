// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD1YCMicctqR5Fn8obrHD_q69sWCOQnpVc",
  authDomain: "parking-app-47bb3.firebaseapp.com",
  projectId: "parking-app-47bb3",
  storageBucket: "parking-app-47bb3.firebasestorage.app",
  messagingSenderId: "917806909528",
  appId: "1:917806909528:web:420821872e4123922fa22d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize individual services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Export services for use throughout the app
export { app, analytics, db, auth };
