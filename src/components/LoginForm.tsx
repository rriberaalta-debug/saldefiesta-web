import React, { useState } from "react";
import { loginUser, getCurrentUser } from "../services/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      alert("✅ Sesión iniciada correctamente");
      window.location.reload();
    } catch (error) {
      alert("❌ Error al iniciar sesión. Revisa tus credenciales.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-3 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Entrar
        </button>

        {/* 🔹 Enlace para ir al registro */}
        <p className="text-sm text-center mt-4">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-pink-600 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  );
}
