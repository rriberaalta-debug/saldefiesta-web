import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

// 👉 Función para guardar un documento de prueba
export const saveTestPost = async (userId: string, message: string) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      userId,
      message,
      createdAt: new Date(),
    });
    console.log("✅ Documento guardado con ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error al guardar el documento:", error);
  }
};

// 👉 Función para leer todos los documentos
export const readTestPosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    console.log("📂 Documentos encontrados:");
    querySnapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (error) {
    console.error("❌ Error al leer los documentos:", error);
  }
};
