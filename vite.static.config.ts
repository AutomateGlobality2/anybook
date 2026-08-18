// Static build for GitHub Pages: plain Vite + React, no SSR, no server functions.
// Run with: bun run build:static  (needs VITE_ANYBOOK_API set to the Lovable URL)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  define: { "import.meta.env.VITE_STATIC_HOST": JSON.stringify("1") },
  build: {
    outDir: "dist-static",
    emptyOutDir: true,
    rollupOptions: { input: "index.static.html" },
  },
});
