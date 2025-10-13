import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
