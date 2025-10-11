import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTY9ntXHFccnsTv37SI36wq0iWnwZsCrM",
  authDomain: "test-login-5b7a2.firebaseapp.com",
  projectId: "test-login-5b7a2",
  storageBucket: "test-login-5b7a2.firebasestorage.app",
  messagingSenderId: "1092858633963",
  appId: "1:1092858633963:web:6a9ea53735004bb62da8ae",
  measurementId: "G-JRFG4C1NBF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
