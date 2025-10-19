import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBMSu8A7v_vZSlywHsEZsTkMX2eJJmEpM",
  authDomain: "saldefiesta-appp.firebaseapp.com",
  projectId: "saldefiesta-appp",
  storageBucket: "saldefiesta-appp.appspot.com",
  messagingSenderId: "698613369041",
  appId: "1:698613369041:web:86264aee6ab547b43e9df0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
