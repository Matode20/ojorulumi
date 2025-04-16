import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600, // Increase size limit (in KB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split large dependencies into separate chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
