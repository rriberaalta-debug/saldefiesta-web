import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "./auth";
import { app } from "./firebase";

// 🔹 Inicializa Firestore
const db = getFirestore(app);

// 🔹 Forzar uso del bucket correcto de Storage
const storage = getStorage(app, "gs://saldefiesta-storage");

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

      const folder = isVideo ? "uploads/videos" : "uploads/images";
      const storagePath = `${folder}/${Date.now()}-${file.name}`; // nombre único
      const storageRef = ref(storage, storagePath);

      console.log("📤 Subiendo a:", storagePath);

      // Subir archivo al bucket correcto
      await uploadBytes(storageRef, file);

      // Obtener URL pública
      mediaUrl = await getDownloadURL(storageRef);
      console.log("✅ Archivo subido:", mediaUrl);
    }

    // 🔹 Usuario actual
    const user = auth.currentUser;

    // 🔹 Guardar datos en Firestore
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
  } catch (error: any) {
    console.error("❌ Error al guardar publicación:", error?.message || error);
    alert("❌ Error al subir publicación: " + (error?.message || "ver consola"));
    throw error;
  }
}
