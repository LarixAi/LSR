import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Mobile-specific Vite configuration
export default defineConfig(({ mode }) => ({
  build: {
    outDir: mode === 'driver' ? 'dist-driver' : 'dist-parent',
    rollupOptions: {
      input: {
        main: mode === 'driver' || mode === 'parent' 
          ? path.resolve(__dirname, 'mobile.html')
          : path.resolve(__dirname, 'index.html')
      }
    },
    // Mobile optimizations
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
  },
  define: {
    'process.env.VITE_APP_TYPE': JSON.stringify(mode === 'driver' ? 'driver' : mode === 'parent' ? 'parent' : 'mobile'),
    'process.env.VITE_PLATFORM': JSON.stringify('mobile'),
    // Optimize for mobile
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    react({
      // Mobile optimizations
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: mode === 'driver' ? 8081 : 8082,
    hmr: {
      port: mode === 'driver' ? 24681 : 24682,
    }
  },
  // Mobile-specific optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', '@capacitor/core'],
  },
  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger'], // Remove console logs in production
  },
}));