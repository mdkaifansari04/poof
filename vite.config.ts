import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function poofApiPlugin() {
  return {
    name: "poof-api-middleware",
    async configureServer(server: any) {
      const { apiHandler } = await import("./server/api");
      server.middlewares.use(apiHandler());
    },
    async configurePreviewServer(server: any) {
      const { apiHandler } = await import("./server/api");
      server.middlewares.use(apiHandler());
    },
  };
}

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    poofApiPlugin(),
  ],
});

export default config;
