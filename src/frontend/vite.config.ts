import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    manifest: true
  },
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'app.app.dev.onetrueos.com'
    ],
    proxy: {
      "/api": {
        target: "http://app.app.dev.onetrueos.com:3000",
        changeOrigin: true
      },
    },
  },
});
