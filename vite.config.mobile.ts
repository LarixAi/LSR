import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Mobile-specific Vite configuration
export default defineConfig(({ mode }) => ({
  build: {
    outDir: mode === 'driver' ? 'dist-driver' : 'dist-parent',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  define: {
    'process.env.VITE_APP_TYPE': JSON.stringify(mode === 'driver' ? 'driver' : 'parent'),
    'process.env.VITE_PLATFORM': JSON.stringify('mobile')
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: mode === 'driver' ? 8081 : 8082,
  }
}));