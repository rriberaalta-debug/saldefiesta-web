import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "./auth";
import { app } from "./firebase";

// Inicializa Firestore y Storage
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Guarda una publicación en Firestore con texto y/o archivo multimedia.
 * @param text Texto de la publicación
 * @param file Archivo (imagen o video)
 */
export async function savePost(text: string, file: File | null) {
  try {
    let mediaUrl = null;
    let mediaType = null;

    // 🔹 Subir archivo si existe
    if (file) {
      const isVideo = file.type.startsWith("video/");
      mediaType = isVideo ? "video" : "image";

      const storagePath = isVideo ? `uploads/videos/${file.name}` : `uploads/images/${file.name}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      mediaUrl = await getDownloadURL(storageRef);
    }

    // 🔹 Usuario actual
    const user = auth.currentUser;

    // 🔹 Guardar en Firestore
    const docRef = await addDoc(collection(db, "posts"), {
      text,
      mediaUrl,
      mediaType,
      userId: user ? user.uid : "anónimo",
      userEmail: user ? user.email : null,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Publicación guardada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error al guardar publicación:", error);
    throw error;
  }
}
