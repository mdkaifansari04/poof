import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
  server: {
    proxy: {
      // Proxy API calls during development
      // In production, you'll need a separate Node.js backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  // Configure server middleware for dev
  configureServer: async (server) => {
    const { apiHandler } = await import('./server/api')
    server.middlewares.use(apiHandler())
  }
});

export default config;
