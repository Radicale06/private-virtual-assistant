import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    // The dev server sits behind nginx (musaed.pro → 127.0.0.1:13000); Vite 6
    // blocks unknown Host headers unless they're allowlisted here.
    allowedHosts: ["musaed.pro", "www.musaed.pro"],
  },
});
