// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "recharts";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("lucide-react")) return "icons";
          }
        },
      },
    },
    // можно убрать/уменьшить, если не нужен
    chunkSizeWarningLimit: 1200,
  },
  base: "/poker/",
  server: { port: 5173 },
});
