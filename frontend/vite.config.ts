import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        // Split vendor bundles for better caching
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router")) return "vendor-react";
            if (id.includes("zustand") || id.includes("axios")) return "vendor-state";
            if (id.includes("lucide-react") || id.includes("react-hot-toast")) return "vendor-ui";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
}));
