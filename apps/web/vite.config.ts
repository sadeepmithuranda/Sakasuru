import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// `base: "./"` keeps asset paths relative so the build works on any static host or sub-path.
export default defineConfig(({ mode }) => ({
  base: "./",
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      disable: mode === "artifact",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "සකසුරු — Sakasuru",
        short_name: "සකසුරු",
        description: "Learn money. Manage better. Build tomorrow.",
        theme_color: "#1556B8",
        background_color: "#F4F7FB",
        display: "standalone",
        start_url: ".",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
      workbox: {
        // Lessons, quizzes and calculators are bundled, so the app shell cache makes them work offline.
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 4_000_000,
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 1500 },
}));
