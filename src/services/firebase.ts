import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBMSu8A7v_vZSlywHsEZsTkMX2eJJmEpM",
  authDomain: "saldefiesta-appp.firebaseapp.com",
  projectId: "saldefiesta-appp",
  storageBucket: "saldefiesta-appp.firebasestorage.app",
  messagingSenderId: "698613369041",
  appId: "1:698613369041:web:86264aee6ab547b43e9df0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

