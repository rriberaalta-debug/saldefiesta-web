import React, { useState } from "react";
import { savePost } from "../services/firestorePosts";

export default function PostForm() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return alert("Debes escribir algo o subir un archivo");
    setLoading(true);
    try {
      await savePost(text, file);
      alert("✅ Publicación subida con éxito");
      setText("");
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("❌ Error al guardar publicación:", err);
      alert("Error al subir la publicación");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-md w-full max-w-md"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="¿Qué quieres compartir?"
        className="w-full p-3 border rounded-lg focus:outline-none"
        rows={3}
      />

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="w-full"
      />

      {preview && (
        <div className="w-full">
          {file && file.type.startsWith("image/") ? (
            <img
              src={preview}
              alt="Vista previa"
              className="w-full rounded-lg mt-2"
            />
          ) : (
            <video
              src={preview}
              controls
              className="w-full rounded-lg mt-2"
            />
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg"
      >
        {loading ? "Subiendo..." : "Publicar 🎉"}
      </button>
    </form>
  );
}

