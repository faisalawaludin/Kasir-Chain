import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from 'url';

import dotenv from "dotenv";
import environment from "vite-plugin-environment";

dotenv.config({ path: '../../.env' });

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },

  optimizeDeps: {
    include: [
      '@dfinity/agent',
      'buffer',
      'process',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },

  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ].filter(Boolean),

  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
      {
        find: "@",
        replacement: fileURLToPath(
          new URL("./src", import.meta.url)
        ),
      },
      
    ],
  },

     dedupe: ['@dfinity/agent'],

  build: {
    outDir: 'dist',
  }
}));
