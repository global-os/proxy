import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import rewriteAll from "vite-plugin-rewrite-all";

export default defineConfig({
  build: {
    manifest: true
  },
  plugins: [
    {
      name: 'debug-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          console.log('Vite request:', req.method, req.url);
          next();
        });
      },
    },
    rewriteAll(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'app.app.dev.onetrueos.com'
    ],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",  // Changed to 127.0.0.1
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy ERROR:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '→', (options?.target ?? 'undefined') + (req?.url ?? 'undefined'));
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
  },
});