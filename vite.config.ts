import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: "index.html",
        notFound: "404.html",
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
