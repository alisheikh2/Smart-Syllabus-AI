import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARcHRXJvKVBO7QIoWAJCKCv5Ax6nTdbwQ",
  authDomain: "smartsyllabusai.firebaseapp.com",
  projectId: "smartsyllabusai",
  storageBucket: "smartsyllabusai.firebasestorage.app",
  messagingSenderId: "1046562237976",
  appId: "1:1046562237976:web:defceb2b28887d2cc89d6d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();