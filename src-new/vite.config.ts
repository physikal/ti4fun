import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/ti4fun/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
});
