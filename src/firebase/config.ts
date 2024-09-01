import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth,GoogleAuthProvider  } from "firebase/auth";

const api_Key = import.meta.env.VITE_API_KEY;

const firebaseConfig = {
  apiKey: api_Key,
  authDomain: "bite-buddy-47fad.firebaseapp.com",
  projectId: "bite-buddy-47fad",
  storageBucket: "bite-buddy-47fad.appspot.com",
  messagingSenderId: "1011422284100",
  appId: "1:1011422284100:web:e3f5f54b2066f7aa736f11"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
