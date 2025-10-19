import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostForm from "./components/PostForm";
import LoginForm from "./components/LoginForm";
import Register from "./pages/register";
import { observeAuthState, logoutUser } from "./services/auth";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <Routes>
          {/* Página principal (login o contenido si hay usuario) */}
          <Route
            path="/"
            element={
              !user ? (
                <LoginForm />
              ) : (
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-6">
                  <p className="text-center mb-4 text-gray-700">
                    Sesión iniciada como: <strong>{user.email}</strong>
                  </p>
                  <button
                    onClick={logoutUser}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mb-6"
                  >
                    Cerrar sesión
                  </button>
                  <PostForm />
                </div>
              )
            }
          />

          {/* Página de registro */}
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}
