import { defineConfig } from "vite";

export default defineConfig({
  root: "src/client",
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/events": "http://127.0.0.1:4791",
    },
  },
});
