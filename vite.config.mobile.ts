import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Mobile-specific Vite configuration
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
      build: {
    outDir: mode === 'driver' ? 'dist-driver' : 'dist-parent',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'utils-vendor': ['date-fns', 'lucide-react', 'clsx', 'tailwind-merge'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    // Optimize for mobile
    target: 'es2015',
    minify: 'esbuild',
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000
  },
    define: {
      'process.env.VITE_APP_TYPE': JSON.stringify(mode === 'driver' ? 'driver' : 'parent'),
      'process.env.VITE_PLATFORM': JSON.stringify('mobile'),
      // Use your actual backend information from .env files
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || "https://dznbihypzmvcmradijqn.supabase.co"),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo"),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || "https://dznbihypzmvcmradijqn.supabase.co"),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo"),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || "https://dznbihypzmvcmradijqn.supabase.co"),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo"),
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || "https://dznbihypzmvcmradijqn.supabase.co"),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo"),
      // Add your database configuration from .env.database
      'process.env.SUPABASE_PROJECT_REF': JSON.stringify(env.SUPABASE_PROJECT_REF || "dznbihypzmvcmradijqn"),
      'process.env.SUPABASE_HOST': JSON.stringify(env.SUPABASE_HOST || "aws-0-us-east-1.pooler.supabase.com"),
      'process.env.SUPABASE_PORT': JSON.stringify(env.SUPABASE_PORT || "6543"),
      'process.env.SUPABASE_DATABASE': JSON.stringify(env.SUPABASE_DATABASE || "postgres"),
      'process.env.SUPABASE_USER': JSON.stringify(env.SUPABASE_USER || "postgres.dznbihypzmvcmradijqn"),
      'import.meta.env.SUPABASE_PROJECT_REF': JSON.stringify(env.SUPABASE_PROJECT_REF || "dznbihypzmvcmradijqn"),
      'import.meta.env.SUPABASE_HOST': JSON.stringify(env.SUPABASE_HOST || "aws-0-us-east-1.pooler.supabase.com"),
      'import.meta.env.SUPABASE_PORT': JSON.stringify(env.SUPABASE_PORT || "6543"),
      'import.meta.env.SUPABASE_DATABASE': JSON.stringify(env.SUPABASE_DATABASE || "postgres"),
      'import.meta.env.SUPABASE_USER': JSON.stringify(env.SUPABASE_USER || "postgres.dznbihypzmvcmradijqn")
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
  };
});