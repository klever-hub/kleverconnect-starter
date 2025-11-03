import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: [
      '@klever/connect-core',
      '@klever/connect-crypto',
      '@klever/connect-encoding',
    ],
  },
  optimizeDeps: {
    exclude: [
      '@klever/connect-core',
      '@klever/connect-crypto',
      '@klever/connect-encoding',
      '@klever/connect-provider',
      '@klever/connect-contracts',
      '@klever/connect-react',
      '@klever/connect-transactions',
      '@klever/connect-wallet',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries - match any react package
          if (id.includes('/react/') && id.includes('node_modules') && !id.includes('react-router') && !id.includes('react-dom') && !id.includes('react-helmet')) {
            return 'react-core';
          }
          if (id.includes('/react-dom/') && id.includes('node_modules')) {
            return 'react-dom';
          }

          // Router and all its dependencies
          if (id.includes('/react-router') || id.includes('/@remix-run/')) {
            return 'react-router';
          }

          // SEO library and all its dependencies
          if (id.includes('/react-helmet-async')) {
            return 'seo';
          }

          // Klever SDK packages
          if (id.includes('@klever/connect-core') || id.includes('@klever/connect-provider')) {
            return 'klever-core';
          }
          if (id.includes('@klever/connect-crypto') || id.includes('@klever/connect-encoding')) {
            return 'klever-crypto';
          }
          if (id.includes('@klever/connect-contracts') || id.includes('@klever/connect-transactions')) {
            return 'klever-contracts';
          }
          if (id.includes('@klever/connect-react') || id.includes('@klever/connect-wallet')) {
            return 'klever-ui';
          }

          // Code syntax highlighter - only loaded on pages that need it
          if (id.includes('/react-syntax-highlighter')) {
            return 'syntax-highlighter';
          }

          // QR code library - only loaded when generating QR codes
          if (id.includes('/qrcode')) {
            return 'qrcode';
          }

          // All other node_modules go into vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit to 800kb (was 500kb)
    chunkSizeWarningLimit: 800,
  },
})
