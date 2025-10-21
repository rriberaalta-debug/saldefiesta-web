import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    // IMPORTANTE: usar rutas relativas para que Netlify cargue bien los assets
    base: "./",

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    plugins: [react()],

    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      // Aseguramos que la carpeta de salida sea 'dist' (Netlify usa esa)
      outDir: "dist",
      // Opcional: evitar tamaños de chunk demasiado fragmentados
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
