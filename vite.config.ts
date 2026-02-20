import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    // Préchargement des modules pour un démarrage plus rapide
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/**/*.tsx',
      ],
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Augmenter la limite d'avertissement de taille de chunk
    chunkSizeWarningLimit: 1000,

    // Minification optimale
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Supprimer console.log en production
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
      },
    },

    // Optimisation du CSS
    cssMinify: true,
    cssCodeSplit: true,

    rollupOptions: {
      output: {
        // Séparation manuelle des chunks pour un meilleur caching
        manualChunks: {
          // Vendor chunks - séparer les dépendances lourdes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          'vendor-icons': ['lucide-react'],
          'vendor-animation': ['framer-motion'],
        },
        // Nommage des chunks pour un meilleur caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Source maps pour le debugging en production (optionnel)
    sourcemap: mode === "development",

    // Optimisation du reporting
    reportCompressedSize: false, // Plus rapide en build

    // Target moderne pour un code plus petit
    target: 'es2020',
  },

  // Optimiser les dépendances pour un serveur de dev plus rapide
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react',
      'sonner',
    ],
    // Exclure les dépendances qui ne doivent pas être pré-bundlées
    exclude: ['@lovable-dev/tagger'],
  },

  // Prévisualisation
  preview: {
    port: 8080,
    host: true,
  },
}));
