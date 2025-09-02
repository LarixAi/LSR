import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const useHttps = env.VITE_USE_HTTPS !== 'false';
  
  return {
    // Set base path for assets - use relative paths for web hosting
    base: './',
    server: {
      host: "0.0.0.0",
      port: 3004,
      strictPort: true,
      https: useHttps ? {
        key: fs.readFileSync('.cert/dev.key'),
        cert: fs.readFileSync('.cert/dev.crt'),
      } : false,
      hmr: {
        port: 3004,
        protocol: useHttps ? 'wss' : 'ws'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            
            // UI libraries
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-popover'],
            'ui-components': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar', '@radix-ui/react-checkbox'],
            
            // Utility libraries
            'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
            'icons-vendor': ['lucide-react'],
            
            // Data management
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js'],
            
            // Form handling
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Charts and visualization
            'charts-vendor': ['recharts']
          }
        }
      },
      // Optimize for production
      target: 'es2015',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Ensure environment variables are available in the client
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY),
    },
  };
});
