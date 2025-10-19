import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./tailwind.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

import { saveTestPost, readTestPosts } from "./services/firestoreTest";
import { getAuth } from "firebase/auth";

const auth = getAuth();
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("👤 Usuario autenticado:", user.email);
    await saveTestPost(user.uid, "¡Hola Firestore!");
    await readTestPosts();
  } else {
    console.log("⚠️ No hay usuario autenticado");
  }
});
